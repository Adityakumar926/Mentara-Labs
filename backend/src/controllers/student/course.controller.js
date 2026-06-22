const db = require('../../config/db');

// ─── STUDENT CURRICULUM ACCESS ────────────────────────────────────────────────

exports.getMyCurriculums = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT DISTINCT
         c.id, c.name, c.description, c.thumbnail_url,
         b.id   AS batch_id,
         b.name AS batch_name,
         b.start_date, b.end_date,
         COUNT(DISTINCT s.id) AS subject_count
       FROM batch_students bs
       JOIN batches b      ON b.id = bs.batch_id
       JOIN curriculums c  ON c.id = b.curriculum_id
       LEFT JOIN subjects s ON s.curriculum_id = c.id
       WHERE bs.student_id = $1 AND c.is_active = true
       GROUP BY c.id, b.id
       ORDER BY b.start_date DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCurriculumSubjects = async (req, res) => {
  try {
    const { rows: access } = await db.query(
      `SELECT 1 FROM batch_students bs
       JOIN batches b ON b.id = bs.batch_id
       WHERE bs.student_id = $1 AND b.curriculum_id = $2`,
      [req.user.id, req.params.curriculumId]
    );
    if (!access.length)
      return res.status(403).json({ success: false, message: 'Not enrolled in this curriculum' });

    const { rows } = await db.query(
      `SELECT
         s.*,
         COUNT(c.id) AS content_count,
         COUNT(c.id) FILTER (WHERE c.is_premium = true) AS premium_content_count
       FROM subjects s
       LEFT JOIN content c ON c.subject_id = s.id
       WHERE s.curriculum_id = $1
       GROUP BY s.id
       ORDER BY s.order_index`,
      [req.params.curriculumId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSubjectContent = async (req, res) => {
  try {
    const isPremium = req.user.is_premium;

    const { rows: access } = await db.query(
      `SELECT 1 FROM batch_students bs
       JOIN batches   b ON b.id = bs.batch_id
       JOIN subjects  s ON s.curriculum_id = b.curriculum_id
       WHERE bs.student_id = $1 AND s.id = $2`,
      [req.user.id, req.params.subjectId]
    );
    if (!access.length)
      return res.status(403).json({ success: false, message: 'Access denied to this subject' });

    const { rows } = await db.query(
      `SELECT
         c.id,
         c.title,
         c.content_type,
         c.order_index,
         c.is_premium,
         CASE WHEN c.is_premium AND $2 = false THEN NULL ELSE c.file_url          END AS file_url,
         CASE WHEN c.is_premium AND $2 = false THEN NULL ELSE c.mux_playback_id   END AS mux_playback_id,
         CASE WHEN c.is_premium AND $2 = false THEN NULL ELSE c.animation_id      END AS animation_id
       FROM content c
       WHERE c.subject_id = $1
       ORDER BY c.order_index`,
      [req.params.subjectId, isPremium]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── INDIVIDUAL CONTENT ───────────────────────────────────────────────────────

exports.getNoteUrl = async (req, res) => {
  // PDFs are stored on Cloudinary — return the public URL directly
  try {
    const { rows } = await db.query(
      `SELECT c.file_url, c.is_premium FROM content c
       WHERE c.id = $1 AND c.content_type = 'note'`,
      [req.params.contentId]
    );
    if (!rows[0])
      return res.status(404).json({ success: false, message: 'Note not found' });
    if (rows[0].is_premium && !req.user.is_premium)
      return res.status(403).json({ success: false, message: 'Premium access required' });

    res.json({ success: true, url: rows[0].file_url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAnimation = async (req, res) => {
  // Animations are stored as html_content text in the DB — no file fetch needed
  try {
    const { rows } = await db.query(
      `SELECT id, title, description, html_content, is_premium FROM animations
       WHERE id = $1`,
      [req.params.animationId]
    );
    if (!rows[0])
      return res.status(404).json({ success: false, message: 'Animation not found' });
    if (rows[0].is_premium && !req.user.is_premium)
      return res.status(403).json({ success: false, message: 'Premium access required' });

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getVideoToken = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT mux_playback_id, is_premium FROM content
       WHERE id = $1 AND content_type = 'video'`,
      [req.params.contentId]
    );
    if (!rows[0])
      return res.status(404).json({ success: false, message: 'Video not found' });
    if (rows[0].is_premium && !req.user.is_premium)
      return res.status(403).json({ success: false, message: 'Premium access required' });

    res.json({ success: true, playback_id: rows[0].mux_playback_id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── STUDENT QUESTIONS ────────────────────────────────────────────────────────

exports.getMyQuestions = async (req, res) => {
  try {
    const studentId = req.user.id;
    const isPremium = req.user.is_premium;
    const { subject_id, search } = req.query;

    const extraParams = [];
    const conditions  = [];

    if (subject_id) {
      extraParams.push(subject_id);
      conditions.push(`s.id = $${2 + extraParams.length}`);
    }
    if (search) {
      extraParams.push(`%${search.toLowerCase()}%`);
      conditions.push(`LOWER(q.question_text) LIKE $${2 + extraParams.length}`);
    }

    const where = conditions.length ? 'AND ' + conditions.join(' AND ') : '';

    const { rows } = await db.query(
      `SELECT
         q.id,
         q.question_type,
         q.is_premium,
         CASE WHEN q.is_premium AND NOT $2::boolean THEN '[PREMIUM]' ELSE q.question_text  END AS question_text,
         CASE WHEN q.is_premium AND NOT $2::boolean THEN NULL        ELSE q.options        END AS options,
         CASE WHEN q.is_premium AND NOT $2::boolean THEN NULL        ELSE q.correct_answer END AS correct_answer,
         CASE WHEN q.is_premium AND NOT $2::boolean THEN NULL        ELSE q.image_url      END AS image_url,
         s.id          AS subject_id,
         s.name        AS subject_name,
         s.order_index AS subject_order,
         c.id          AS curriculum_id,
         c.name        AS curriculum_name
       FROM batch_students bs
       JOIN batches     b  ON b.id            = bs.batch_id
       JOIN curriculums c  ON c.id            = b.curriculum_id
       JOIN subjects    s  ON s.curriculum_id = c.id
       JOIN questions   q  ON q.subject_id    = s.id
       WHERE bs.student_id = $1
         AND c.is_active = true
         ${where}
       ORDER BY s.order_index, q.is_premium ASC, q.created_at DESC`,
      [studentId, isPremium, ...extraParams]
    );

    const grouped     = [];
    const seenSubject = new Map();

    for (const row of rows) {
      if (!seenSubject.has(row.subject_id)) {
        const group = {
          subject_id:      row.subject_id,
          subject_name:    row.subject_name,
          curriculum_name: row.curriculum_name,
          questions:       [],
        };
        seenSubject.set(row.subject_id, group);
        grouped.push(group);
      }
      seenSubject.get(row.subject_id).questions.push({
        id:             row.id,
        question_text:  row.question_text,
        question_type:  row.question_type,
        options:        row.options,
        correct_answer: row.correct_answer,
        image_url:      row.image_url,
        is_premium:     row.is_premium,
      });
    }

    res.json({ success: true, data: grouped });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};