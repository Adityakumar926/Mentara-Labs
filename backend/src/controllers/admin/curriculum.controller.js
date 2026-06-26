const db = require('../../config/db');

// ─── CURRICULUMS ─────────────────────────────────────────────────────────────

exports.getAll = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT
        c.*,
        (SELECT COUNT(*) FROM classes cl WHERE cl.curriculum_id = c.id) AS class_count,
        COUNT(DISTINCT bs.student_id) AS student_count
      FROM curriculums c
      LEFT JOIN batches  b  ON b.curriculum_id = c.id
      LEFT JOIN batch_students bs ON bs.batch_id = b.id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllSubjects = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT s.*, cl.name AS class_name, c.name AS curriculum_name, cl.curriculum_id
       FROM subjects s
       LEFT JOIN classes cl ON s.class_id = cl.id
       LEFT JOIN curriculums c ON cl.curriculum_id = c.id
       ORDER BY c.name, cl.order_index, s.order_index`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT c.*,
              json_agg(
                json_build_object(
                  'id', cl.id, 'name', cl.name,
                  'description', cl.description,
                  'order_index', cl.order_index
                ) ORDER BY cl.order_index
              ) FILTER (WHERE cl.id IS NOT NULL) AS classes
       FROM curriculums c
       LEFT JOIN classes cl ON cl.curriculum_id = c.id
       WHERE c.id = $1
       GROUP BY c.id`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Curriculum not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description, thumbnail_url } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

    const { rows } = await db.query(
      `INSERT INTO curriculums (name, description, thumbnail_url, created_by)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, description, thumbnail_url, req.user.id]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, description, thumbnail_url, is_active } = req.body;
    const { rows } = await db.query(
      `UPDATE curriculums
       SET name          = COALESCE($1, name),
           description   = COALESCE($2, description),
           thumbnail_url = COALESCE($3, thumbnail_url),
           is_active     = COALESCE($4, is_active)
       WHERE id = $5 RETURNING *`,
      [name, description, thumbnail_url, is_active, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Curriculum not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { rowCount } = await db.query(
      'DELETE FROM curriculums WHERE id = $1', [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ success: false, message: 'Curriculum not found' });
    res.json({ success: true, message: 'Curriculum deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── SUBJECTS ─────────────────────────────────────────────────────────────────

exports.createSubject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const { classId } = req.params;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

    const { rows: orderRows } = await db.query(
      `SELECT COALESCE(MAX(order_index), -1) + 1 AS next_order
       FROM subjects WHERE class_id = $1`,
      [classId]
    );
    const { rows } = await db.query(
      `INSERT INTO subjects (class_id, name, description, order_index)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [classId, name, description, orderRows[0].next_order]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateSubject = async (req, res) => {
  try {
    const { name, description, order_index } = req.body;
    const { rows } = await db.query(
      `UPDATE subjects
       SET name        = COALESCE($1, name),
           description = COALESCE($2, description),
           order_index = COALESCE($3, order_index)
       WHERE id = $4 RETURNING *`,
      [name, description, order_index, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.reorderSubjects = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { order } = req.body;
    await client.query('BEGIN');
    for (const item of order) {
      await client.query(
        'UPDATE subjects SET order_index = $1 WHERE id = $2',
        [item.order_index, item.id]
      );
    }
    await client.query('COMMIT');
    res.json({ success: true, message: 'Order updated' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    const { rowCount } = await db.query(
      'DELETE FROM subjects WHERE id = $1', [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.json({ success: true, message: 'Subject deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── CONTENT — READ ───────────────────────────────────────────────────────────

exports.getSubjectContent = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT
         c.*,
         a.html_content
       FROM content c
       LEFT JOIN animations a ON a.id = c.animation_id
       WHERE c.topic_id = $1
       ORDER BY c.order_index ASC`,
      [req.params.topicId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── CONTENT — NOTE UPLOAD ────────────────────────────────────────────────────
// POST /admin/subjects/:subjectId/content/note
// multipart/form-data: file (PDF), title, is_premium

exports.uploadNote = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: 'No file uploaded' });

    const { title, is_premium } = req.body;
    if (!title)
      return res.status(400).json({ success: false, message: 'title is required' });

    const cloudinaryService = require('../../services/cloudinary.service');
    const result = await cloudinaryService.uploadImage(req.file.buffer, 'notes', {
      resource_type: 'raw',
      public_id: `${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}`,
      use_filename: false,
    });
    const file_url = result.url;

    const { rows: orderRows } = await db.query(
      `SELECT COALESCE(MAX(order_index), -1) + 1 AS next_order
       FROM content WHERE topic_id = $1`,
      [req.params.topicId]
    );

    const { rows } = await db.query(
      `INSERT INTO content
         (topic_id, title, content_type, file_url, is_premium, order_index)
       VALUES ($1, $2, 'note', $3, $4, $5)
       RETURNING *`,
      [req.params.topicId, title, file_url, is_premium === 'true', orderRows[0].next_order]
    );

    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[uploadNote]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── CONTENT — NOTE REPLACE ───────────────────────────────────────────────────
// PUT /admin/content/:id/note
// multipart/form-data: file (PDF, optional), title (optional), is_premium (optional)

exports.replaceNote = async (req, res) => {
  try {
    const { title, is_premium } = req.body;

    const { rows: existing } = await db.query(
      `SELECT file_url FROM content WHERE id = $1 AND content_type = 'note'`,
      [req.params.id]
    );

    if (!existing[0])
      return res.status(404).json({ success: false, message: 'Note not found' });

    let file_url = existing[0].file_url;

    if (req.file) {
      const cloudinaryService = require('../../services/cloudinary.service');
      const result = await cloudinaryService.uploadImage(req.file.buffer, 'notes', {
        resource_type: 'raw',
        public_id: `${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}`,
        use_filename: false,
      });
      file_url = result.url;
    }

    const { rows } = await db.query(
      `UPDATE content
       SET title      = COALESCE($1, title),
           file_url   = $2,
           is_premium = COALESCE($3, is_premium)
       WHERE id = $4
       RETURNING *`,
      [title ?? null, file_url, is_premium !== undefined ? is_premium === 'true' : null, req.params.id]
    );

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── CONTENT — WORKSHEET UPLOAD ───────────────────────────────────────────────
// POST /admin/subjects/:subjectId/content/worksheet
// multipart/form-data: file (image — jpg/png/webp), title, is_premium

exports.uploadWorksheet = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: 'No file uploaded' });

    const { title, is_premium } = req.body;
    if (!title)
      return res.status(400).json({ success: false, message: 'title is required' });

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(req.file.mimetype))
      return res.status(400).json({ success: false, message: 'Only JPG, PNG, or WebP images are accepted' });

    const cloudinaryService = require('../../services/cloudinary.service');
    const result = await cloudinaryService.uploadImage(req.file.buffer, 'worksheets', {
      resource_type: 'image',
      public_id: `${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}`,
      use_filename: false,
    });
    const file_url = result.url;

    const { rows: orderRows } = await db.query(
      `SELECT COALESCE(MAX(order_index), -1) + 1 AS next_order
       FROM content WHERE topic_id = $1`,
      [req.params.topicId]
    );

    const { rows } = await db.query(
      `INSERT INTO content
         (topic_id, title, content_type, file_url, is_premium, order_index)
       VALUES ($1, $2, 'worksheet', $3, $4, $5)
       RETURNING *`,
      [req.params.topicId, title, file_url, is_premium === 'true', orderRows[0].next_order]
    );

    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[uploadWorksheet]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── CONTENT — WORKSHEET REPLACE ─────────────────────────────────────────────
// PUT /admin/content/:id/worksheet
// multipart/form-data: file (image, optional), title (optional), is_premium (optional)

exports.replaceWorksheet = async (req, res) => {
  try {
    const { title, is_premium } = req.body;

    const { rows: existing } = await db.query(
      `SELECT file_url FROM content WHERE id = $1 AND content_type = 'worksheet'`,
      [req.params.id]
    );

    if (!existing[0])
      return res.status(404).json({ success: false, message: 'Worksheet not found' });

    let file_url = existing[0].file_url;

    if (req.file) {
      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowed.includes(req.file.mimetype))
        return res.status(400).json({ success: false, message: 'Only JPG, PNG, or WebP images are accepted' });

      const cloudinaryService = require('../../services/cloudinary.service');
      const result = await cloudinaryService.uploadImage(req.file.buffer, 'worksheets', {
        resource_type: 'image',
        public_id: `${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}`,
        use_filename: false,
      });
      file_url = result.url;
    }

    const { rows } = await db.query(
      `UPDATE content
       SET title      = COALESCE($1, title),
           file_url   = $2,
           is_premium = COALESCE($3, is_premium)
       WHERE id = $4
       RETURNING *`,
      [title ?? null, file_url, is_premium !== undefined ? is_premium === 'true' : null, req.params.id]
    );

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── CONTENT — MUX DIRECT UPLOAD (step 1) ────────────────────────────────────
// POST /admin/subjects/:subjectId/content/video/upload-url
// Body: { title, is_premium }

exports.createMuxUpload = async (req, res) => {
  try {
    const { title, is_premium } = req.body;
    if (!title)
      return res.status(400).json({ success: false, message: 'title is required' });

    const muxService = require('../../services/mux.service');
    const { uploadUrl, uploadId } = await muxService.createUploadUrl();

    const { rows: orderRows } = await db.query(
      `SELECT COALESCE(MAX(order_index), -1) + 1 AS next_order
       FROM content WHERE topic_id = $1`,
      [req.params.topicId]
    );

    const { rows } = await db.query(
      `INSERT INTO content
         (topic_id, title, content_type, mux_upload_id, is_premium, order_index)
       VALUES ($1, $2, 'video', $3, $4, $5)
       RETURNING *`,
      [req.params.topicId, title, uploadId, is_premium === 'true', orderRows[0].next_order]
    );

    res.status(201).json({
      success: true,
      uploadUrl,
      uploadId,
      content_id: rows[0].id,
    });
  } catch (err) {
    console.error('[createMuxUpload]', err.message, err.status, err.type);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── CONTENT — MUX CONFIRM (step 2) ──────────────────────────────────────────
// POST /admin/content/:id/video/confirm
// Body: { upload_id }

exports.confirmMuxUpload = async (req, res) => {
  try {
    const { upload_id } = req.body;
    if (!upload_id)
      return res.status(400).json({ success: false, message: 'upload_id is required' });

    const muxClient = require('../../config/mux');

    let assetId;
    for (let attempt = 0; attempt < 10; attempt++) {
      const upload = await muxClient.video.uploads.retrieve(upload_id);
      if (upload.asset_id) { assetId = upload.asset_id; break; }
      await new Promise((r) => setTimeout(r, 3000));
    }

    if (!assetId)
      return res.status(202).json({
        success: false,
        processing: true,
        message: 'Mux is still processing. Try confirming again in a few seconds.',
      });

    const asset = await muxClient.video.assets.retrieve(assetId);
    const playbackId = asset.playback_ids?.[0]?.id;

    if (!playbackId)
      return res.status(202).json({
        success: false,
        processing: true,
        message: 'Asset is still being prepared. Try confirming again shortly.',
      });

    const { rows } = await db.query(
      `UPDATE content
       SET mux_asset_id    = $1,
           mux_playback_id = $2
       WHERE id = $3
       RETURNING *`,
      [assetId, playbackId, req.params.id]
    );

    if (!rows[0])
      return res.status(404).json({ success: false, message: 'Content row not found' });

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── CONTENT — GENERIC ADD (animations only) ──────────────────────────────────
// POST /admin/subjects/:subjectId/content
// For notes use /content/note, for videos use /content/video/upload-url,
// for worksheets use /content/worksheet.

exports.addContent = async (req, res) => {
  try {
    const { title, content_type, animation_id, is_premium } = req.body;
    const topic_id = req.params.topicId;

    if (content_type !== 'animation') {
      const hint =
        content_type === 'note'
          ? 'POST /api/admin/topics/:topicId/content/note'
          : content_type === 'video'
            ? 'POST /api/admin/topics/:topicId/content/video/upload-url'
            : content_type === 'worksheet'
              ? 'POST /api/admin/topics/:topicId/content/worksheet'
              : 'the dedicated note/video/worksheet upload endpoints';
      return res.status(400).json({
        success: false,
        message: `Use ${hint} for ${content_type || 'this content type'} uploads.`,
      });
    }

    if (!title)
      return res.status(400).json({ success: false, message: 'title is required' });
    if (!animation_id)
      return res.status(400).json({ success: false, message: 'animation_id is required' });

    const { rows: orderRows } = await db.query(
      `SELECT COALESCE(MAX(order_index), -1) + 1 AS next_order
       FROM content WHERE topic_id = $1`,
      [topic_id]
    );
    const { rows } = await db.query(
      `INSERT INTO content
         (topic_id, title, content_type, animation_id, is_premium, order_index)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [topic_id, title, content_type, animation_id, is_premium, orderRows[0].next_order]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── CONTENT — GENERIC UPDATE ─────────────────────────────────────────────────

exports.updateContent = async (req, res) => {
  try {
    const { title, is_premium, order_index } = req.body;
    const { rows } = await db.query(
      `UPDATE content
       SET title       = COALESCE($1, title),
           is_premium  = COALESCE($2, is_premium),
           order_index = COALESCE($3, order_index)
       WHERE id = $4 RETURNING *`,
      [title, is_premium, order_index, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Content not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── CONTENT — DELETE ─────────────────────────────────────────────────────────

exports.deleteContent = async (req, res) => {
  try {
    const { rows: existing } = await db.query(
      `SELECT content_type, file_url, mux_asset_id FROM content WHERE id = $1`,
      [req.params.id]
    );

    if (existing[0]?.content_type === 'note' && existing[0]?.file_url) {
      try {
        const b2Service = require('../../services/b2.service');
        const key = new URL(existing[0].file_url).pathname.slice(1);
        await b2Service.deleteFile(key);
      } catch (_) { /* Non-fatal */ }
    }

    // Worksheet images on Cloudinary — deletion is non-fatal / optional
    // (Cloudinary auto-cleans via lifecycle rules; add explicit delete here if needed)

    if (existing[0]?.content_type === 'video' && existing[0]?.mux_asset_id) {
      try {
        const muxService = require('../../services/mux.service');
        await muxService.deleteAsset(existing[0].mux_asset_id);
      } catch (_) { /* Non-fatal */ }
    }

    const { rowCount } = await db.query(
      'DELETE FROM content WHERE id = $1', [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ success: false, message: 'Content not found' });
    res.json({ success: true, message: 'Content deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};