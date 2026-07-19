const db = require('../../config/db');
const cloudinaryService = require('../../services/cloudinary.service');

// Whitelist of columns that can be updated via the API
const UPDATABLE_FIELDS = new Set([
  'subject_id', 'topic_id', 'question_type', 'question_text', 'options',
  'correct_answer', 'explanation', 'difficulty', 'tags', 'is_premium', 'image_url', 'destination'
]);

exports.getAll = async (req, res) => {
  try {
    const { subject_id, topic_id, class_id, curriculum_id, type, is_premium, is_starred, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (subject_id)          { params.push(subject_id);           conditions.push(`q.subject_id = $${params.length}`); }
    if (topic_id)            { params.push(topic_id);             conditions.push(`q.topic_id = $${params.length}`); }
    if (class_id)            { params.push(class_id);             conditions.push(`s.class_id = $${params.length}`); }
    if (curriculum_id)       { params.push(curriculum_id);        conditions.push(`cl.curriculum_id = $${params.length}`); }
    if (type)                { params.push(type);                  conditions.push(`q.question_type = $${params.length}`); }
    if (is_premium !== undefined) { params.push(is_premium === 'true'); conditions.push(`q.is_premium = $${params.length}`); }
    if (is_starred !== undefined) { params.push(is_starred === 'true'); conditions.push(`q.is_starred = $${params.length}`); }
    if (search)              { params.push(`%${search}%`);         conditions.push(`COALESCE(q.question_text, '') ILIKE $${params.length}`); }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    params.push(limit, offset);

    const { rows } = await db.query(
      `SELECT q.*, 
              s.name AS subject_name,
              cl.name AS class_name,
              c.name AS curriculum_name,
              t.name AS topic_name
       FROM questions q
       LEFT JOIN subjects s ON q.subject_id = s.id
       LEFT JOIN classes cl ON s.class_id = cl.id
       LEFT JOIN curriculums c ON cl.curriculum_id = c.id
       LEFT JOIN topics t ON q.topic_id = t.id
       ${where}
       ORDER BY q.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const {
      subject_id, topic_id, question_type, question_text, options,
      correct_answer, explanation, difficulty, tags, is_premium, image_url, destination
    } = req.body;

    if (!subject_id || !question_type)
      return res.status(400).json({ success: false, message: 'subject_id and question_type are required' });

    const targetDestination = ['shared', 'student', 'teacher'].includes(destination) ? destination : 'shared';

    const { rows } = await db.query(
      `INSERT INTO questions
       (subject_id, topic_id, question_type, question_text, options, correct_answer,
        explanation, difficulty, tags, is_premium, image_url, created_by, destination)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [
        subject_id, topic_id || null, question_type, question_text || null,
        JSON.stringify(options ?? []),
        correct_answer, explanation, difficulty, tags,
        is_premium ?? false, image_url ?? null, req.user.id, targetDestination
      ]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if image_url is being updated/replaced, clean up the old one from Cloudinary
    if (req.body.hasOwnProperty('image_url')) {
      const { rows: existing } = await db.query(
        'SELECT image_url FROM questions WHERE id = $1',
        [id]
      );
      const oldUrl = existing[0]?.image_url;
      const newUrl = req.body.image_url;
      if (oldUrl && oldUrl !== newUrl && oldUrl.includes('cloudinary')) {
        const match = oldUrl.match(/\/upload\/(?:v\d+\/)?([^\s?.]+)(?:\.[a-z0-9]+)?$/i);
        if (match) {
          cloudinaryService.deleteImage(match[1]).catch(() => {});
        }
      }
    }

    // ── Security: only allow known columns ──────────────────────────────────
    const fields = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => UPDATABLE_FIELDS.has(k))
    );
    if (!Object.keys(fields).length)
      return res.status(400).json({ success: false, message: 'No valid fields provided for update' });

    const keys   = Object.keys(fields);
    // Stringify options array so PostgreSQL receives valid JSON
    const values = Object.values(fields).map((v, i) =>
      keys[i] === 'options' && typeof v !== 'string' ? JSON.stringify(v) : v
    );
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');

    const { rows } = await db.query(
      `UPDATE questions SET ${setClause}, updated_at = NOW()
       WHERE id = $${keys.length + 1} RETURNING *`,
      [...values, id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Question not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { rows: existing } = await db.query(
      'SELECT image_url FROM questions WHERE id = $1',
      [req.params.id]
    );

    if (existing[0]?.image_url && existing[0].image_url.includes('cloudinary')) {
      const match = existing[0].image_url.match(/\/upload\/(?:v\d+\/)?([^\s?.]+)(?:\.[a-z0-9]+)?$/i);
      if (match) {
        cloudinaryService.deleteImage(match[1]).catch(() => {});
      }
    }

    const { rowCount } = await db.query(
      'DELETE FROM questions WHERE id = $1', [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ success: false, message: 'Question not found' });
    res.json({ success: true, message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleStar = async (req, res) => {
  try {
    const { rows } = await db.query(
      'UPDATE questions SET is_starred = NOT is_starred WHERE id = $1 RETURNING is_starred',
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Question not found' });
    res.json({ success: true, is_starred: rows[0].is_starred });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.togglePremium = async (req, res) => {
  try {
    const { rows } = await db.query(
      'UPDATE questions SET is_premium = NOT is_premium WHERE id = $1 RETURNING is_premium',
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Question not found' });
    res.json({ success: true, is_premium: rows[0].is_premium });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Uploads a question's image to Cloudinary and returns its URL.
// Frontend calls this as soon as a file is picked, then sends the returned
// url back as `image_url` on the regular JSON create/update call.
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: 'No file uploaded' });

    const { url, publicId } = await cloudinaryService.uploadImage(
      req.file.buffer,
      'question-images'
    );
    res.json({ success: true, data: { url, publicId } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Bulk Upload multiple question images at once
exports.bulkUploadImages = async (req, res) => {
  try {
    const files = req.files;
    if (!files || !files.length) {
      return res.status(400).json({ success: false, message: 'No image files uploaded' });
    }

    const {
      subject_id, topic_id, question_type = 'photo',
      is_premium = 'false', destination = 'shared'
    } = req.body;

    if (!subject_id) {
      return res.status(400).json({ success: false, message: 'subject_id is required' });
    }

    let metadataList = [];
    if (req.body.metadata) {
      try {
        metadataList = JSON.parse(req.body.metadata);
      } catch (e) {
        metadataList = [];
      }
    }

    const targetDestination = ['shared', 'student', 'teacher'].includes(destination) ? destination : 'shared';
    const isPrem = is_premium === 'true' || is_premium === true;

    // Upload to Cloudinary in parallel chunks of 5 to prevent memory/rate-limit pressure
    const uploadResults = [];
    const BATCH_SIZE = 5;
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const chunk = files.slice(i, i + BATCH_SIZE);
      const chunkResults = await Promise.allSettled(
        chunk.map(file => cloudinaryService.uploadImage(file.buffer, 'question-images'))
      );
      
      chunkResults.forEach((res, idx) => {
        const fileIdx = i + idx;
        const fileMeta = metadataList[fileIdx] || {};
        if (res.status === 'fulfilled') {
          uploadResults.push({
            success: true,
            url: res.value.url,
            originalName: files[fileIdx].originalname,
            difficulty: fileMeta.difficulty || 'medium',
            questionText: fileMeta.questionText || null,
            is_premium: fileMeta.is_premium === true || fileMeta.is_premium === 'true' ? true : isPrem,
          });
        } else {
          uploadResults.push({
            success: false,
            error: res.reason?.message || 'Upload failed',
            originalName: files[fileIdx].originalname,
          });
        }
      });
    }

    const successfulUploads = uploadResults.filter(r => r.success);
    if (!successfulUploads.length) {
      return res.status(500).json({ success: false, message: 'All image uploads failed' });
    }

    // Create DB records for successful uploads
    const insertedQuestions = [];
    for (const item of successfulUploads) {
      const { rows } = await db.query(
        `INSERT INTO questions
         (subject_id, topic_id, question_type, question_text, options, correct_answer,
          explanation, difficulty, tags, is_premium, image_url, created_by, destination)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
        [
          subject_id,
          topic_id || null,
          question_type,
          item.questionText || null,
          JSON.stringify([]),
          null,
          null,
          item.difficulty || 'medium',
          null,
          item.is_premium ?? isPrem,
          item.url,
          req.user.id,
          targetDestination
        ]
      );
      insertedQuestions.push(rows[0]);
    }

    res.json({
      success: true,
      message: `Successfully created ${insertedQuestions.length} questions`,
      data: insertedQuestions,
      totalFiles: files.length,
      successCount: insertedQuestions.length,
      failureCount: files.length - insertedQuestions.length,
    });
  } catch (err) {
    console.error('[bulkUploadImages Error]', err);
    res.status(500).json({ success: false, message: err.message });
  }
};