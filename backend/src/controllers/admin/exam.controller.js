const db = require('../../config/db');
const Notification = require('../../models/Notification');
const { emitToStudents } = require('../../sockets');

// ─── EXAM CRUD ───────────────────────────────────────────────────────────────

exports.getAll = async (req, res) => {
  try {
    const { status, subject_id, batch_id, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (status)     { params.push(status);     conditions.push(`e.status = $${params.length}`); }
    if (subject_id) { params.push(subject_id); conditions.push(`e.subject_id = $${params.length}`); }
    if (batch_id)   { params.push(batch_id);   conditions.push(`e.batch_id = $${params.length}`); }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    params.push(limit, offset);

    const { rows } = await db.query(
      `SELECT
         e.*,
         s.name  AS subject_name,
         b.name  AS batch_name,
         COUNT(DISTINCT eq.question_id) AS question_count,
         COUNT(DISTINCT es.id)          AS submission_count,
         ROUND(AVG(es.percentage), 2)   AS avg_score
       FROM exams e
       LEFT JOIN subjects s          ON s.id = e.subject_id
       LEFT JOIN batches  b          ON b.id = e.batch_id
       LEFT JOIN exam_questions eq   ON eq.exam_id = e.id
       LEFT JOIN exam_submissions es ON es.exam_id = e.id
       ${where}
       GROUP BY e.id, s.name, b.name
       ORDER BY e.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT
         e.*,
         s.name AS subject_name,
         b.name AS batch_name,
         COALESCE(
           json_agg(
             json_build_object(
               'id', q.id,
               'question_text', q.question_text,
               'question_type', q.question_type,
               'options', q.options,
               'correct_answer', q.correct_answer,
               'marks', eq.marks,
               'order_index', eq.order_index
             ) ORDER BY eq.order_index
           ) FILTER (WHERE q.id IS NOT NULL),
           '[]'
         ) AS questions
       FROM exams e
       LEFT JOIN subjects s        ON s.id = e.subject_id
       LEFT JOIN batches  b        ON b.id = e.batch_id
       LEFT JOIN exam_questions eq ON eq.exam_id = e.id
       LEFT JOIN questions q       ON q.id = eq.question_id
       WHERE e.id = $1
       GROUP BY e.id, s.name, b.name`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Exam not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const {
      title, description, subject_id, batch_id,
      duration_minutes, total_marks, passing_marks, is_premium
    } = req.body;

    if (!title || !duration_minutes || !total_marks)
      return res.status(400).json({ success: false, message: 'title, duration_minutes and total_marks are required' });

    const { rows } = await db.query(
      `INSERT INTO exams
       (title, description, subject_id, batch_id,
        duration_minutes, total_marks, passing_marks, is_premium, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [
        title,
        description        || null,
        subject_id         || null,
        batch_id           || null,
        duration_minutes,
        total_marks,
        passing_marks      || null,
        is_premium ?? false,
        req.user.id
      ]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const {
      title, description, subject_id, batch_id,
      duration_minutes, total_marks, passing_marks, is_premium
    } = req.body;

    const { rows } = await db.query(
      `UPDATE exams SET
         title            = COALESCE($1,  title),
         description      = COALESCE($2,  description),
         subject_id       = COALESCE($3,  subject_id),
         batch_id         = COALESCE($4,  batch_id),
         duration_minutes = COALESCE($5,  duration_minutes),
         total_marks      = COALESCE($6,  total_marks),
         passing_marks    = COALESCE($7,  passing_marks),
         is_premium       = COALESCE($8,  is_premium)
       WHERE id = $9 AND status = 'draft'
       RETURNING *`,
      [
        title        || null,
        description  || null,
        subject_id   || null,
        batch_id     || null,
        duration_minutes || null,
        total_marks  || null,
        passing_marks || null,
        is_premium ?? null,
        req.params.id
      ]
    );
    if (!rows[0])
      return res.status(404).json({ success: false, message: 'Exam not found or already published' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { rowCount } = await db.query(
      `DELETE FROM exams WHERE id = $1 AND status = 'draft'`,
      [req.params.id]
    );
    if (!rowCount)
      return res.status(400).json({ success: false, message: 'Only draft exams can be deleted' });
    res.json({ success: true, message: 'Exam deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── QUESTIONS ───────────────────────────────────────────────────────────────

exports.addQuestions = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { questions } = req.body;
    if (!questions?.length)
      return res.status(400).json({ success: false, message: 'questions array is required' });

    await client.query('BEGIN');
    for (const q of questions) {
      await client.query(
        `INSERT INTO exam_questions (exam_id, question_id, marks, order_index)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (exam_id, question_id)
         DO UPDATE SET marks = EXCLUDED.marks, order_index = EXCLUDED.order_index`,
        [req.params.id, q.question_id, q.marks ?? 1, q.order_index ?? 0]
      );
    }
    await client.query(
      `UPDATE exams SET total_marks = (
         SELECT COALESCE(SUM(marks), 0) FROM exam_questions WHERE exam_id = $1
       ) WHERE id = $1`,
      [req.params.id]
    );
    await client.query('COMMIT');
    res.json({ success: true, message: `${questions.length} question(s) added to exam` });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
};

exports.removeQuestion = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { questionId } = req.params;
    await client.query('BEGIN');
    await client.query(
      `DELETE FROM exam_questions WHERE exam_id = $1 AND question_id = $2`,
      [req.params.id, questionId]
    );
    await client.query(
      `UPDATE exams SET total_marks = (
         SELECT COALESCE(SUM(marks), 0) FROM exam_questions WHERE exam_id = $1
       ) WHERE id = $1`,
      [req.params.id]
    );
    await client.query('COMMIT');
    res.json({ success: true, message: 'Question removed' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
};

// ─── SCHEDULING ──────────────────────────────────────────────────────────────

exports.schedule = async (req, res) => {
  try {
    const { scheduled_at } = req.body;

    if (!scheduled_at)
      return res.status(400).json({ success: false, message: 'scheduled_at is required' });

    const { rows: qCount } = await db.query(
      `SELECT COUNT(*), e.duration_minutes
       FROM exam_questions eq
       JOIN exams e ON e.id = eq.exam_id
       WHERE eq.exam_id = $1
       GROUP BY e.duration_minutes`,
      [req.params.id]
    );
    if (!qCount[0] || parseInt(qCount[0].count) === 0)
      return res.status(400).json({ success: false, message: 'Add at least one question before scheduling' });

    // Auto-calculate ends_at from scheduled_at + duration_minutes
    const duration = parseInt(qCount[0].duration_minutes);
    const ends_at  = new Date(new Date(scheduled_at).getTime() + duration * 60 * 1000).toISOString();

    const { rows } = await db.query(
      `UPDATE exams
       SET status = 'scheduled', scheduled_at = $1, ends_at = $2
       WHERE id = $3 AND status = 'draft'
       RETURNING *`,
      [scheduled_at, ends_at, req.params.id]
    );
    if (!rows[0])
      return res.status(400).json({ success: false, message: 'Exam not found or already scheduled' });

    const exam = rows[0];
    try {
      const studentIds = await Notification.getTargetStudentIds(exam.id);
      const title = 'New exam scheduled';
      const message = `${exam.title} is scheduled for ${new Date(exam.scheduled_at).toLocaleString()}.`;
      await Notification.createForStudents({ studentIds, examId: exam.id, type: 'exam_scheduled', title, message });
      emitToStudents(studentIds, 'notification:new', { type: 'exam_scheduled', examId: exam.id, title, message });
    } catch (notifyErr) {
      console.error(`[Notify] Failed to notify for exam ${exam.id}:`, notifyErr.message);
    }

    res.json({ success: true, data: exam });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.goLive = async (req, res) => {
  try {
    const { rows } = await db.query(
      `UPDATE exams SET status = 'live'
       WHERE id = $1 AND status = 'scheduled'
       RETURNING *`,
      [req.params.id]
    );
    if (!rows[0])
      return res.status(400).json({ success: false, message: 'Exam must be scheduled before going live' });

    const exam = rows[0];
    try {
      const studentIds = await Notification.getTargetStudentIds(exam.id);
      const title = 'Exam is live';
      const message = `${exam.title} has started — jump in now.`;
      await Notification.createForStudents({ studentIds, examId: exam.id, type: 'exam_live', title, message });
      emitToStudents(studentIds, 'notification:new', { type: 'exam_live', examId: exam.id, title, message });
    } catch (notifyErr) {
      console.error(`[Notify] Failed to notify for exam ${exam.id}:`, notifyErr.message);
    }

    res.json({ success: true, data: exam });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.endExam = async (req, res) => {
  try {
    const { rows } = await db.query(
      `UPDATE exams SET status = 'ended'
       WHERE id = $1 AND status = 'live'
       RETURNING *`,
      [req.params.id]
    );
    if (!rows[0])
      return res.status(400).json({ success: false, message: 'Exam must be live to end it' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── RESULTS ─────────────────────────────────────────────────────────────────

exports.getResults = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT
         es.*,
         u.full_name,
         u.email,
         u.is_premium,
         RANK() OVER (ORDER BY es.score DESC) AS rank
       FROM exam_submissions es
       JOIN users u ON u.id = es.student_id
       WHERE es.exam_id = $1
       ORDER BY es.score DESC`,
      [req.params.id]
    );

    const { rows: stats } = await db.query(
      `SELECT
         COUNT(*)                       AS total_submissions,
         ROUND(AVG(percentage), 2)      AS avg_score,
         MAX(score)                     AS highest_score,
         MIN(score)                     AS lowest_score,
         COUNT(*) FILTER (WHERE score >= (
           SELECT passing_marks FROM exams WHERE id = $1
         )) AS passed_count
       FROM exam_submissions
       WHERE exam_id = $1`,
      [req.params.id]
    );

    res.json({ success: true, data: { results: rows, stats: stats[0] } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStudentResult = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { rows } = await db.query(
      `SELECT
         es.*,
         u.full_name,
         e.title        AS exam_title,
         e.total_marks  AS exam_total_marks,
         e.passing_marks
       FROM exam_submissions es
       JOIN users u ON u.id = es.student_id
       JOIN exams e ON e.id = es.exam_id
       WHERE es.exam_id = $1 AND es.student_id = $2`,
      [req.params.id, studentId]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Submission not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};