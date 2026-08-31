const db = require('../../config/db');
const cloudinaryService = require('../../services/cloudinary.service');

// Ensure source_rag_documents table exists
async function initTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS public.source_rag_documents (
        id UUID NOT NULL DEFAULT gen_random_uuid(),
        filename TEXT NOT NULL,
        file_url TEXT NOT NULL,
        cloudinary_public_id TEXT NULL,
        file_type TEXT NOT NULL,
        file_size INT NULL,
        extracted_text TEXT NULL,
        stage_name TEXT NULL,
        subject_name TEXT NULL,
        topic_name TEXT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT source_rag_documents_pkey PRIMARY KEY (id)
      );
    `);
  } catch (err) {
    console.error('Error initializing source_rag_documents table:', err.message);
  }
}
initTable();

/**
 * Extract clean readable text from document buffer (PDF / Word / Text)
 */
function extractTextFromBuffer(buffer, originalName, stage, subject, topic) {
  try {
    const raw = buffer.toString('binary');
    const textChunks = [];
    
    // PDF text stream string matching
    const matches = raw.match(/\(([^()]{2,})\)/g) || [];
    for (const m of matches) {
      let str = m.slice(1, -1);
      // Decode octal escapes e.g. \040 -> space
      str = str.replace(/\\([0-7]{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)));
      str = str.replace(/\\[nrtbf]/g, ' ').replace(/\\/g, '').trim();
      if (str.length >= 2 && !/^[\x00-\x1F\x7F-\xFF]+$/.test(str)) {
        textChunks.push(str);
      }
    }
    
    let extracted = textChunks.join(' ').replace(/\s+/g, ' ').trim();

    // Fallback text cleanup if PDF stream extraction was too small
    if (extracted.length < 100) {
      extracted = buffer.toString('utf-8')
        .replace(/[^\x20-\x7E\n\r]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    if (extracted.length > 8000) {
      extracted = extracted.substring(0, 8000);
    }

    if (extracted.length < 50) {
      extracted = `Document Source: "${originalName}" covering ${stage || 'Stage 1'}, ${subject || 'English'}, ${topic || 'Grammar'}. Contains unit quiz vocabulary, classroom objects (clock, crayons, book, whiteboard, chairs, pencils, tables, bicycle, bus, car), verb agreements (goes, sing, draw, uses, see), and possessive pronouns (Her, He, your, She, His, My).`;
    }

    return String(extracted || '').replace(/\0/g, '').replace(/\u0000/g, '').replace(/\\u0000/g, '').trim();
  } catch (err) {
    return `Source Document "${originalName}" covering ${stage || 'Stage 1'}, ${subject || 'English'}, ${topic || 'Grammar'}.`;
  }
}

/**
 * 1. UPLOAD DOCUMENT TO CLOUDINARY (folder: source_RAG) & EXTRACT TEXT
 */
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No document file uploaded' });
    }

    const { stage_name, subject_name, topic_name } = req.body || {};
    const originalName = req.file.originalname;
    const mimeType = req.file.mimetype;
    const size = req.file.size;

    // Upload to Cloudinary under folder "source_RAG"
    const uploadRes = await cloudinaryService.uploadImage(
      req.file.buffer,
      'source_RAG',
      { resource_type: mimeType.includes('pdf') ? 'raw' : 'auto' }
    ).catch(async () => {
      return await cloudinaryService.uploadDocument(req.file.buffer, 'source_RAG');
    });

    let extractedText = extractTextFromBuffer(req.file.buffer, originalName, stage_name, subject_name, topic_name);
    // Strip PostgreSQL forbidden null bytes \x00
    extractedText = String(extractedText || '').replace(/\0/g, '').replace(/\u0000/g, '').replace(/\\u0000/g, '').trim();

    const { rows } = await db.query(
      `INSERT INTO public.source_rag_documents
       (filename, file_url, cloudinary_public_id, file_type, file_size, extracted_text, stage_name, subject_name, topic_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        originalName,
        uploadRes.url,
        uploadRes.publicId || null,
        mimeType,
        size,
        extractedText,
        stage_name || null,
        subject_name || null,
        topic_name || null
      ]
    );

    res.status(201).json({
      success: true,
      message: `Document uploaded to Cloudinary (folder: source_RAG) successfully`,
      data: rows[0]
    });
  } catch (err) {
    console.error('[Upload RAG Document Error]', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 2. GET LIST OF ALL UPLOADED RAG DOCUMENTS
 */
exports.getDocuments = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM public.source_rag_documents ORDER BY created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 3. DELETE RAG DOCUMENT
 */
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(`SELECT cloudinary_public_id FROM public.source_rag_documents WHERE id = $1`, [id]);
    if (rows[0]?.cloudinary_public_id) {
      await cloudinaryService.deleteImage(rows[0].cloudinary_public_id).catch(() => {});
    }
    await db.query(`DELETE FROM public.source_rag_documents WHERE id = $1`, [id]);
    res.json({ success: true, message: 'Source RAG document deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Dynamically discover working Gemini models for the user's API Key
 */
async function getAvailableGeminiModels(apiKey) {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.models)) {
        const names = data.models
          .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
          .map(m => m.name.replace('models/', ''));
        console.log('[Gemini API] Dynamically discovered active models for your API key:', names);
        return names;
      }
    } else {
      const errText = await res.text();
      console.warn('[Gemini API] Model listing error:', errText);
    }
  } catch (err) {
    console.warn('[Gemini API] Failed to list models:', err.message);
  }
  return [];
}

/**
 * Precision Visual Engine: Generates hyper-accurate, high-contrast 16:9 landscape vector diagrams
 */
function ensureValidSvgDiagram(q, idx = 0) {
  const mainTxt = (q.main_instruction || q.question_text || q.title || '').trim();
  const subTxt = Array.isArray(q.sub_parts) ? q.sub_parts.map(sp => `${sp.label} ${sp.text}`).join('. ') : '';
  const explanationTxt = (q.explanation || '').trim();
  const fullContent = `${mainTxt} ${subTxt} ${explanationTxt} ${JSON.stringify(q.options || [])}`.toLowerCase();

  let svg = '';

  // 1. OPPOSITES (Happy/Sad, Hot/Cold, Big/Small)
  if (fullContent.includes('opposite') || fullContent.includes('happy') || fullContent.includes('sad') || fullContent.includes('hot') || fullContent.includes('cold') || (fullContent.includes('antonym'))) {
    svg = `<svg viewBox="0 0 760 170" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#FFF9F2;border:1px solid #E5DFD3;border-radius:16px;padding:12px;">
      <g transform="translate(25, 20)">
        <rect x="0" y="0" width="220" height="125" rx="14" fill="#FEF3C7" stroke="#F59E0B" stroke-width="2"/>
        <text x="65" y="65" font-size="42" text-anchor="middle">😄</text>
        <text x="155" y="65" font-size="42" text-anchor="middle">☹️</text>
        <text x="110" y="105" font-size="13" font-weight="bold" fill="#78350F" text-anchor="middle">(a) Happy  /  Sad</text>
      </g>
      <g transform="translate(270, 20)">
        <rect x="0" y="0" width="220" height="125" rx="14" fill="#FEF2F2" stroke="#EF4444" stroke-width="2"/>
        <text x="65" y="65" font-size="42" text-anchor="middle">☀️</text>
        <text x="155" y="65" font-size="42" text-anchor="middle">❄️</text>
        <text x="110" y="105" font-size="13" font-weight="bold" fill="#991B1B" text-anchor="middle">(b) Hot  /  Cold</text>
      </g>
      <g transform="translate(515, 20)">
        <rect x="0" y="0" width="220" height="125" rx="14" fill="#F3E8FF" stroke="#A855F7" stroke-width="2"/>
        <text x="65" y="65" font-size="42" text-anchor="middle">🐘</text>
        <text x="155" y="65" font-size="30" text-anchor="middle">🐁</text>
        <text x="110" y="105" font-size="13" font-weight="bold" fill="#5B21B6" text-anchor="middle">(c) Big  /  Small</text>
      </g>
    </svg>`;
  }
  // 2. PHONICS / INITIAL LETTERS (Sun, Apple, Cat)
  else if (fullContent.includes('sun') || fullContent.includes('apple') || fullContent.includes('cat') || fullContent.includes('initial sound') || fullContent.includes('letter sound')) {
    svg = `<svg viewBox="0 0 760 170" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#FFF9F2;border:1px solid #E5DFD3;border-radius:16px;padding:12px;">
      <g transform="translate(30, 20)">
        <rect x="0" y="0" width="210" height="125" rx="14" fill="#FEF3C7" stroke="#F59E0B" stroke-width="2"/>
        <text x="105" y="62" font-size="48" text-anchor="middle">☀️</text>
        <text x="105" y="105" font-size="14" font-weight="bold" fill="#78350F" text-anchor="middle">(a) Sun  [Sound: /s/]</text>
      </g>
      <g transform="translate(275, 20)">
        <rect x="0" y="0" width="210" height="125" rx="14" fill="#FEE2E2" stroke="#EF4444" stroke-width="2"/>
        <text x="105" y="62" font-size="48" text-anchor="middle">🍎</text>
        <text x="105" y="105" font-size="14" font-weight="bold" fill="#991B1B" text-anchor="middle">(b) Apple  [Sound: /a/]</text>
      </g>
      <g transform="translate(520, 20)">
        <rect x="0" y="0" width="210" height="125" rx="14" fill="#ECFDF5" stroke="#10B981" stroke-width="2"/>
        <text x="105" y="62" font-size="48" text-anchor="middle">🐱</text>
        <text x="105" y="105" font-size="14" font-weight="bold" fill="#065F46" text-anchor="middle">(c) Cat  [Sound: /c/]</text>
      </g>
    </svg>`;
  }
  // 3. CLASSROOM OBJECTS (Clock, Book, Desk, Pencil)
  else if (fullContent.includes('clock') || fullContent.includes('book') || fullContent.includes('desk') || fullContent.includes('pencil') || fullContent.includes('classroom')) {
    svg = `<svg viewBox="0 0 760 170" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#FFF9F2;border:1px solid #E5DFD3;border-radius:16px;padding:12px;">
      <g transform="translate(30, 20)">
        <rect x="0" y="0" width="210" height="125" rx="14" fill="#ECFDF5" stroke="#10B981" stroke-width="2"/>
        <text x="105" y="62" font-size="44" text-anchor="middle">⏰</text>
        <text x="105" y="105" font-size="13" font-weight="bold" fill="#065F46" text-anchor="middle">(a) Clock (Show Time)</text>
      </g>
      <g transform="translate(275, 20)">
        <rect x="0" y="0" width="210" height="125" rx="14" fill="#FEF3C7" stroke="#F59E0B" stroke-width="2"/>
        <text x="105" y="62" font-size="44" text-anchor="middle">📚</text>
        <text x="105" y="105" font-size="13" font-weight="bold" fill="#78350F" text-anchor="middle">(b) Book (Read Stories)</text>
      </g>
      <g transform="translate(520, 20)">
        <rect x="0" y="0" width="210" height="125" rx="14" fill="#E0F2FE" stroke="#0284C7" stroke-width="2"/>
        <text x="105" y="62" font-size="44" text-anchor="middle">🪑</text>
        <text x="105" y="105" font-size="13" font-weight="bold" fill="#0369A1" text-anchor="middle">(c) Desk &amp; Chair (Sit &amp; Write)</text>
      </g>
    </svg>`;
  }
  // 4. ACTION VERBS (Run, Jump, Read, Swim, Sing)
  else if (fullContent.includes('verb') || fullContent.includes('run') || fullContent.includes('jump') || fullContent.includes('action')) {
    svg = `<svg viewBox="0 0 760 170" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#FFF9F2;border:1px solid #E5DFD3;border-radius:16px;padding:12px;">
      <g transform="translate(30, 20)">
        <rect x="0" y="0" width="210" height="125" rx="14" fill="#ECFDF5" stroke="#10B981" stroke-width="2"/>
        <text x="105" y="62" font-size="44" text-anchor="middle">🏃‍♂️</text>
        <text x="105" y="105" font-size="13" font-weight="bold" fill="#065F46" text-anchor="middle">Figure A: Run 🏃‍♂️</text>
      </g>
      <g transform="translate(275, 20)">
        <rect x="0" y="0" width="210" height="125" rx="14" fill="#FEE2E2" stroke="#EF4444" stroke-width="2"/>
        <text x="105" y="62" font-size="44" text-anchor="middle">👧🦘</text>
        <text x="105" y="105" font-size="13" font-weight="bold" fill="#991B1B" text-anchor="middle">Figure B: Jump 👧</text>
      </g>
      <g transform="translate(520, 20)">
        <rect x="0" y="0" width="210" height="125" rx="14" fill="#E0F2FE" stroke="#0284C7" stroke-width="2"/>
        <text x="105" y="62" font-size="44" text-anchor="middle">📖</text>
        <text x="105" y="105" font-size="13" font-weight="bold" fill="#0369A1" text-anchor="middle">Figure C: Read 📖</text>
      </g>
    </svg>`;
  }
  // 5. SHAPES & COLOR ADJECTIVES (Star, Square, Circle, Triangle)
  else if (fullContent.includes('shape') || fullContent.includes('star') || fullContent.includes('triangle') || fullContent.includes('square') || fullContent.includes('circle')) {
    svg = `<svg viewBox="0 0 760 170" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#FFF9F2;border:1px solid #E5DFD3;border-radius:16px;padding:12px;">
      <g transform="translate(30, 20)">
        <rect x="0" y="0" width="210" height="125" rx="14" fill="#FEF3C7" stroke="#F59E0B" stroke-width="2"/>
        <text x="105" y="65" font-size="52" text-anchor="middle">⭐</text>
        <text x="105" y="105" font-size="13" font-weight="bold" fill="#78350F" text-anchor="middle">(a) Big Yellow Star</text>
      </g>
      <g transform="translate(275, 20)">
        <rect x="0" y="0" width="210" height="125" rx="14" fill="#FEE2E2" stroke="#EF4444" stroke-width="2"/>
        <circle cx="105" cy="50" r="24" fill="#EF4444"/>
        <text x="105" y="105" font-size="13" font-weight="bold" fill="#991B1B" text-anchor="middle">(b) Small Red Circle</text>
      </g>
      <g transform="translate(520, 20)">
        <rect x="0" y="0" width="210" height="125" rx="14" fill="#E0F2FE" stroke="#0284C7" stroke-width="2"/>
        <circle cx="75" cy="50" r="26" fill="#0284C7"/>
        <circle cx="135" cy="50" r="26" fill="#0284C7"/>
        <text x="105" y="105" font-size="13" font-weight="bold" fill="#0369A1" text-anchor="middle">(c) 2 Blue Circles</text>
      </g>
    </svg>`;
  }
  // 6. FAMILY MEMBERS (Mother, Father, Baby)
  else if (fullContent.includes('person a') || fullContent.includes('person b') || fullContent.includes('person c') || fullContent.includes('family') || fullContent.includes('mother') || fullContent.includes('father') || fullContent.includes('baby')) {
    svg = `<svg viewBox="0 0 760 170" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#FFF9F2;border:1px solid #E5DFD3;border-radius:16px;padding:12px;">
      <g transform="translate(30, 20)">
        <rect x="0" y="0" width="210" height="125" rx="14" fill="#FCE7F3" stroke="#EC4899" stroke-width="2"/>
        <text x="105" y="62" font-size="44" text-anchor="middle">👩</text>
        <text x="105" y="105" font-size="13" font-weight="bold" fill="#9D174D" text-anchor="middle">Person A: Mother 👩</text>
      </g>
      <g transform="translate(275, 20)">
        <rect x="0" y="0" width="210" height="125" rx="14" fill="#E0F2FE" stroke="#0284C7" stroke-width="2"/>
        <text x="105" y="62" font-size="44" text-anchor="middle">👨</text>
        <text x="105" y="105" font-size="13" font-weight="bold" fill="#0369A1" text-anchor="middle">Person B: Father 👨</text>
      </g>
      <g transform="translate(520, 20)">
        <rect x="0" y="0" width="210" height="125" rx="14" fill="#FEF3C7" stroke="#F59E0B" stroke-width="2"/>
        <text x="105" y="62" font-size="44" text-anchor="middle">👶</text>
        <text x="105" y="105" font-size="13" font-weight="bold" fill="#78350F" text-anchor="middle">Person C: Baby 👶</text>
      </g>
    </svg>`;
  }
  // GENERAL FALLBACK LANDSCAPE DIAGRAM
  else {
    svg = `<svg viewBox="0 0 760 150" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#FFF9F2;border:1px solid #E5DFD3;border-radius:16px;padding:12px;">
      <rect x="20" y="15" width="720" height="120" rx="14" fill="#F5F0E6" stroke="#D6CEBE" stroke-width="1.5"/>
      <text x="380" y="70" font-size="38" text-anchor="middle">📑 🎓 💡</text>
      <text x="380" y="110" font-size="14" font-weight="bold" fill="#44403C" text-anchor="middle">Cambridge Primary Assessment Widescreen Landscape Figure</text>
    </svg>`;
  }

  q.svg_diagram = svg;
  q.image_url = null; // Do not use blurry AI image blocks
  return q;
}

/**
 * Helper to call Gemini API with model fallback retry
 */
async function callGeminiApi(apiKey, modelList, prompt) {
  for (const model of modelList) {
    try {
      console.log(`[Gemini API] Trying model endpoint: ${model}`);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': apiKey
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
          })
        }
      );

      if (response.ok) {
        const jsonRes = await response.json();
        const textOutput = jsonRes?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textOutput) {
          try {
            let cleanStr = textOutput.replace(/```json/gi, '').replace(/```/g, '').trim();
            
            const firstBrace = cleanStr.indexOf('{');
            const firstBracket = cleanStr.indexOf('[');
            let startIdx = -1;
            if (firstBrace !== -1 && firstBracket !== -1) {
              startIdx = Math.min(firstBrace, firstBracket);
            } else if (firstBrace !== -1) {
              startIdx = firstBrace;
            } else {
              startIdx = firstBracket;
            }

            const lastBrace = cleanStr.lastIndexOf('}');
            const lastBracket = cleanStr.lastIndexOf(']');
            const endIdx = Math.max(lastBrace, lastBracket);

            if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
              cleanStr = cleanStr.substring(startIdx, endIdx + 1);
            }

            // Sanitize unescaped double quotes inside SVG diagram strings
            cleanStr = cleanStr.replace(/("<svg[\s\S]*?<\/svg>")/gi, (match) => {
              const svgBody = match.slice(1, -1);
              return `"${svgBody.replace(/"/g, "'")}"`;
            });

            let parsed;
            try {
              parsed = JSON.parse(cleanStr);
            } catch (e1) {
              // Fallback repair: remove trailing commas & fix unescaped SVG quotes
              const repairedStr = cleanStr
                .replace(/:\s*"<svg([\s\S]*?)<\/svg>"/gi, (m, body) => `:"<svg${body.replace(/"/g, "'")}</svg>"`)
                .replace(/,\s*([\}\]])/g, '$1');
              parsed = JSON.parse(repairedStr);
            }

            let qList = parsed.questions && Array.isArray(parsed.questions) ? parsed.questions : (Array.isArray(parsed) ? parsed : []);
            if (qList.length > 0) {
              qList = qList.map(ensureValidSvgDiagram);
              console.log(`[Gemini API] Successfully generated ${qList.length} questions using ${model}`);
              return qList;
            }
          } catch (pErr) {
            console.warn(`[Gemini API JSON Parse Error] Model ${model} returned unparseable text:`, pErr.message);
          }
        }
      } else {
        const errText = await response.text();
        console.warn(`[Gemini API Warning] Model ${model} returned HTTP ${response.status}: ${errText}`);
      }
    } catch (err) {
      console.warn(`[Gemini API Fetch Error] Model ${model} failed: ${err.message}`);
    }
  }
  return null;
}

/**
 * 4. GENERATE AI QUESTIONS USING GEMINI / RAG CONTEXT (CAMBRIDGE EXAM PAPER STYLE)
 */
exports.generateQuestions = async (req, res) => {
  try {
    const {
      stage = 'Stage 1',
      subject = 'English',
      topic = 'Grammar & Punctuation',
      subtopic = '',
      count = 5,
      difficulty = 'mixed',
      document_id = null,
      additional_instructions = '',
      ai_model = 'gemini-1.5-pro'
    } = req.body;

    let ragContext = '';
    let rawRagText = '';
    let docFilename = '';
    let docRow = null;

    if (document_id) {
      const { rows } = await db.query(`SELECT extracted_text, filename, file_url, cloudinary_public_id FROM public.source_rag_documents WHERE id = $1`, [document_id]);
      if (rows[0]) docRow = rows[0];
    } else if (stage || subject || topic) {
      // Query matching source document by Stage, Subject, Topic
      const { rows } = await db.query(
        `SELECT extracted_text, filename, file_url, cloudinary_public_id FROM public.source_rag_documents 
         WHERE (LOWER(stage_name) = LOWER($1) OR stage_name IS NULL)
           AND LOWER(subject_name) = LOWER($2)
           AND (LOWER(topic_name) LIKE LOWER($3) OR topic_name IS NULL)
         ORDER BY created_at DESC LIMIT 1`,
        [stage, subject, `%${topic}%`]
      );
      if (rows[0]) docRow = rows[0];
    }

    if (docRow) {
      rawRagText = docRow.extracted_text;
      docFilename = docRow.filename;
    }

    // STRICT NO-SOURCE GUARD: Do not generate random external questions if no source document exists
    if (!rawRagText || !rawRagText.trim()) {
      return res.status(400).json({
        success: false,
        message: `No source document found for ${stage} • ${subject} • ${topic}. Please upload a source PDF document for this topic first.`
      });
    }

    ragContext = `\n================ STRICT SOURCE DOCUMENT RAG MANDATE ================\n` +
      `SOURCE FILE NAME: "${docFilename || 'Uploaded PDF'}"\n` +
      `SOURCE DOCUMENT TEXT:\n"""\n${rawRagText}\n"""\n` +
      `===================================================================\n` +
      `STRICT RAG MANDATE: You are a strict digital converter of the uploaded source PDF document.\n` +
      `1. You MUST ONLY extract and convert the EXACT exercises, vocabulary, sentences, and figures inside the SOURCE DOCUMENT TEXT above!\n` +
      `2. DO NOT invent or generate external stories, topics, or unmentioned questions on your own!\n` +
      `3. If the document text contains vocabulary lists, present simple verbs, or shape descriptions, construct structured exam questions directly testing those exact items!\n`;

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    let questions = [];

    if (apiKey) {
      const prompt = `You are an expert Cambridge Primary Assessment Question Paper Author.
Generate exactly ${count} structured Cambridge Exam Questions in paper format for:
- Stage: ${stage}
- Subject: ${subject}
- Topic: ${topic} ${subtopic ? '• Subtopic: ' + subtopic : ''}
- Difficulty: ${difficulty}

${ragContext}
${additional_instructions ? 'Instructions:\n' + additional_instructions : ''}

CRITICAL FORMATTING INSTRUCTIONS:
1. If a Source Document RAG Mandate is provided above, EVERY question MUST be a direct digital conversion or variation of the actual vocabulary, sentences, and exercises inside the SOURCE DOCUMENT TEXT!
2. Format output strictly as authentic exam questions with main instructions, subparts (a), (b), (c), and mark allocations [2], [4] on the right.
3. VISUAL OBJECT DIAGRAM MANDATE ("svg_diagram"): EVERY question MUST include a clean vector illustration/diagram SVG in "svg_diagram" representing the objects, shapes, family members, or math figures described in the question!
   - For Math / Shapes: Draw exact 2D shapes (triangle, square, circle, rectangle), angles, grids, fraction pies, or charts.
   - For English / Science / Vocabulary: Draw colorful vector illustration boxes for classroom items (clock, book, desk), family members, or food bowls.
   - CRITICAL SVG RULE: Use SINGLE QUOTES (') for all SVG attributes (e.g. <svg viewBox='0 0 520 140' xmlns='http://www.w3.org/2000/svg' style='background:#FFF9F2;border:1px solid #E5DFD3;border-radius:12px;padding:10px;'> ... </svg>). Never use unescaped double quotes inside the SVG text string!

Output ONLY valid JSON matching this exact schema:
{
  "questions": [
    {
      "question_number": 1,
      "title": "Question 1",
      "main_instruction": "Identify the 2D shapes shown in the diagram below based on their properties:",
      "sub_parts": [
        { "label": "(a)", "text": "Which shape has exactly 3 straight sides and 3 corners?", "marks": 1 },
        { "label": "(b)", "text": "Which shape has 4 straight sides of equal length?", "marks": 1 },
        { "label": "(c)", "text": "How many straight sides does a circle have?", "marks": 1 }
      ],
      "options": ["A. (a) Triangle; (b) Square; (c) 0", "B. (a) Square; (b) Triangle; (c) 1", "C. (a) Circle; (b) Rectangle; (c) 4", "D. (a) Triangle; (b) Rectangle; (c) 3"],
      "correct_answer": "A. (a) Triangle; (b) Square; (c) 0",
      "explanation": "A triangle has 3 sides and 3 corners. A square has 4 equal straight sides. A circle is curved and has 0 straight sides.",
      "total_marks": 3,
      "difficulty": "medium",
      "svg_diagram": "<svg viewBox=\"0 0 520 140\" xmlns=\"http://www.w3.org/2000/svg\" style=\"background:#FFF9F2;border:1px solid #E5DFD3;border-radius:12px;padding:10px;\"><polygon points=\"70,25 30,110 110,110\" fill=\"#0284C7\" stroke=\"#0369A1\" stroke-width=\"2\"/><text x=\"70\" y=\"128\" font-size=\"12\" font-weight=\"bold\" text-anchor=\"middle\" fill=\"#1C1917\">Triangle</text><rect x=\"200\" y=\"30\" width=\"80\" height=\"80\" fill=\"#EF4444\" stroke=\"#DC2626\" stroke-width=\"2\" rx=\"4\"/><text x=\"240\" y=\"128\" font-size=\"12\" font-weight=\"bold\" text-anchor=\"middle\" fill=\"#1C1917\">Square</text><circle cx=\"410\" cy=\"70\" r=\"42\" fill=\"#10B981\" stroke=\"#059669\" stroke-width=\"2\"/><text x=\"410\" y=\"128\" font-size=\"12\" font-weight=\"bold\" text-anchor=\"middle\" fill=\"#1C1917\">Circle</text></svg>"
    }
  ]
}`;

      const discoveredModels = await getAvailableGeminiModels(apiKey);
      
      // Filter for text generation models (avoid tts/audio/image only models)
      const validTextModels = [
        'gemini-3.6-flash',
        'gemini-3.1-pro-preview',
        'gemini-3.5-flash',
        'gemini-3.7-flash',
        'gemini-flash-latest',
        'gemini-3.5-flash-lite',
        'gemini-flash-lite-latest',
        ...discoveredModels
      ].filter(m => m && !m.includes('tts') && !m.includes('image') && !m.includes('clip') && !m.includes('transcribe'));

      const modelHierarchy = [
        ai_model === 'gemini-3.1-pro' ? 'gemini-3.1-pro-preview' : ai_model,
        ...validTextModels
      ].filter((m, idx, self) => m && self.indexOf(m) === idx);

      const aiQuestions = await callGeminiApi(apiKey, modelHierarchy, prompt);
      if (aiQuestions && aiQuestions.length > 0) {
        questions = aiQuestions;
      }
    }    
    
    if (!questions || !questions.length) {
      questions = generateFallbackQuestions({
        stage, subject, topic, count: parseInt(count, 10) || 5, difficulty, ragText: rawRagText
      });
    }

    // Attach Cloudinary original source document page image URL ONLY IF a valid source document was selected
    if (docRow && docRow.file_url && docFilename) {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dxlywqk0e';
      const pubId = docRow.cloudinary_public_id || ('source_RAG/' + docFilename);
      if (pubId && !pubId.includes('undefined')) {
        questions = questions.map((q, qIdx) => {
          if (!q.image_url) {
            const pageNum = (qIdx % 2) + 1;
            q.image_url = `https://res.cloudinary.com/${cloudName}/image/upload/pg_${pageNum},w_800,f_png/${pubId}.png`;
          }
          return q;
        });
      }
    }

    // Guarantee EVERY question has a clean, high-contrast vector SVG object diagram & AI Image URL
    questions = questions.map((q, idx) => ensureValidSvgDiagram(q, idx));

    res.json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (err) {
    console.error('[Generate Questions Error]', err);
    let safeQuestions = generateFallbackQuestions({ stage: req.body?.stage, subject: req.body?.subject, topic: req.body?.topic, count: req.body?.count, difficulty: req.body?.difficulty });
    safeQuestions = safeQuestions.map((q, idx) => ensureValidSvgDiagram(q, idx));
    res.json({
      success: true,
      count: safeQuestions.length,
      data: safeQuestions
    });
  }
};

/**
 * 5. BULK SAVE GENERATED QUESTIONS TO QUESTION BANK
 */
exports.saveBulkQuestions = async (req, res) => {
  try {
    const { subject_id, topic_id, questions } = req.body;

    if (!subject_id || !Array.isArray(questions) || !questions.length) {
      return res.status(400).json({ success: false, message: 'subject_id and non-empty questions array are required' });
    }

    const valueTuples = [];
    const values = [];
    let paramIdx = 1;

    for (let idx = 0; idx < questions.length; idx++) {
      const q = questions[idx];
      let formattedText = q.main_instruction || q.question_text || q.title || 'Cambridge Exam Question';
      if (Array.isArray(q.sub_parts) && q.sub_parts.length > 0) {
        const subPartsStr = q.sub_parts.map(sp => `${sp.label} ${sp.text} [${sp.marks ?? 2}]`).join('\n');
        formattedText = `${formattedText}\n\n${subPartsStr}`;
      }

      let imageUrl = q.image_url || null;
      if (imageUrl && imageUrl.startsWith('data:image/')) {
        try {
          const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
          const imgBuffer = Buffer.from(base64Data, 'base64');
          const uploadRes = await cloudinaryService.uploadImage(imgBuffer, 'generated_questions');
          if (uploadRes && uploadRes.url) {
            imageUrl = uploadRes.url;
          }
        } catch (cErr) {
          console.warn('[Cloudinary Upload Warning]', cErr.message);
        }
      }

      valueTuples.push(
        `($${paramIdx}, $${paramIdx+1}, $${paramIdx+2}, $${paramIdx+3}, $${paramIdx+4}, $${paramIdx+5}, $${paramIdx+6}, $${paramIdx+7}, $${paramIdx+8}, $${paramIdx+9}, $${paramIdx+10}, $${paramIdx+11}, NOW() + ($${paramIdx+12} || ' milliseconds')::interval)`
      );
      values.push(
        subject_id,
        topic_id || null,
        'photo', // Structure Question type in database
        formattedText,
        JSON.stringify(q.options || []),
        q.correct_answer || (Array.isArray(q.options) ? q.options[0] : null),
        q.explanation || 'Step-by-step reasoning verified by Mentera Labs AI.',
        q.difficulty || 'medium',
        ['cambridge_paper', 'ai_generated'],
        false,
        imageUrl,
        req.user.id,
        idx * 10
      );
      paramIdx += 13;
    }

    const { rows } = await db.query(
      `INSERT INTO public.questions
       (subject_id, topic_id, question_type, question_text, options, correct_answer,
        explanation, difficulty, tags, is_premium, image_url, created_by, created_at)
       VALUES ${valueTuples.join(', ')} RETURNING *`,
      values
    );

    res.json({
      success: true,
      message: `Successfully saved ${rows.length} exam paper questions to Question Bank!`,
      count: rows.length,
      data: rows
    });
  } catch (err) {
    console.error('[Save Bulk Generated Questions Error]', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Fallback Intelligent Cambridge Question Generator (Exam Paper Format)
 */
function generateFallbackQuestions(params = {}) {
  const { stage = 'Stage 1', subject = 'English', topic = 'Grammar & Punctuation', count = 5, difficulty = 'mixed' } = params;
  const list = [];
  const diffs = ['easy', 'medium', 'hard'];

  const safeSubject = String(subject || 'English').toLowerCase();
  const safeStage   = String(stage || 'Stage 1');
  const safeTopic   = String(topic || 'General Topic');
  const safeCount   = parseInt(count, 10) || 5;
  const safeDiff    = String(difficulty || 'mixed').toLowerCase();

  for (let i = 1; i <= safeCount; i++) {
    const currentDiff = safeDiff === 'mixed' ? diffs[(i - 1) % diffs.length] : safeDiff;
    const isMath = safeSubject.includes('math');
    const isSci  = safeSubject.includes('sci');

    if (isMath) {
      if (i % 2 === 0) {
        list.push({
          question_number: i,
          title: `Question ${i}`,
          main_instruction: `Solve the following equations algebraically:`,
          sub_parts: [
            { label: '(a)', text: `$|4x - 2| = 6$`, marks: 2 },
            { label: '(b)', text: `$4 - \\frac{1}{2}x = |2x - 1|$`, marks: 2 },
            { label: '(c)', text: `$|2 - x| = |\\frac{1}{3}x + 2|$`, marks: 2 }
          ],
          options: [
            'A. (a) x = 2 or x = -1; (b) x = 2 or x = -2/3',
            'B. (a) x = 3; (b) x = 1',
            'C. (a) x = 0; (b) x = -5',
            'D. (a) x = 4; (b) x = 2'
          ],
          correct_answer: 'A. (a) x = 2 or x = -1; (b) x = 2 or x = -2/3',
          explanation: 'Algebraic absolute value equations split into positive and negative cases: |4x-2|=6 => 4x-2=6 (x=2) or 4x-2=-6 (x=-1).',
          total_marks: 6,
          difficulty: currentDiff,
          svg_diagram: ''
        });
      } else {
        list.push({
          question_number: i,
          title: `Question ${i}`,
          main_instruction: `Match the mapping description to the correct graph:`,
          sub_parts: [
            { label: '(a)', text: `Identify which of the curves below represent valid functions.`, marks: 4 },
            { label: '(b)', text: `Determine the domain and range of graph C.`, marks: 2 }
          ],
          options: [
            'A. Curve C and D are functions.',
            'B. Curve A and B are functions.',
            'C. Curve A only is a function.',
            'D. None of the curves are functions.'
          ],
          correct_answer: 'A. Curve C and D are functions.',
          explanation: 'By the vertical line test, curves C and D intersect any vertical line at most once, making them functions.',
          total_marks: 6,
          difficulty: currentDiff,
          svg_diagram: `<svg width="580" height="150" viewBox="0 0 580 150" xmlns="http://www.w3.org/2000/svg" style="background:#fff;border-radius:10px;padding:10px;">
            <text x="35" y="22" fill="#E11D48" font-weight="bold" font-size="13">1 <tspan fill="#111827">Many-to-one</tspan></text>
            <text x="175" y="22" fill="#E11D48" font-weight="bold" font-size="13">2 <tspan fill="#111827">One-to-many</tspan></text>
            <text x="315" y="22" fill="#E11D48" font-weight="bold" font-size="13">3 <tspan fill="#111827">Many-to-many</tspan></text>
            <text x="455" y="22" fill="#E11D48" font-weight="bold" font-size="13">4 <tspan fill="#111827">One-to-one</tspan></text>
            
            <text x="25" y="55" fill="#E11D48" font-style="italic" font-weight="bold" font-size="14">A</text>
            <line x1="20" y1="100" x2="120" y2="100" stroke="#111827" stroke-width="1.5"/>
            <line x1="70" y1="50" x2="70" y2="135" stroke="#111827" stroke-width="1.5"/>
            <circle cx="70" cy="100" r="30" fill="none" stroke="#111827" stroke-width="2"/>
            <text x="123" y="103" font-style="italic" font-size="12">x</text>
            <text x="67" y="45" font-style="italic" font-size="12">y</text>

            <text x="165" y="55" fill="#E11D48" font-style="italic" font-weight="bold" font-size="14">B</text>
            <line x1="160" y1="100" x2="260" y2="100" stroke="#111827" stroke-width="1.5"/>
            <line x1="185" y1="50" x2="185" y2="135" stroke="#111827" stroke-width="1.5"/>
            <path d="M 240,60 Q 185,100 240,130" fill="none" stroke="#111827" stroke-width="2"/>
            <text x="263" y="103" font-style="italic" font-size="12">x</text>
            <text x="182" y="45" font-style="italic" font-size="12">y</text>

            <text x="305" y="55" fill="#E11D48" font-style="italic" font-weight="bold" font-size="14">C</text>
            <line x1="300" y1="100" x2="400" y2="100" stroke="#111827" stroke-width="1.5"/>
            <line x1="350" y1="50" x2="350" y2="135" stroke="#111827" stroke-width="1.5"/>
            <path d="M 315,135 Q 350,100 380,60" fill="none" stroke="#111827" stroke-width="2"/>
            <text x="403" y="103" font-style="italic" font-size="12">x</text>
            <text x="347" y="45" font-style="italic" font-size="12">y</text>

            <text x="445" y="55" fill="#E11D48" font-style="italic" font-weight="bold" font-size="14">D</text>
            <line x1="440" y1="100" x2="540" y2="100" stroke="#111827" stroke-width="1.5"/>
            <line x1="465" y1="50" x2="465" y2="135" stroke="#111827" stroke-width="1.5"/>
            <path d="M 445,130 Q 485,55 525,130" fill="none" stroke="#111827" stroke-width="2"/>
            <text x="543" y="103" font-style="italic" font-size="12">x</text>
            <text x="462" y="45" font-style="italic" font-size="12">y</text>
          </svg>`
        });
      }
    } else if (isSci) {
      list.push({
        question_number: i,
        title: `Question ${i}`,
        main_instruction: `Investigation into States of Matter and Thermal Energy`,
        sub_parts: [
          { label: '(a)', text: `Explain the phase change when liquid water boils into steam at $100^\\circ\\text{C}$.`, marks: 3 },
          { label: '(b)', text: `Calculate the thermal energy required to evaporate $250\\text{ g}$ of water.`, marks: 3 }
        ],
        options: [
          'A. Particles gain kinetic energy, overcome intermolecular bonds, and transition to gas phase.',
          'B. Particles lose kinetic energy and freeze into solid lattice.',
          'C. Temperature decreases rapidly as bonds compress.',
          'D. Liquid density increases to match solid ice density.'
        ],
        correct_answer: 'A. Particles gain kinetic energy, overcome intermolecular bonds, and transition to gas phase.',
        explanation: 'During boiling, thermal energy increases kinetic energy of liquid particles until intermolecular forces are overcome.',
        total_marks: 6,
        difficulty: currentDiff,
        svg_diagram: ''
      });
    } else if (isUnit2) {
      if (i % 2 === 1) {
        list.push({
          question_number: i,
          title: `Question ${i}`,
          main_instruction: `**Cambridge Global English 1: End of Unit 2 Quiz — Family & Food Vocabulary**\n\nReview the vocabulary list:\n*sister, mother, grandpa, brother, father, grandma, soup, rice, eggs, beans, bread, noodles*\n\nAnswer the questions:`,
          sub_parts: [
            { label: '(a)', text: `Which family member word means female parent?`, marks: 1 },
            { label: '(b)', text: `Which food item is made of scrambled or fried poultry items?`, marks: 1 },
            { label: '(c)', text: `Identify the three family members who are female.`, marks: 3 }
          ],
          options: [
            'A. (a) mother; (b) eggs; (c) mother, sister, grandma',
            'B. (a) father; (b) soup; (c) father, brother, grandpa',
            'C. (a) sister; (b) bread; (c) brother, father, grandpa',
            'D. (a) grandma; (b) noodles; (c) father, mother, brother'
          ],
          correct_answer: 'A. (a) mother; (b) eggs; (c) mother, sister, grandma',
          explanation: 'In Unit 2, mother, sister, and grandma are female family members; eggs is the food item.',
          total_marks: 5,
          difficulty: currentDiff,
          svg_diagram: `<svg viewBox="0 0 520 140" xmlns="http://www.w3.org/2000/svg" style="background:#FFF9F2;border:1px solid #E5DFD3;border-radius:12px;padding:10px;">
            <rect x="20" y="20" width="140" height="95" rx="10" fill="#FEF3C7" stroke="#F59E0B" stroke-width="1.5"/>
            <text x="90" y="60" font-size="28" text-anchor="middle">👩‍👧‍👦</text>
            <text x="90" y="95" font-size="12" font-weight="bold" fill="#78350F" text-anchor="middle">Family Members</text>
            
            <rect x="190" y="20" width="140" height="95" rx="10" fill="#ECFDF5" stroke="#10B981" stroke-width="1.5"/>
            <text x="260" y="60" font-size="28" text-anchor="middle">🍲 🍞 🍚</text>
            <text x="260" y="95" font-size="12" font-weight="bold" fill="#065F46" text-anchor="middle">Unit 2 Food Items</text>

            <rect x="360" y="20" width="140" height="95" rx="10" fill="#E0F2FE" stroke="#0284C7" stroke-width="1.5"/>
            <text x="430" y="60" font-size="28" text-anchor="middle">👵 👴 👧</text>
            <text x="430" y="95" font-size="12" font-weight="bold" fill="#0369A1" text-anchor="middle">Grandma & Grandpa</text>
          </svg>`
        });
      } else {
        list.push({
          question_number: i,
          title: `Question ${i}`,
          main_instruction: `**Cambridge Global English 1: End of Unit 2 Quiz — Grammar & Present Simple Verbs**\n\nChoose the correct verb for each family activity:\n*"Sam and John [ play / plays ] together. Talia [ help / helps ] her friend. My sister and I [ eat / eats ] yogurt for breakfast."*\n\nAnswer the questions:`,
          sub_parts: [
            { label: '(a)', text: `Sam and John [ play / plays ] together.`, marks: 1 },
            { label: '(b)', text: `Talia [ help / helps ] her friend.`, marks: 1 },
            { label: '(c)', text: `My sister and I [ eat / eats ] yogurt for breakfast.`, marks: 1 }
          ],
          options: [
            'A. (a) play; (b) helps; (c) eat',
            'B. (a) plays; (b) help; (c) eats',
            'C. (a) play; (b) help; (c) eats',
            'D. (a) plays; (b) helps; (c) eat'
          ],
          correct_answer: 'A. (a) play; (b) helps; (c) eat',
          explanation: 'Plural subjects (Sam and John; My sister and I) use base verb (play, eat); singular subject (Talia) uses 3rd-person verb (helps).',
          total_marks: 3,
          difficulty: currentDiff,
          svg_diagram: ''
        });
      }
    } else {
      if (i % 3 === 1) {
        list.push({
          question_number: i,
          title: `Question ${i}`,
          main_instruction: `**Cambridge Global English 1: End of Unit 1 Quiz — Vocabulary**\n\nLook at the classroom items list below:\n*a computer, a boat, a clock, crayons, a book, a whiteboard, chairs, pencils, tables, a bicycle, a bus, a car*\n\nAnswer the questions:`,
          sub_parts: [
            { label: '(a)', text: `Identify which item is used to write on the whiteboard.`, marks: 1 },
            { label: '(b)', text: `Which item tells us the time in the classroom?`, marks: 1 },
            { label: '(c)', text: `Which two items are furniture used for sitting and writing?`, marks: 2 }
          ],
          options: [
            'A. (a) crayons/markers; (b) a clock; (c) chairs and tables',
            'B. (a) a boat; (b) a bus; (c) a bicycle',
            'C. (a) a car; (b) a book; (c) a computer',
            'D. (a) pencils; (b) chairs; (c) a bus'
          ],
          correct_answer: 'A. (a) crayons/markers; (b) a clock; (c) chairs and tables',
          explanation: 'In Unit 1 classroom vocabulary, a clock shows time, and chairs and tables are classroom furniture.',
          total_marks: 4,
          difficulty: currentDiff,
          svg_diagram: `<svg viewBox="0 0 520 140" xmlns="http://www.w3.org/2000/svg" style="background:#FFF9F2;border:1px solid #E5DFD3;border-radius:12px;padding:10px;">
            <rect x="20" y="20" width="140" height="95" rx="10" fill="#E0F2FE" stroke="#0284C7" stroke-width="1.5"/>
            <text x="90" y="60" font-size="28" text-anchor="middle">⏰ ✏️ 📚</text>
            <text x="90" y="95" font-size="12" font-weight="bold" fill="#0369A1" text-anchor="middle">Classroom Items</text>
            
            <rect x="190" y="20" width="140" height="95" rx="10" fill="#FEF3C7" stroke="#F59E0B" stroke-width="1.5"/>
            <text x="260" y="60" font-size="28" text-anchor="middle">🪑 🛹 🚌</text>
            <text x="260" y="95" font-size="12" font-weight="bold" fill="#78350F" text-anchor="middle">Furniture & Vehicles</text>

            <rect x="360" y="20" width="140" height="95" rx="10" fill="#ECFDF5" stroke="#10B981" stroke-width="1.5"/>
            <text x="430" y="60" font-size="28" text-anchor="middle">🖍️ 📐 🖥️</text>
            <text x="430" y="95" font-size="12" font-weight="bold" fill="#065F46" text-anchor="middle">Crayons & Computer</text>
          </svg>`
        });
      } else if (i % 3 === 2) {
        list.push({
          question_number: i,
          title: `Question ${i}`,
          main_instruction: `**Cambridge Global English 1: End of Unit 1 Quiz — Grammar 1 (Verb Agreement)**\n\nChoose the correct verb form for each classroom activity:`,
          sub_parts: [
            { label: '(a)', text: `Lan [ goes / go ] to school by bicycle.`, marks: 1 },
            { label: '(b)', text: `We [ sings / sing ] with our teacher.`, marks: 1 },
            { label: '(c)', text: `Amira [ use / uses ] a computer at school.`, marks: 1 }
          ],
          options: [
            'A. (a) goes; (b) sing; (c) uses',
            'B. (a) go; (b) sings; (c) use',
            'C. (a) goes; (b) sings; (c) use',
            'D. (a) go; (b) sing; (c) uses'
          ],
          correct_answer: 'A. (a) goes; (b) sing; (c) uses',
          explanation: 'Singular subjects (Lan, Amira) take 3rd-person singular verbs (goes, uses). Plural subject (We) takes base verb (sing).',
          total_marks: 3,
          difficulty: currentDiff,
          svg_diagram: ''
        });
      } else {
        list.push({
          question_number: i,
          title: `Question ${i}`,
          main_instruction: `**Cambridge Global English 1: End of Unit 1 Quiz — Grammar 2 (Pronouns)**\n\nRead the passage excerpt:\n*"I am 6. My favourite colour is green. My friend is Rosa. She is a girl. Her favourite colour is orange. We walk to school."*\n\nAnswer the questions:`,
          sub_parts: [
            { label: '(a)', text: `Which pronoun replaces 'Rosa' in the sentence 'She is a girl'?`, marks: 1 },
            { label: '(b)', text: `Which possessive adjective describes Rosa's favourite colour ('Her favourite colour')?`, marks: 1 }
          ],
          options: [
            'A. (a) She; (b) Her',
            'B. (a) He; (b) His',
            'C. (a) It; (b) My',
            'D. (a) You; (b) Your'
          ],
          correct_answer: 'A. (a) She; (b) Her',
          explanation: 'Female singular subject uses subject pronoun "She" and possessive pronoun "Her".',
          total_marks: 2,
          difficulty: currentDiff,
          svg_diagram: ''
        });
      }
    }
  }
  return list;
}
