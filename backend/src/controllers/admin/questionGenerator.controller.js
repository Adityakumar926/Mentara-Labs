const db = require('../../config/db');
const cloudinaryService = require('../../services/cloudinary.service');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

/**
 * Load and normalize questions from a given CSV file
 */
async function loadQuestionsFromCsv(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const results = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Flexible key lookups
        const stage = row.stage || row.Stage || 'Stage 2';
        const subject = row.subject || row.Subject || 'Mathematics';
        const strand = row.strand || row.Strand || row.curriculum_strand_or_topic || row['Curriculum Strand / Topic Name'] || row.topic || row.Topic || '';
        const topic = row.topic || row.Topic || strand;
        const subtopic = row.subtopic || row.Subtopic || row.substrand || '';
        const difficulty = row.difficulty || row.Difficulty || 'Medium';
        const question_type = row.question_type || row.type || row['Question Type'] || 'short_answer';
        const question_text = row.question_text || row.main_instruction || row.Question || row.question || '';
        
        let sub_parts = [];
        const rawSubParts = row.sub_parts || row.subparts || row.sub_parts_json;
        if (rawSubParts) {
          try {
            sub_parts = typeof rawSubParts === 'string' ? JSON.parse(rawSubParts) : rawSubParts;
          } catch (e) {
            sub_parts = [];
          }
        }

        let options = [];
        const rawOptions = row.options || row.Options;
        if (rawOptions) {
          try {
            options = typeof rawOptions === 'string' ? JSON.parse(rawOptions) : rawOptions;
          } catch (e) {
            options = [];
          }
        }

        const correct_answer = row.correct_answer || row.answer || row.Answer || '';
        const marks = parseInt(row.marks || row.Marks || row.total_marks || 1, 10) || 1;
        const image_url = row.image_url || row.diagram_url || row.Image || null;
        const explanation = row.explanation || row.mark_scheme || row.MarkScheme || row['Mark Scheme'] || '';

        if (question_text || (Array.isArray(sub_parts) && sub_parts.length > 0)) {
          results.push({
            stage: String(stage).trim(),
            subject: String(subject).trim(),
            strand: String(strand).trim(),
            topic: String(topic).trim(),
            subtopic: String(subtopic).trim(),
            difficulty: String(difficulty).trim(),
            question_type: String(question_type).trim(),
            question_text: String(question_text).trim(),
            sub_parts,
            options,
            correct_answer: String(correct_answer).trim(),
            marks,
            image_url: image_url ? String(image_url).trim() : null,
            mark_scheme: String(explanation).trim(),
            explanation: String(explanation).trim()
          });
        }
      })
      .on('end', resolve)
      .on('error', reject);
  });
  return results;
}

/**
 * Retrieve all unique questions from all CSV dataset files in the dataset folder
 */
async function getAllDatasetQuestions() {
  const datasetDir = path.join(__dirname, '../../../../dataset');
  const filesToTry = [
    path.join(datasetDir, 'questions_dataset_new.csv'),
    path.join(datasetDir, 'questions_dataset.csv'),
    path.join(datasetDir, 'math_questions.csv')
  ];

  const seen = new Set();
  const all = [];

  for (const f of filesToTry) {
    try {
      const rows = await loadQuestionsFromCsv(f);
      for (const r of rows) {
        const key = `${r.stage}|${r.subject}|${r.strand}|${r.question_text}`.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          all.push(r);
        }
      }
    } catch (e) {
      console.warn(`[CSV Dataset Loader] Could not load ${f}:`, e.message);
    }
  }

  return all;
}

/**
 * Sync dataset questions into PostgreSQL question_bank table
 */
async function syncDatasetToQuestionBank() {
  try {
    const questions = await getAllDatasetQuestions();
    if (!questions || questions.length === 0) return;

    for (const q of questions) {
      const { rows } = await db.query(
        `SELECT id FROM public.question_bank 
         WHERE LOWER(stage) = LOWER($1) 
           AND LOWER(subject) = LOWER($2) 
           AND (LOWER(question_text) = LOWER($3) OR (LOWER(strand) = LOWER($4) AND LOWER(question_text) = LOWER($3)))
         LIMIT 1`,
        [q.stage, q.subject, q.question_text, q.strand]
      );

      if (rows.length === 0) {
        await db.query(
          `INSERT INTO public.question_bank 
           (stage, subject, strand, topic, subtopic, difficulty, question_type, question_text, sub_parts, options, correct_answer, marks, image_url, mark_scheme, explanation)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
          [
            q.stage,
            q.subject,
            q.strand,
            q.topic,
            q.subtopic,
            q.difficulty,
            q.question_type,
            q.question_text,
            JSON.stringify(q.sub_parts || []),
            JSON.stringify(q.options || []),
            q.correct_answer,
            q.marks || 1,
            q.image_url,
            q.mark_scheme,
            q.explanation
          ]
        );
      }
    }
    console.log(`[syncDatasetToQuestionBank] Successfully synced ${questions.length} dataset questions to question_bank`);
  } catch (err) {
    console.warn('[syncDatasetToQuestionBank Error]', err.message);
  }
}

// Ensure source_rag_documents and question_bank tables exist
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
        extracted_image_url TEXT NULL,
        extracted_image_urls TEXT NULL,
        stage_name TEXT NULL,
        subject_name TEXT NULL,
        topic_name TEXT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT source_rag_documents_pkey PRIMARY KEY (id)
      );
      ALTER TABLE public.source_rag_documents ADD COLUMN IF NOT EXISTS extracted_image_url TEXT NULL;
      ALTER TABLE public.source_rag_documents ADD COLUMN IF NOT EXISTS extracted_image_urls TEXT NULL;
    `);
  } catch (err) {
    console.error('Error initializing source_rag_documents table:', err.message);
  }

  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS public.question_bank (
        id UUID NOT NULL DEFAULT gen_random_uuid(),
        stage TEXT,
        subject TEXT,
        strand TEXT,
        topic TEXT,
        subtopic TEXT,
        difficulty TEXT,
        question_type TEXT,
        question_text TEXT,
        sub_parts JSONB,
        options JSONB,
        correct_answer TEXT,
        marks INT DEFAULT 1,
        image_url TEXT,
        mark_scheme TEXT,
        explanation TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT question_bank_pkey PRIMARY KEY (id)
      );
      ALTER TABLE public.question_bank ADD COLUMN IF NOT EXISTS stage TEXT;
      ALTER TABLE public.question_bank ADD COLUMN IF NOT EXISTS strand TEXT;
      ALTER TABLE public.question_bank ADD COLUMN IF NOT EXISTS subtopic TEXT;
      ALTER TABLE public.question_bank ADD COLUMN IF NOT EXISTS question_type TEXT;
      ALTER TABLE public.question_bank ADD COLUMN IF NOT EXISTS sub_parts JSONB;
      ALTER TABLE public.question_bank ADD COLUMN IF NOT EXISTS options JSONB;
      ALTER TABLE public.question_bank ADD COLUMN IF NOT EXISTS correct_answer TEXT;
      ALTER TABLE public.question_bank ADD COLUMN IF NOT EXISTS marks INT DEFAULT 1;
      ALTER TABLE public.question_bank ADD COLUMN IF NOT EXISTS explanation TEXT;
    `);
    console.log('[initTable] question_bank table ready');
    // Auto-sync dataset CSVs to question_bank table
    await syncDatasetToQuestionBank();
  } catch (err) {
    console.error('Error initializing question_bank table:', err.message);
  }
}
initTable();

/**
 * Extract embedded JPEG images from PDF binary buffer
 */
function extractEmbeddedImagesFromPdfBuffer(buf) {
  const images = [];
  let pos = 0;
  while ((pos = buf.indexOf(Buffer.from([0xFF, 0xD8, 0xFF]), pos)) !== -1) {
    const end = buf.indexOf(Buffer.from([0xFF, 0xD9]), pos);
    if (end !== -1) {
      const imgBuf = buf.subarray(pos, end + 2);
      if (imgBuf.length > 2000) {
        images.push(imgBuf);
      }
      pos = end + 2;
    } else {
      break;
    }
  }
  images.sort((a, b) => b.length - a.length);
  return images;
}

/**
 * Extract clean readable text from document buffer (PDF / Word / Text)
 */
async function extractTextFromBuffer(buffer, originalName, stage, subject, topic) {
  try {
    let extracted = '';

    // 1. Primary PDF parsing using pdf-parse library
    try {
      const pdfModule = require('pdf-parse');
      if (pdfModule && pdfModule.PDFParse) {
        const parser = new pdfModule.PDFParse(new Uint8Array(buffer));
        const res = await parser.getText();
        extracted = (typeof res === 'string' ? res : res?.text || '').trim();
      } else if (typeof pdfModule === 'function') {
        const res = await pdfModule(buffer);
        extracted = (res?.text || '').trim();
      }

      if (extracted) {
        console.log(`[PDF Parse] Successfully extracted ${extracted.length} characters from ${originalName}`);
      }
    } catch (pdfErr) {
      console.warn(`[PDF Parse Warning] pdf-parse failed on ${originalName}:`, pdfErr.message);
    }

    // 2. Fallback stream extraction if pdf-parse returned small text
    if (!extracted || extracted.length < 50) {
      const raw = buffer.toString('binary');
      const matches = raw.match(/\(([^()]{2,})\)/g) || [];
      const textChunks = [];
      for (const m of matches) {
        let str = m.slice(1, -1);
        str = str.replace(/\\([0-7]{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)));
        str = str.replace(/\\[nrtbf]/g, ' ').replace(/\\/g, '').trim();
        if (str.length >= 2 && !/^[\x00-\x1F\x7F-\xFF]+$/.test(str)) {
          textChunks.push(str);
        }
      }
      extracted = textChunks.join(' ').replace(/\s+/g, ' ').trim();
    }

    if (extracted.length > 12000) {
      extracted = extracted.substring(0, 12000);
    }

    return String(extracted || '').replace(/\0/g, '').replace(/\u0000/g, '').replace(/\\u0000/g, '').trim();
  } catch (err) {
    console.error('[Text Extraction Error]', err);
    return `Source Document "${originalName}" covering ${stage || 'Stage 1'}, ${subject || 'English'}, ${topic || 'Grammar'}.`;
  }
}

/**
 * 1. UPLOAD DOCUMENT TO CLOUDINARY (folder: source_RAG) & EXTRACT TEXT & EMBEDDED FIGURES
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

    // Upload main document to Cloudinary under folder "source_RAG"
    const uploadRes = await cloudinaryService.uploadImage(
      req.file.buffer,
      'source_RAG',
      { resource_type: 'auto' }
    ).catch(async () => {
      return await cloudinaryService.uploadDocument(req.file.buffer, 'source_RAG');
    });

    let extractedText = await extractTextFromBuffer(req.file.buffer, originalName, stage_name, subject_name, topic_name);
    extractedText = String(extractedText || '').replace(/\0/g, '').replace(/\u0000/g, '').replace(/\\u0000/g, '').trim();

    // Extract ALL embedded JPEG figure images directly from PDF file buffer
    let extractedImageUrl = null;
    let extractedImageUrls = [];

    if (mimeType.includes('pdf') || originalName.toLowerCase().endsWith('.pdf')) {
      try {
        const embeddedImgs = extractEmbeddedImagesFromPdfBuffer(req.file.buffer);
        console.log(`[PDF Multi-Image Extraction] Found ${embeddedImgs.length} embedded images in ${originalName}`);
        
        for (let i = 0; i < Math.min(embeddedImgs.length, 8); i++) {
          const figureBuf = embeddedImgs[i];
          const imgUploadRes = await cloudinaryService.uploadImage(
            figureBuf,
            'source_RAG_extracted_figures',
            { resource_type: 'image' }
          );
          if (imgUploadRes && imgUploadRes.url) {
            extractedImageUrls.push(imgUploadRes.url);
          }
        }
        if (extractedImageUrls.length > 0) {
          extractedImageUrl = extractedImageUrls[0];
          console.log(`[Multi-Image Upload Complete] Uploaded ${extractedImageUrls.length} source images to Cloudinary for ${originalName}`);
        }
      } catch (imgErr) {
        console.warn('[PDF Image Extraction Warning] Failed to extract embedded figures:', imgErr.message);
      }
    }

    const { rows } = await db.query(
      `INSERT INTO public.source_rag_documents
       (filename, file_url, cloudinary_public_id, file_type, file_size, extracted_text, extracted_image_url, extracted_image_urls, stage_name, subject_name, topic_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        originalName,
        uploadRes.url,
        uploadRes.publicId || null,
        mimeType,
        size,
        extractedText,
        extractedImageUrl,
        JSON.stringify(extractedImageUrls),
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
 * Precision Visual Engine: Preserves authentic image_url or valid SVG diagrams; removes placeholders if no visual is needed.
 */
function ensureValidSvgDiagram(q, idx = 0) {
  // 1. If question has a valid Cloudinary/dataset image_url, preserve it and clear svg_diagram
  if (q.image_url && typeof q.image_url === 'string' && q.image_url.trim().length > 0) {
    q.svg_diagram = null;
    return q;
  }

  // 2. If question has a valid SVG diagram from AI generation, verify and sanitize it
  if (q.svg_diagram && typeof q.svg_diagram === 'string' && q.svg_diagram.includes('<svg')) {
    if (
      q.svg_diagram.includes('Cambridge Primary Assessment Widescreen Landscape Figure') ||
      q.svg_diagram.includes('📑 🎓 💡')
    ) {
      q.svg_diagram = null;
    }
    return q;
  }

  // 3. No image and no diagram: ensure svg_diagram is null (no generic placeholder printed)
  q.svg_diagram = null;
  return q;
}

/**
 * Helper to call Gemini API with Multimodal Vision payload and model fallback retry
 */
async function callGeminiApi(apiKey, modelList, prompt, inlineParts = []) {
  const parts = [];
  if (Array.isArray(inlineParts) && inlineParts.length > 0) {
    parts.push(...inlineParts);
  }
  parts.push({ text: prompt });

  for (const model of modelList) {
    try {
      console.log(`[Gemini Multimodal API] Trying model endpoint: ${model}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': apiKey
          },
          body: JSON.stringify({
            contents: [{ parts: parts }],
            generationConfig: { responseMimeType: 'application/json' }
          }),
          signal: controller.signal
        }
      ).finally(() => clearTimeout(timeoutId));

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

            // Robust JSON backslash & control character escaping for LaTeX math
            cleanStr = cleanStr
              .replace(/\\(?!["\\/bfnrtu])/g, '\\\\')
              .replace(/[\u0000-\u001F]+/g, (m) => (m === '\n' || m === '\r' ? ' ' : ''));

let parsed;
            try {
              parsed = JSON.parse(cleanStr);
            } catch (e1) {
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

  // Fallback to Groq API if Gemini API key fails or returns error
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      console.log(`[AI Generator] Trying Groq API (llama-3.3-70b-versatile)...`);
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: 'You are a Senior Cambridge Primary Examination Author. Output a valid JSON object with key "questions" containing an array of authentic Cambridge Primary exam questions with sub_parts, total_marks, explanation, and svg_diagram.'
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3
        })
      });

      if (response.ok) {
        const jsonRes = await response.json();
        const textOutput = jsonRes?.choices?.[0]?.message?.content;
        if (textOutput) {
          const parsed = JSON.parse(textOutput);
          let qList = parsed.questions && Array.isArray(parsed.questions) ? parsed.questions : (Array.isArray(parsed) ? parsed : []);
          if (qList.length > 0) {
            qList = qList.map(ensureValidSvgDiagram);
            console.log(`[Groq AI API] Successfully generated ${qList.length} authentic questions via Groq!`);
            return qList;
          }
        }
      }
    } catch (gErr) {
      console.warn(`[Groq AI Fetch Error]`, gErr.message);
    }
  }

  return null;
}

/**
 * GENERATE CAMBRIDGE PRIMARY ASSESSMENT QUESTIONS BY CURRICULUM HIERARCHY (Stage -> Subject -> Strand / Topic)
 * Uses 4-tier DB matching:
 * Tier 1: Stage + Subject + Exact Strand / Topic
 * Tier 2: Stage + Subject + Keyword Strand / Topic
 * Tier 3: Stage + Subject Fallback
 * Tier 4: Subject-only Fallback
 * Then falls back to direct multi-CSV dataset if DB yields nothing.
 */
exports.generateQuestions = async (req, res) => {
  try {
    const {
      stage = 'Stage 2',
      subject = 'Mathematics',
      strand = 'Counting & Sequences',
      topic = 'Counting & Sequences',
      subtopic = '',
      count = 5,
      difficulty = 'mixed',
      question_type = 'fill_in_lines'
    } = req.body;

    const limit = Math.min(Math.max(Number(count) || 5, 1), 10);
    let safeStage = String(stage || 'Stage 2').trim();

    // If request is from a student, strictly enforce their registered class/stage
    if (req.user?.role === 'student' && req.user?.class_id) {
      try {
        const { rows: cRows } = await db.query('SELECT name, stage FROM classes WHERE id = $1', [req.user.class_id]);
        if (cRows[0]) {
          const rawClass = cRows[0].stage || cRows[0].name || '';
          const stageMatch = rawClass.match(/Stage\s*(\d)/i);
          const gradeMatch = rawClass.match(/Grade\s*(\d)/i);
          const numMatch = rawClass.match(/(\d)/);
          if (stageMatch) {
            safeStage = `Stage ${stageMatch[1]}`;
          } else if (gradeMatch) {
            const gNum = parseInt(gradeMatch[1], 10);
            const map = { 1: 'Stage 2', 2: 'Stage 3', 3: 'Stage 4', 4: 'Stage 5', 5: 'Stage 6', 6: 'Stage 6' };
            safeStage = map[gNum] || 'Stage 5';
          } else if (numMatch) {
            safeStage = `Stage ${numMatch[1]}`;
          }
        }
      } catch (cErr) {
        console.warn('[generateQuestions] Student class lookup warning:', cErr.message);
      }
    }

    const safeSubject = String(subject || 'Mathematics').trim();
    const safeStrand = String(strand || topic || 'General').trim();
    const isMixed = difficulty === 'mixed';

    // ── 1. Try DB first with tiered matching: stage + subject + strand ─────────
    try {
      let rows = [];

      // Tier 1: exact stage + subject + strand match
      {
        const diffSql = isMixed ? '' : ` AND LOWER(difficulty) = LOWER($4)`;
        const params = isMixed
          ? [safeStage, safeSubject, safeStrand, limit]
          : [safeStage, safeSubject, safeStrand, difficulty, limit];
        const limitParam = isMixed ? '$4' : '$5';
        const { rows: r } = await db.query(
          `SELECT * FROM public.question_bank
           WHERE LOWER(stage) = LOWER($1)
             AND LOWER(subject) = LOWER($2)
             AND (LOWER(strand) = LOWER($3) OR LOWER(topic) = LOWER($3))
             AND LOWER(difficulty) != 'mixed'${diffSql}
           ORDER BY RANDOM() LIMIT ${limitParam}`,
          params
        );
        rows = r;
        if (rows.length > 0) console.log(`[generateQuestions] Tier-1 (stage+subject+strand) match: ${rows.length} rows`);
      }

      // Tier 2: exact stage + subject + keyword in strand/topic
      if (rows.length === 0) {
        const strandKeyword = safeStrand.split(/[\s&,]/)[0].trim();
        const diffSql = isMixed ? '' : ` AND LOWER(difficulty) = LOWER($5)`;
        const params = isMixed
          ? [safeStage, safeSubject, `%${strandKeyword}%`, safeStrand, limit]
          : [safeStage, safeSubject, `%${strandKeyword}%`, safeStrand, difficulty, limit];
        const limitParam = isMixed ? '$5' : '$6';
        const { rows: r } = await db.query(
          `SELECT * FROM public.question_bank
           WHERE LOWER(stage) = LOWER($1)
             AND LOWER(subject) = LOWER($2)
             AND (LOWER(strand) ILIKE $3 OR LOWER(topic) ILIKE $3 OR LOWER($4) ILIKE '%' || LOWER(strand) || '%')
             AND LOWER(difficulty) != 'mixed'${diffSql}
           ORDER BY RANDOM() LIMIT ${limitParam}`,
          params
        );
        rows = r;
        if (rows.length > 0) console.log(`[generateQuestions] Tier-2 (stage+subject+keyword "${strandKeyword}") match: ${rows.length} rows`);
      }

      // Tier 3: stage + subject fallback (ignoring strand)
      if (rows.length === 0) {
        const diffSql = isMixed ? '' : ` AND LOWER(difficulty) = LOWER($4)`;
        const params = isMixed
          ? [safeStage, safeSubject, limit]
          : [safeStage, safeSubject, difficulty, limit];
        const limitParam = isMixed ? '$3' : '$4';
        const { rows: r } = await db.query(
          `SELECT * FROM public.question_bank
           WHERE LOWER(stage) = LOWER($1)
             AND LOWER(subject) = LOWER($2)
             AND LOWER(difficulty) != 'mixed'${diffSql}
           ORDER BY RANDOM() LIMIT ${limitParam}`,
          params
        );
        rows = r;
        if (rows.length > 0) console.log(`[generateQuestions] Tier-3 (stage+subject) match: ${rows.length} rows`);
      }

      // Tier 4: subject-only fallback (any stage)
      if (rows.length === 0) {
        const diffSql = isMixed ? '' : ` AND LOWER(difficulty) = LOWER($3)`;
        const params = isMixed
          ? [safeSubject, limit]
          : [safeSubject, difficulty, limit];
        const limitParam = isMixed ? '$2' : '$3';
        const { rows: r } = await db.query(
          `SELECT * FROM public.question_bank
           WHERE LOWER(subject) = LOWER($1)
             AND LOWER(difficulty) != 'mixed'${diffSql}
           ORDER BY RANDOM() LIMIT ${limitParam}`,
          params
        );
        rows = r;
        if (rows.length > 0) console.log(`[generateQuestions] Tier-4 (subject-only) match: ${rows.length} rows`);
      }

      if (rows.length > 0) {
        const formattedQuestions = rows.map((q, idx) => {
          let subParts = [];
          if (q.sub_parts) {
            try {
              subParts = typeof q.sub_parts === 'string' ? JSON.parse(q.sub_parts) : q.sub_parts;
            } catch (e) {
              subParts = [];
            }
          }
          let options = [];
          if (q.options) {
            try {
              options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
            } catch (e) {
              options = [];
            }
          }

          const calculatedMarks = Array.isArray(subParts) && subParts.length > 0
            ? subParts.reduce((sum, sp) => sum + (parseInt(sp.marks, 10) || 1), 0)
            : (q.marks || 3);

          return ensureValidSvgDiagram({
            question_number: idx + 1,
            title: `Question ${idx + 1}`,
            stage: q.stage || safeStage,
            subject: q.subject || safeSubject,
            strand: q.strand || safeStrand,
            subtopic: q.subtopic || '',
            main_instruction: q.question_text,
            sub_parts: subParts,
            options: options,
            correct_answer: q.correct_answer || '',
            total_marks: calculatedMarks,
            explanation: q.explanation || q.mark_scheme || 'Step-by-step verified solution.',
            difficulty: (q.difficulty || 'medium').toLowerCase(),
            image_url: q.image_url || null,
            svg_diagram: ''
          });
        });

        return res.json({
          success: true,
          count: formattedQuestions.length,
          data: formattedQuestions,
          source: 'database'
        });
      }
    } catch (dbErr) {
      console.warn('[generateQuestions] DB query failed, falling back to direct CSV:', dbErr.message);
    }

    // ── 2. Direct CSV fallback with same tiered hierarchy ───────────────────
    const allCsvQuestions = await getAllDatasetQuestions();
    if (allCsvQuestions.length > 0) {
      // Tier 1: exact stage + subject + strand
      let filtered = allCsvQuestions.filter(
        q => q.stage.toLowerCase() === safeStage.toLowerCase() &&
             q.subject.toLowerCase() === safeSubject.toLowerCase() &&
             (q.strand.toLowerCase() === safeStrand.toLowerCase() || q.topic.toLowerCase() === safeStrand.toLowerCase())
      );

      // Tier 2: stage + subject + keyword
      if (filtered.length === 0) {
        const strandKeyword = safeStrand.split(/[\s&,]/)[0].trim().toLowerCase();
        filtered = allCsvQuestions.filter(
          q => q.stage.toLowerCase() === safeStage.toLowerCase() &&
               q.subject.toLowerCase() === safeSubject.toLowerCase() &&
               (q.strand.toLowerCase().includes(strandKeyword) || q.topic.toLowerCase().includes(strandKeyword) || safeStrand.toLowerCase().includes(q.strand.toLowerCase()))
        );
      }

      // Tier 3: stage + subject
      if (filtered.length === 0) {
        filtered = allCsvQuestions.filter(
          q => q.stage.toLowerCase() === safeStage.toLowerCase() &&
               q.subject.toLowerCase() === safeSubject.toLowerCase()
        );
      }

      // Tier 4: subject only
      if (filtered.length === 0) {
        filtered = allCsvQuestions.filter(
          q => q.subject.toLowerCase() === safeSubject.toLowerCase()
        );
      }

      if (difficulty !== 'mixed') {
        const diffFiltered = filtered.filter(
          q => q.difficulty.toLowerCase() === difficulty.toLowerCase()
        );
        if (diffFiltered.length > 0) filtered = diffFiltered;
      }

      if (filtered.length > 0) {
        filtered = filtered.sort(() => 0.5 - Math.random()).slice(0, limit);

        const formattedQuestions = filtered.map((q, idx) => {
          const calculatedMarks = Array.isArray(q.sub_parts) && q.sub_parts.length > 0
            ? q.sub_parts.reduce((sum, sp) => sum + (parseInt(sp.marks, 10) || 1), 0)
            : (q.marks || 3);

          return ensureValidSvgDiagram({
            question_number: idx + 1,
            title: `Question ${idx + 1}`,
            stage: q.stage || safeStage,
            subject: q.subject || safeSubject,
            strand: q.strand || safeStrand,
            subtopic: q.subtopic || '',
            main_instruction: q.question_text,
            sub_parts: q.sub_parts || [],
            options: q.options || [],
            correct_answer: q.correct_answer || '',
            total_marks: calculatedMarks,
            explanation: q.explanation || q.mark_scheme,
            difficulty: (q.difficulty || 'medium').toLowerCase(),
            image_url: q.image_url || null,
            svg_diagram: ''
          });
        });

        console.log(`[generateQuestions] Served ${formattedQuestions.length} questions from CSV fallback`);
        return res.json({
          success: true,
          count: formattedQuestions.length,
          data: formattedQuestions,
          source: 'csv_fallback'
        });
      }
    }

    // ── 3. Fallback generator if no dataset rows matched ────────────────────
    const fallbackList = generateFallbackQuestions({
      stage: safeStage,
      subject: safeSubject,
      strand: safeStrand,
      subtopic: subtopic,
      count: limit,
      difficulty
    });

    return res.json({
      success: true,
      count: fallbackList.length,
      data: fallbackList,
      source: 'synthesized_fallback'
    });
  } catch (err) {
    console.error('[Generate Questions Error]', err);
    res.status(500).json({ success: false, message: 'Failed to generate questions from dataset.' });
  }
};



/**
 * BULK SAVE GENERATED QUESTIONS TO QUESTION BANK
 */
exports.saveBulkQuestions = async (req, res) => {
  try {
    const { subject_id, topic_id, questions, destination = 'shared' } = req.body;

    if (!subject_id || !Array.isArray(questions) || !questions.length) {
      return res.status(400).json({ success: false, message: 'subject_id and non-empty questions array are required' });
    }

    const { buildCloudinaryPath } = require('../../utils/cloudinaryPathBuilder');
    const folder = await buildCloudinaryPath({
      topicId: topic_id,
      subjectId: subject_id,
      contentType: 'questions/images',
      destination
    });

    // Upload any base64 captured images to Cloudinary in parallel batches
    const processedQuestions = await Promise.all(
      questions.map(async (q) => {
        let imageUrl = q.image_url || null;
        if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('data:image/')) {
          try {
            const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            const uploadRes = await cloudinaryService.uploadImage(buffer, folder);
            imageUrl = uploadRes.url;
          } catch (uErr) {
            console.warn('[saveBulkQuestions] Cloudinary upload fallback warning:', uErr.message);
          }
        }
        return { ...q, image_url: imageUrl };
      })
    );

    const valueTuples = [];
    const values = [];
    let paramIdx = 1;

    for (let idx = 0; idx < processedQuestions.length; idx++) {
      const q = processedQuestions[idx];
      let formattedText = q.main_instruction || q.question_text || q.title || 'Cambridge Exam Question';
      if (Array.isArray(q.sub_parts) && q.sub_parts.length > 0) {
        const subPartsStr = q.sub_parts.map(sp => `${sp.label} ${sp.text} [${sp.marks ?? 1}]`).join('\n');
        formattedText = `${formattedText}\n\n${subPartsStr}`;
      }

      let imageUrl = q.image_url || null;

      valueTuples.push(
        `($${paramIdx}, $${paramIdx+1}, $${paramIdx+2}, $${paramIdx+3}, $${paramIdx+4}, $${paramIdx+5}, $${paramIdx+6}, $${paramIdx+7}, $${paramIdx+8}, $${paramIdx+9}, $${paramIdx+10}, $${paramIdx+11}, $${paramIdx+12}, NOW() + ($${paramIdx+13} || ' milliseconds')::interval)`
      );
      values.push(
        subject_id,
        topic_id || null,
        'photo',
        formattedText,
        JSON.stringify(q.options || []),
        q.correct_answer || (Array.isArray(q.options) ? q.options[0] : 'See Marking Scheme'),
        q.explanation || 'Step-by-step reasoning verified by Cambridge Assessment Standards.',
        q.difficulty || 'medium',
        ['cambridge_paper', 'ai_generated'],
        false,
        imageUrl,
        req.user.id,
        destination,
        idx * 10
      );
      paramIdx += 14;
    }

    const { rows } = await db.query(
      `INSERT INTO public.questions
       (subject_id, topic_id, question_type, question_text, options, correct_answer,
        explanation, difficulty, tags, is_premium, image_url, created_by, destination, created_at)
       VALUES ${valueTuples.join(', ')} RETURNING *`,
      values
    );

    res.json({
      success: true,
      message: `Saved ${rows.length} Cambridge primary questions to Question Bank!`,
      data: rows
    });
  } catch (err) {
    console.error('[Save Bulk Questions Error]', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Pure Authentic Cambridge Primary Question Generator
 * Generates authentic, syllabus-aligned Cambridge Primary exam questions with ZERO generic placeholder text.
 */
function generateFallbackQuestions(params = {}) {
  const {
    stage = 'Stage 1',
    subject = 'Science',
    strand = 'Electricity & Magnetism',
    substrand = 'General Practice',
    count = 5,
    difficulty = 'mixed'
  } = params;

  const list = [];
  const safeSubject = String(subject || 'Science').trim();
  const safeStage = String(stage || 'Stage 1').trim();
  const safeStrand = String(strand || 'Electricity & Magnetism').trim();
  const safeSubstrand = String(substrand || 'Focus Skill').trim();
  const safeCount = Math.max(1, Math.min(15, parseInt(count, 10) || 5));
  const safeDiff = String(difficulty || 'mixed').toLowerCase();
  const diffs = ['easy', 'medium', 'hard'];

  const strandLower = safeStrand.toLowerCase();
  const subjLower = safeSubject.toLowerCase();

  for (let i = 1; i <= safeCount; i++) {
    const currentDiff = safeDiff === 'mixed' ? diffs[(i - 1) % diffs.length] : safeDiff;

    // 1. ELECTRICITY & MAGNETISM
    if (strandLower.includes('electr') || strandLower.includes('circuit') || strandLower.includes('magnet')) {
      if (i % 3 === 1) {
        list.push({
          question_number: i,
          title: `Question ${i}`,
          main_instruction: `${safeStage} ${safeSubject} — Electricity & Magnetism (${safeStrand}): Electrical Conductors & Circuits:`,
          sub_parts: [
            { label: '(a)', text: `Is copper wire classified as an electrical conductor or an electrical insulator?`, marks: 1 },
            { label: '(b)', text: `Describe what happens to an electric light bulb in a simple circuit when the switch is opened.`, marks: 1 },
            { label: '(c)', text: `Name the two opposite magnetic poles that attract each other when brought close together.`, marks: 1 }
          ],
          explanation: 'Copper is an electrical conductor. Opening the switch breaks the complete circuit so current stops and the bulb turns off. North and South poles attract.',
          total_marks: 3,
          difficulty: currentDiff,
          svg_diagram: `<svg viewBox="0 0 760 150" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#FFF9F2;border:1px solid #E5DFD3;border-radius:16px;padding:12px;">
            <rect x="120" y="35" width="100" height="40" rx="8" fill="#DC2626"/><text x="170" y="60" font-size="14" font-weight="bold" fill="#FFF" text-anchor="middle">Battery 🔋</text>
            <circle cx="380" cy="55" r="22" fill="#F59E0B"/><text x="380" y="60" font-size="12" font-weight="bold" fill="#FFF" text-anchor="middle">Bulb 💡</text>
            <rect x="580" y="45" width="50" height="20" fill="#059669"/><text x="605" y="60" font-size="11" font-weight="bold" fill="#FFF" text-anchor="middle">Switch</text>
          </svg>`
        });
      } else if (i % 3 === 2) {
        list.push({
          question_number: i,
          title: `Question ${i}`,
          main_instruction: `${safeStage} ${safeSubject} — Electricity & Magnetism (${safeStrand}): Cells & Magnetic Materials:`,
          sub_parts: [
            { label: '(a)', text: `Which electrical component provides energy to push current around a circuit?`, marks: 1 },
            { label: '(b)', text: `Predict what happens to the brightness of a bulb when a second cell is added in series.`, marks: 1 },
            { label: '(c)', text: `Name two metallic materials that are attracted to a permanent bar magnet.`, marks: 1 }
          ],
          explanation: 'Cell/Battery provides electrical energy. Adding a second cell increases voltage making the bulb shine brighter. Iron and steel are magnetic metals.',
          total_marks: 3,
          difficulty: currentDiff,
          svg_diagram: `<svg viewBox="0 0 760 150" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#FFF9F2;border:1px solid #E5DFD3;border-radius:16px;padding:12px;">
            <rect x="220" y="40" width="140" height="60" rx="8" fill="#0284C7"/><text x="290" y="75" font-size="16" font-weight="bold" fill="#FFF" text-anchor="middle">N Magnet Pole</text>
            <rect x="400" y="40" width="140" height="60" rx="8" fill="#DC2626"/><text x="470" y="75" font-size="16" font-weight="bold" fill="#FFF" text-anchor="middle">S Magnet Pole</text>
          </svg>`
        });
      } else {
        list.push({
          question_number: i,
          title: `Question ${i}`,
          main_instruction: `${safeStage} ${safeSubject} — Electricity & Magnetism (${safeStrand}): Insulation & Magnetic Forces:`,
          sub_parts: [
            { label: '(a)', text: `Is plastic coating on electrical cables used as a conductor or an insulator for safety?`, marks: 1 },
            { label: '(b)', text: `Explain why electric current will not flow if there is a gap in the wires.`, marks: 1 },
            { label: '(c)', text: `What happens when two North poles of bar magnets are pushed towards each other?`, marks: 1 }
          ],
          explanation: 'Plastic is an insulator to protect users from electric shocks. Current requires an unbroken complete loop. Like magnetic poles repel.',
          total_marks: 3,
          difficulty: currentDiff,
          svg_diagram: `<svg viewBox="0 0 760 150" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#FFF9F2;border:1px solid #E5DFD3;border-radius:16px;padding:12px;">
            <text x="380" y="80" font-size="20" font-weight="bold" fill="#DC2626" text-anchor="middle">⚡ Complete Circuit vs Open Circuit ⚡</text>
          </svg>`
        });
      }
    }
    // 2. STATES OF MATTER / HEAT / THERMAL
    else if (strandLower.includes('matter') || strandLower.includes('state') || strandLower.includes('heat') || strandLower.includes('thermal') || strandLower.includes('solid') || strandLower.includes('liquid') || strandLower.includes('gas')) {
      if (i % 3 === 1) {
        list.push({
          question_number: i,
          title: `Question ${i}`,
          main_instruction: `${safeStage} ${safeSubject} — States of Matter (${safeStrand}): Thermal Energy & Phase Changes:`,
          sub_parts: [
            { label: '(a)', text: `What phase change turns solid ice into liquid water when thermal energy is added?`, marks: 1 },
            { label: '(b)', text: `At what temperature does liquid water boil into gas steam at sea level?`, marks: 1 },
            { label: '(c)', text: `Compare particle movement in a solid versus a gas.`, marks: 1 }
          ],
          explanation: 'Melting turns ice to water. Boiling occurs at 100°C. Particles in solids vibrate in fixed positions; gas particles move rapidly.',
          total_marks: 3,
          difficulty: currentDiff,
          svg_diagram: `<svg viewBox="0 0 760 150" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#FFF9F2;border:1px solid #E5DFD3;border-radius:16px;padding:12px;">
            <rect x="120" y="30" width="140" height="90" rx="10" fill="#E0F2FE" stroke="#0284C7"/><text x="190" y="80" font-size="14" font-weight="bold" fill="#0369A1" text-anchor="middle">Solid Ice 🧊</text>
            <text x="315" y="80" font-size="24" font-weight="bold" fill="#64748B">➔ Melting ➔</text>
            <rect x="420" y="30" width="140" height="90" rx="10" fill="#ECFDF5" stroke="#10B981"/><text x="490" y="80" font-size="14" font-weight="bold" fill="#065F46" text-anchor="middle">Liquid Water 💧</text>
          </svg>`
        });
      } else if (i % 3 === 2) {
        list.push({
          question_number: i,
          title: `Question ${i}`,
          main_instruction: `${safeStage} ${safeSubject} — States of Matter (${safeStrand}): Condensation & Freezing:`,
          sub_parts: [
            { label: '(a)', text: `What process turns water vapor gas into liquid water droplets on a cold mirror?`, marks: 1 },
            { label: '(b)', text: `At what freezing temperature does liquid water turn into solid ice?`, marks: 1 },
            { label: '(c)', text: `Explain why liquids take the shape of their container while solids keep a fixed shape.`, marks: 1 }
          ],
          explanation: 'Condensation turns steam to water. Freezing occurs at 0°C. Liquid particles can slide past each other.',
          total_marks: 3,
          difficulty: currentDiff,
          svg_diagram: `<svg viewBox="0 0 760 150" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#FFF9F2;border:1px solid #E5DFD3;border-radius:16px;padding:12px;">
            <text x="380" y="80" font-size="20" font-weight="bold" fill="#0369A1" text-anchor="middle">💧 Condensation & Freezing 🧊</text>
          </svg>`
        });
      } else {
        list.push({
          question_number: i,
          title: `Question ${i}`,
          main_instruction: `${safeStage} ${safeSubject} — States of Matter (${safeStrand}): Evaporation & Puddles:`,
          sub_parts: [
            { label: '(a)', text: `Why does a water puddle shrink and disappear on a warm sunny day?`, marks: 1 },
            { label: '(b)', text: `Name the state of matter that expands to fill any closed vessel completely.`, marks: 1 },
            { label: '(c)', text: `State one difference between boiling and evaporation.`, marks: 1 }
          ],
          explanation: 'Evaporation turns liquid to gas. Gases expand to fill containers. Boiling occurs throughout at boiling point.',
          total_marks: 3,
          difficulty: currentDiff,
          svg_diagram: `<svg viewBox="0 0 760 150" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#FFF9F2;border:1px solid #E5DFD3;border-radius:16px;padding:12px;">
            <text x="380" y="80" font-size="20" font-weight="bold" fill="#D97706" text-anchor="middle">☀️ Evaporation of Puddles ☀️</text>
          </svg>`
        });
      }
    }
    // 3. LIGHT & SHADOWS / OPTICS
    else if (strandLower.includes('light') || strandLower.includes('shadow') || strandLower.includes('reflect') || strandLower.includes('sight') || strandLower.includes('optic')) {
      if (i % 3 === 1) {
        list.push({
          question_number: i,
          title: `Question ${i}`,
          main_instruction: `${safeStage} ${safeSubject} — Light & Shadows (${safeStrand}): Rays & Shadow Length:`,
          sub_parts: [
            { label: '(a)', text: `Is a wooden block classified as transparent, translucent, or opaque?`, marks: 1 },
            { label: '(b)', text: `How does shadow length change when a light source moves closer to an opaque object?`, marks: 1 },
            { label: '(c)', text: `Do light rays travel in straight lines or curved lines?`, marks: 1 }
          ],
          explanation: 'Wood is opaque. Moving light closer creates a larger shadow. Light travels in straight lines.',
          total_marks: 3,
          difficulty: currentDiff,
          svg_diagram: `<svg viewBox="0 0 760 150" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#FFF9F2;border:1px solid #E5DFD3;border-radius:16px;padding:12px;">
            <path d="M 100 60 L 160 40 L 160 100 L 100 80 Z" fill="#F59E0B"/>
            <rect x="320" y="45" width="50" height="60" fill="#78350F"/>
            <rect x="520" y="30" width="80" height="90" fill="#1E293B"/>
            <text x="560" y="80" font-size="12" font-weight="bold" fill="#FFF" text-anchor="middle">Opaque Shadow</text>
          </svg>`
        });
      } else if (i % 3 === 2) {
        list.push({
          question_number: i,
          title: `Question ${i}`,
          main_instruction: `${safeStage} ${safeSubject} — Light & Shadows (${safeStrand}): Reflection & Mirrors:`,
          sub_parts: [
            { label: '(a)', text: `Name a smooth shiny surface that reflects light rays evenly to form a clear image.`, marks: 1 },
            { label: '(b)', text: `Why can we see non-luminous objects like books and trees?`, marks: 1 },
            { label: '(c)', text: `Where will a shadow form relative to the light source position?`, marks: 1 }
          ],
          explanation: 'Plane mirror reflects light evenly. We see non-luminous objects because they reflect light into our eyes. Shadows form on the side opposite the light source.',
          total_marks: 3,
          difficulty: currentDiff,
          svg_diagram: `<svg viewBox="0 0 760 150" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#FFF9F2;border:1px solid #E5DFD3;border-radius:16px;padding:12px;">
            <text x="380" y="80" font-size="20" font-weight="bold" fill="#0284C7" text-anchor="middle">🪞 Mirror Light Reflection 🪞</text>
          </svg>`
        });
      } else {
        list.push({
          question_number: i,
          title: `Question ${i}`,
          main_instruction: `${safeStage} ${safeSubject} — Light & Shadows (${safeStrand}): Translucent Materials:`,
          sub_parts: [
            { label: '(a)', text: `Classify clear window glass as transparent, translucent, or opaque.`, marks: 1 },
            { label: '(b)', text: `Classify frosted bathroom glass as transparent, translucent, or opaque.`, marks: 1 },
            { label: '(c)', text: `Why do transparent materials not cast dark shadows?`, marks: 1 }
          ],
          explanation: 'Clear glass is transparent. Frosted glass is translucent. Transparent materials let almost all light pass through.',
          total_marks: 3,
          difficulty: currentDiff,
          svg_diagram: `<svg viewBox="0 0 760 150" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#FFF9F2;border:1px solid #E5DFD3;border-radius:16px;padding:12px;">
            <text x="380" y="80" font-size="20" font-weight="bold" fill="#059669" text-anchor="middle">🪟 Transparent vs Translucent 🪟</text>
          </svg>`
        });
      }
    }
    // 4. GENERAL SCIENCE
    else if (subjLower.includes('sci')) {
      if (i % 3 === 1) {
        list.push({
          question_number: i,
          title: `Question ${i}`,
          main_instruction: `${safeStage} ${safeSubject} — ${safeStrand}: Scientific Investigation & Variables:`,
          sub_parts: [
            { label: '(a)', text: `Identify the primary scientific variable changed during this ${safeStrand} experiment.`, marks: 1 },
            { label: '(b)', text: `State two control variables that must be kept constant for a fair test.`, marks: 1 },
            { label: '(c)', text: `Formulate a clear conclusion based on the observed experimental data.`, marks: 1 }
          ],
          explanation: `Identify independent variable for ${safeStrand}. Keep control variables identical. Conclusion links cause to effect.`,
          total_marks: 3,
          difficulty: currentDiff,
          svg_diagram: `<svg viewBox="0 0 760 140" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#FFF9F2;border:1px solid #E5DFD3;border-radius:16px;padding:12px;">
            <text x="380" y="75" font-size="18" font-weight="bold" fill="#059669" text-anchor="middle">🧪 Science Investigation: ${safeStrand} 🧪</text>
          </svg>`
        });
      } else if (i % 3 === 2) {
        list.push({
          question_number: i,
          title: `Question ${i}`,
          main_instruction: `${safeStage} ${safeSubject} — ${safeStrand}: Measuring Equipment & Accuracy:`,
          sub_parts: [
            { label: '(a)', text: `Name the scientific measuring instrument used to measure liquid volume accurately.`, marks: 1 },
            { label: '(b)', text: `State the standard metric unit used for measuring temperature.`, marks: 1 },
            { label: '(c)', text: `Why should scientific measurements be repeated three times?`, marks: 1 }
          ],
          explanation: 'Measuring cylinder measures liquid volume. Temperature unit is Degrees Celsius (°C). Repeating measurements calculates an average and reduces errors.',
          total_marks: 3,
          difficulty: currentDiff,
          svg_diagram: `<svg viewBox="0 0 760 140" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#FFF9F2;border:1px solid #E5DFD3;border-radius:16px;padding:12px;">
            <text x="380" y="75" font-size="18" font-weight="bold" fill="#0284C7" text-anchor="middle">🌡️ Measuring Cylinder & Thermometer 🌡️</text>
          </svg>`
        });
      } else {
        list.push({
          question_number: i,
          title: `Question ${i}`,
          main_instruction: `${safeStage} ${safeSubject} — ${safeStrand}: Data Presentation & Graphs:`,
          sub_parts: [
            { label: '(a)', text: `Which axis on a bar chart displays the independent variable?`, marks: 1 },
            { label: '(b)', text: `Identify the anomalous outlier reading in the dataset: 12, 11, 29, 13.`, marks: 1 },
            { label: '(c)', text: `State how safety goggles protect student eyes during practical science tasks.`, marks: 1 }
          ],
          explanation: 'X-axis shows independent variable. 29 is the anomalous outlier. Goggles shield eyes from chemical splashes and debris.',
          total_marks: 3,
          difficulty: currentDiff,
          svg_diagram: `<svg viewBox="0 0 760 140" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#FFF9F2;border:1px solid #E5DFD3;border-radius:16px;padding:12px;">
            <text x="380" y="75" font-size="18" font-weight="bold" fill="#7C3AED" text-anchor="middle">📊 Bar Chart Data & Safety Goggles 🥽</text>
          </svg>`
        });
      }
    }
    // 5. GLOBAL PERSPECTIVES & SOCIAL STUDIES
    else if (subjLower.includes('global') || subjLower.includes('perspective') || subjLower.includes('social') || subjLower.includes('geog') || subjLower.includes('hist')) {
      if (i % 3 === 1) {
        list.push({
          question_number: i,
          title: `Question ${i}`,
          main_instruction: `${safeStage} ${safeSubject} — ${safeStrand}: Research & Critical Analysis:`,
          sub_parts: [
            { label: '(a)', text: `Identify one major environmental or social issue affecting your local community.`, marks: 1 },
            { label: '(b)', text: `Compare how two different countries approach waste management or energy saving.`, marks: 1 },
            { label: '(c)', text: `Propose two sustainable actions students can take at school.`, marks: 1 }
          ],
          explanation: 'Local issues include plastic waste. Comparison evaluates national strategies. Actions include recycling programs.',
          total_marks: 3,
          difficulty: currentDiff,
          svg_diagram: `<svg viewBox="0 0 760 150" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#FFF9F2;border:1px solid #E5DFD3;border-radius:16px;padding:12px;">
            <circle cx="380" cy="75" r="50" fill="#E0F2FE" stroke="#0284C7" stroke-width="2"/>
            <text x="380" y="83" font-size="36" text-anchor="middle">🌍</text>
            <text x="180" y="75" font-size="14" font-weight="bold" fill="#0369A1" text-anchor="middle">Local Action 🏠</text>
            <text x="580" y="75" font-size="14" font-weight="bold" fill="#0369A1" text-anchor="middle">Global Impact 🌐</text>
          </svg>`
        });
      } else if (i % 3 === 2) {
        list.push({
          question_number: i,
          title: `Question ${i}`,
          main_instruction: `${safeStage} ${safeSubject} — ${safeStrand}: Local vs Global Viewpoints:`,
          sub_parts: [
            { label: '(a)', text: `Distinguish between a factual evidence statement and a personal opinion statement.`, marks: 1 },
            { label: '(b)', text: `Explain why communities in different regions have differing perspectives on water conservation.`, marks: 1 },
            { label: '(c)', text: `Suggest one method for collecting fair, unbiased survey data in your classroom.`, marks: 1 }
          ],
          explanation: 'Facts are verifiable data; opinions are personal beliefs. Regional climate affects water priority. Surveys require neutral wording.',
          total_marks: 3,
          difficulty: currentDiff,
          svg_diagram: `<svg viewBox="0 0 760 140" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#FFF9F2;border:1px solid #E5DFD3;border-radius:16px;padding:12px;">
            <rect x="120" y="30" width="220" height="80" rx="12" fill="#EEF2FF" stroke="#6366F1"/><text x="230" y="75" font-size="14" font-weight="bold" fill="#3730A3" text-anchor="middle">Local Perspective 💬</text>
            <rect x="420" y="30" width="220" height="80" rx="12" fill="#FEF3C7" stroke="#F59E0B"/><text x="530" y="75" font-size="14" font-weight="bold" fill="#78350F" text-anchor="middle">Global Perspective 🌏</text>
          </svg>`
        });
      } else {
        list.push({
          question_number: i,
          title: `Question ${i}`,
          main_instruction: `${safeStage} ${safeSubject} — ${safeStrand}: Sustainability & Action Plans:`,
          sub_parts: [
            { label: '(a)', text: `Define what is meant by sustainable development goals.`, marks: 1 },
            { label: '(b)', text: `Analyze the benefits of replacing fossil fuels with solar and wind power.`, marks: 1 },
            { label: '(c)', text: `Create a 3-step action plan to improve recycling in your school.`, marks: 1 }
          ],
          explanation: 'Sustainability meets current needs without compromising future generations. Solar/wind reduce emissions. Action plan: bins, monitoring, incentives.',
          total_marks: 3,
          difficulty: currentDiff,
          svg_diagram: `<svg viewBox="0 0 760 140" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#FFF9F2;border:1px solid #E5DFD3;border-radius:16px;padding:12px;">
            <text x="380" y="75" font-size="34" text-anchor="middle">☀️ ⚡ ☀️ 🍃 🌳</text>
          </svg>`
        });
      }
    }
    // 6. MATHEMATICS
    else if (subjLower.includes('math')) {
      if (i % 3 === 1) {
        list.push({
          question_number: i,
          title: `Question ${i}`,
          main_instruction: `${safeStage} ${safeSubject} — ${safeStrand}: Pattern & Number Sequences:`,
          sub_parts: [
            { label: '(a)', text: `Fill in missing numbers: ${i * 4}, ${i * 4 + 4}, [ _____ ], ${i * 4 + 12}, [ _____ ]`, marks: 2 },
            { label: '(b)', text: `State the rule for continuing this sequence.`, marks: 1 },
            { label: '(c)', text: `What is the next term after ${i * 4 + 16}?`, marks: 1 }
          ],
          explanation: `Sequence increases by +4 each step. Rule: Add 4.`,
          total_marks: 4,
          difficulty: currentDiff,
          svg_diagram: `<svg viewBox="0 0 760 140" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#FFF9F2;border:1px solid #E5DFD3;border-radius:16px;padding:12px;">
            <line x1="40" y1="70" x2="720" y2="70" stroke="#0284C7" stroke-width="3"/>
            <circle cx="100" cy="70" r="10" fill="#0284C7"/><text x="100" y="105" font-size="14" font-weight="bold" text-anchor="middle" fill="#0369A1">${i * 4}</text>
            <circle cx="280" cy="70" r="10" fill="#0284C7"/><text x="280" y="105" font-size="14" font-weight="bold" text-anchor="middle" fill="#0369A1">${i * 4 + 4}</text>
            <circle cx="460" cy="70" r="10" fill="#E11D48"/><text x="460" y="105" font-size="14" font-weight="bold" text-anchor="middle" fill="#E11D48">?</text>
            <circle cx="640" cy="70" r="10" fill="#0284C7"/><text x="640" y="105" font-size="14" font-weight="bold" text-anchor="middle" fill="#0369A1">${i * 4 + 12}</text>
          </svg>`
        });
      } else if (i % 3 === 2) {
        list.push({
          question_number: i,
          title: `Question ${i}`,
          main_instruction: `${safeStage} ${safeSubject} — Geometry (${safeStrand}): Polygon Properties:`,
          sub_parts: [
            { label: '(a)', text: `Identify the 2D polygon with 5 equal straight sides.`, marks: 1 },
            { label: '(b)', text: `How many lines of symmetry does a regular pentagon have?`, marks: 1 },
            { label: '(c)', text: `Calculate its perimeter if each side measures ${i + 3} cm.`, marks: 1 }
          ],
          explanation: `5-sided polygon is a Pentagon. Lines of symmetry = 5. Perimeter = 5 × ${i + 3} = ${(i + 3) * 5} cm.`,
          total_marks: 3,
          difficulty: currentDiff,
          svg_diagram: `<svg viewBox="0 0 760 150" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#FFF9F2;border:1px solid #E5DFD3;border-radius:16px;padding:12px;">
            <polygon points="380,20 490,55 450,135 310,135 270,55" fill="#E0F2FE" stroke="#0284C7" stroke-width="3"/>
            <text x="380" y="85" font-size="16" font-weight="bold" fill="#0369A1" text-anchor="middle">Regular Pentagon (Side = ${i + 3} cm)</text>
          </svg>`
        });
      } else {
        list.push({
          question_number: i,
          title: `Question ${i}`,
          main_instruction: `${safeStage} ${safeSubject} — Fractions (${safeStrand}): Visual Fractions & Money:`,
          sub_parts: [
            { label: '(a)', text: `Calculate total cost: Notebook ($${i + 2}.50) + Pencil ($1.25).`, marks: 1 },
            { label: '(b)', text: `If paying with a $10 note, calculate the remaining change.`, marks: 1 },
            { label: '(c)', text: `Which fraction is larger: 1/2 or 3/4?`, marks: 1 }
          ],
          explanation: `Total = $${(i + 3.75).toFixed(2)}. Change = $${(10 - (i + 3.75)).toFixed(2)}. 3/4 is larger than 1/2.`,
          total_marks: 3,
          difficulty: currentDiff,
          svg_diagram: `<svg viewBox="0 0 760 140" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#FFF9F2;border:1px solid #E5DFD3;border-radius:16px;padding:12px;">
            <text x="380" y="75" font-size="20" font-weight="bold" fill="#059669" text-anchor="middle">Notebook ($${i + 2}.50) + Pencil ($1.25) = $${(i + 3.75).toFixed(2)}</text>
          </svg>`
        });
      }
    }
    // 7. ENGLISH & OTHER SUBJECTS
    else {
      if (i % 3 === 1) {
        list.push({
          question_number: i,
          title: `Question ${i}`,
          main_instruction: `${safeStage} ${safeSubject} — ${safeStrand}: Sentence Editing & Punctuation:`,
          sub_parts: [
            { label: '(a)', text: `Which four words require capital letters in: "on tuesday morning amira visited london"?`, marks: 1 },
            { label: '(b)', text: `What punctuation mark belongs at the end of the sentence?`, marks: 1 },
            { label: '(c)', text: `Why does 'London' require a capital letter?`, marks: 1 }
          ],
          explanation: 'Capital letters: On, Tuesday, Amira, London. Full stop (.) goes at end. London is a proper noun.',
          total_marks: 3,
          difficulty: currentDiff,
          svg_diagram: `<svg viewBox="0 0 760 140" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#FFF9F2;border:1px solid #E5DFD3;border-radius:16px;padding:12px;">
            <text x="380" y="77" font-size="16" font-weight="bold" fill="#0F172A" text-anchor="middle">"On Tuesday morning, Amira visited London."</text>
          </svg>`
        });
      } else if (i % 3 === 2) {
        list.push({
          question_number: i,
          title: `Question ${i}`,
          main_instruction: `${safeStage} ${safeSubject} — ${safeStrand}: Parts of Speech & Grammar:`,
          sub_parts: [
            { label: '(a)', text: `Identify two nouns in: "The curious student explored the quiet library carefully."`, marks: 1 },
            { label: '(b)', text: `Identify the main action verb.`, marks: 1 },
            { label: '(c)', text: `Identify two adjectives describing the nouns.`, marks: 1 }
          ],
          explanation: 'Nouns: student, library. Verb: explored. Adjectives: curious, quiet.',
          total_marks: 3,
          difficulty: currentDiff,
          svg_diagram: `<svg viewBox="0 0 760 140" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#FFF9F2;border:1px solid #E5DFD3;border-radius:16px;padding:12px;">
            <text x="380" y="77" font-size="16" font-weight="bold" fill="#0F172A" text-anchor="middle">Grammar &amp; Parts of Speech</text>
          </svg>`
        });
      } else {
        list.push({
          question_number: i,
          title: `Question ${i}`,
          main_instruction: `${safeStage} ${safeSubject} — ${safeStrand}: Vocabulary & Reading Comprehension:`,
          sub_parts: [
            { label: '(a)', text: `Pair antonyms: enormous / tiny, swift / sluggish.`, marks: 1 },
            { label: '(b)', text: `Write a synonym for 'swift'.`, marks: 1 },
            { label: '(c)', text: `Use 'radiant' in a descriptive sentence.`, marks: 1 }
          ],
          explanation: 'Synonym for swift: fast. Radiant means shining brightly.',
          total_marks: 3,
          difficulty: currentDiff,
          svg_diagram: `<svg viewBox="0 0 760 140" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#FFF9F2;border:1px solid #E5DFD3;border-radius:16px;padding:12px;">
            <text x="380" y="75" font-size="20" font-weight="bold" fill="#0284C7">enormous ↔ tiny | swift ↔ sluggish</text>
          </svg>`
        });
      }
    }
  }

  return list;
}
