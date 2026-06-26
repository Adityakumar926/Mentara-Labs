const db = require('../../config/db');

// GET /student/batches — list all active batches with enrollment status
exports.getAllBatches = async (req, res) => {
  try {
    const studentId = req.user.id;

    const { rows } = await db.query(
      `SELECT
         b.id,
         b.name,
         b.start_date,
         b.end_date,
         b.price,
         b.is_free,
         c.id            AS curriculum_id,
         c.name          AS curriculum_name,
         c.description   AS curriculum_description,
         c.thumbnail_url,
         COUNT(DISTINCT bs2.student_id) AS student_count,
         COUNT(DISTINCT s.id)           AS subject_count,
         CASE WHEN bs.student_id IS NOT NULL THEN true ELSE false END AS is_enrolled
       FROM batches b
       JOIN curriculums c ON c.id = b.curriculum_id
       LEFT JOIN batch_students bs  ON bs.batch_id = b.id AND bs.student_id = $1
       LEFT JOIN batch_students bs2 ON bs2.batch_id = b.id
       LEFT JOIN subjects s         ON s.curriculum_id = c.id
       WHERE c.is_active = true
       GROUP BY b.id, c.id, bs.student_id
       ORDER BY b.created_at DESC`,
      [studentId]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /student/batches/:id/join — join a free batch
exports.joinBatch = async (req, res) => {
  try {
    const studentId = req.user.id;
    const batchId   = req.params.id;

    const { rows: batchRows } = await db.query(
      `SELECT b.id, b.is_free, b.price, c.is_active
       FROM batches b
       JOIN curriculums c ON c.id = b.curriculum_id
       WHERE b.id = $1`,
      [batchId]
    );

    if (!batchRows[0])
      return res.status(404).json({ success: false, message: 'Batch not found' });

    const batch = batchRows[0];

    if (!batch.is_active)
      return res.status(400).json({ success: false, message: 'This curriculum is not active' });

    if (!batch.is_free)
      return res.status(400).json({ success: false, message: 'This batch requires payment. Payment integration coming soon.' });

    const { rows: existing } = await db.query(
      `SELECT 1 FROM batch_students WHERE batch_id = $1 AND student_id = $2`,
      [batchId, studentId]
    );

    if (existing.length)
      return res.status(409).json({ success: false, message: 'You are already enrolled in this batch' });

    await db.query(
      `INSERT INTO batch_students (batch_id, student_id) VALUES ($1, $2)`,
      [batchId, studentId]
    );

    res.status(201).json({ success: true, message: 'Successfully enrolled in batch' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /student/batches/:id/leave — leave a batch
exports.leaveBatch = async (req, res) => {
  try {
    const { rowCount } = await db.query(
      `DELETE FROM batch_students WHERE batch_id = $1 AND student_id = $2`,
      [req.params.id, req.user.id]
    );
    if (!rowCount)
      return res.status(404).json({ success: false, message: 'You are not enrolled in this batch' });

    res.json({ success: true, message: 'Left batch successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /student/exams — live exams from enrolled batches
exports.getLiveExams = async (req, res) => {
  try {
    if (!req.user.class_id) {
      return res.json({ success: true, data: [] });
    }

    const { rows } = await db.query(
      `SELECT
         e.id, e.title, e.description, e.duration_minutes,
         e.total_marks, e.passing_marks, e.is_premium,
         e.scheduled_at, e.ends_at,
         s.name AS subject_name,
         b.name AS batch_name,
         EXISTS (
           SELECT 1 FROM exam_submissions es
           WHERE es.exam_id = e.id AND es.student_id = $1
         ) AS already_attempted
       FROM exams e
       JOIN subjects s ON s.id = e.subject_id
       LEFT JOIN batches b ON b.id = e.batch_id
       WHERE s.class_id = $2
         AND e.status = 'live'
         AND (e.batch_id IS NULL OR EXISTS (
           SELECT 1 FROM batch_students bs
           WHERE bs.batch_id = e.batch_id AND bs.student_id = $1
         ))
       ORDER BY e.ends_at ASC`,
      [req.user.id, req.user.class_id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /student/exams/scheduled — upcoming exams from enrolled batches
exports.getScheduledExams = async (req, res) => {
  try {
    if (!req.user.class_id) {
      return res.json({ success: true, data: [] });
    }

    const { rows } = await db.query(
      `SELECT
         e.id, e.title, e.description, e.duration_minutes,
         e.total_marks, e.passing_marks, e.is_premium,
         e.scheduled_at, e.ends_at,
         s.name AS subject_name,
         b.name AS batch_name
       FROM exams e
       JOIN subjects s ON s.id = e.subject_id
       LEFT JOIN batches b ON b.id = e.batch_id
       WHERE s.class_id = $2
         AND e.status = 'scheduled'
         AND (e.batch_id IS NULL OR EXISTS (
           SELECT 1 FROM batch_students bs
           WHERE bs.batch_id = e.batch_id AND bs.student_id = $1
         ))
       ORDER BY e.scheduled_at ASC`,
      [req.user.id, req.user.class_id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};