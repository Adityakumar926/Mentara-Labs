const db = require('../../config/db');
const Notification = require('../../models/Notification');
const { emitToStudents } = require('../../sockets');

// ─── EXAM CRUD ───────────────────────────────────────────────────────────────

exports.getAll = async (req, res) => {
  try {
    const { status, subject_id, topic_id, class_id, curriculum_id, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (status)        { params.push(status);        conditions.push(`e.status = $${params.length}`); }
    if (subject_id)    { params.push(subject_id);    conditions.push(`e.subject_id = $${params.length}`); }
    if (topic_id)      { params.push(topic_id);      conditions.push(`e.topic_id = $${params.length}`); }
    if (class_id)      { params.push(class_id);      conditions.push(`s.class_id = $${params.length}`); }
    if (curriculum_id) { params.push(curriculum_id); conditions.push(`cl.curriculum_id = $${params.length}`); }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    params.push(limit, offset);

    const { rows } = await db.query(
      `SELECT
         e.*,
         s.name  AS subject_name,
         cl.name AS class_name,
         c.name  AS curriculum_name,
         t.name  AS topic_name,
         NULL    AS batch_name,
         COUNT(DISTINCT eq.question_id) AS question_count,
         COUNT(DISTINCT es.id)          AS submission_count,
         ROUND(AVG(es.percentage), 2)   AS avg_score
       FROM exams e
       LEFT JOIN subjects s          ON s.id = e.subject_id
       LEFT JOIN public.classes cl   ON cl.id = s.class_id
       LEFT JOIN public.curriculums c ON c.id = cl.curriculum_id
       LEFT JOIN public.topics t     ON t.id = e.topic_id
       LEFT JOIN exam_questions eq   ON eq.exam_id = e.id
       LEFT JOIN exam_submissions es ON es.exam_id = e.id
       ${where}
       GROUP BY e.id, s.name, cl.name, c.name, t.name
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
         cl.name AS class_name,
         cl.id AS class_id,
         c.name AS curriculum_name,
         c.id AS curriculum_id,
         t.name AS topic_name,
         NULL AS batch_name,
         COALESCE(
           json_agg(
             json_build_object(
               'id', q.id,
               'question_text', q.question_text,
               'question_type', q.question_type,
               'options', q.options,
               'correct_answer', q.correct_answer,
               'image_url', q.image_url,
               'explanation', q.explanation,
               'difficulty', q.difficulty,
               'marks', eq.marks,
               'order_index', eq.order_index
             ) ORDER BY eq.order_index ASC, q.created_at ASC
           ) FILTER (WHERE q.id IS NOT NULL),
           '[]'
         ) AS questions
       FROM exams e
       LEFT JOIN subjects s        ON s.id = e.subject_id
       LEFT JOIN public.classes cl ON cl.id = s.class_id
       LEFT JOIN public.curriculums c ON c.id = cl.curriculum_id
       LEFT JOIN public.topics t   ON t.id = e.topic_id
       LEFT JOIN exam_questions eq ON eq.exam_id = e.id
       LEFT JOIN questions q       ON q.id = eq.question_id
       WHERE e.id = $1
       GROUP BY e.id, s.name, cl.name, cl.id, c.name, c.id, t.name`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Exam not found' });

    let parsedQuestions = rows[0].questions;
    if (typeof parsedQuestions === 'string') {
      try {
        parsedQuestions = JSON.parse(parsedQuestions);
      } catch (e) {
        parsedQuestions = [];
      }
    }
    if (!Array.isArray(parsedQuestions)) {
      parsedQuestions = [];
    }

    rows[0].questions = parsedQuestions.map((q) => ({
      ...q,
      options: typeof q?.options === 'string' ? (() => { try { return JSON.parse(q.options); } catch { return []; } })() : (q?.options ?? [])
    }));

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const {
      title, description, subject_id, topic_id,
      duration_minutes, total_marks, passing_marks, is_premium, certificate_enabled
    } = req.body;

    const sanitizeNum = (val) => (val === '' || val === undefined || val === null) ? null : Number(val);
    const finalDuration = sanitizeNum(duration_minutes);
    const finalTotal = sanitizeNum(total_marks);
    const finalPassing = sanitizeNum(passing_marks);

    if (!title)
      return res.status(400).json({ success: false, message: 'title is required' });

    const { rows } = await db.query(
      `INSERT INTO exams
       (title, description, subject_id, topic_id, batch_id,
        duration_minutes, total_marks, passing_marks, is_premium, certificate_enabled, created_by)
       VALUES ($1,$2,$3,$4,NULL,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        title,
        description        || null,
        subject_id         || null,
        topic_id           || null,
        finalDuration,
        finalTotal,
        finalPassing,
        is_premium ?? false,
        certificate_enabled ?? false,
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
      title, description, subject_id, topic_id,
      duration_minutes, total_marks, passing_marks, is_premium, certificate_enabled
    } = req.body;

    const sanitizeNum = (val) => (val === '' || val === undefined || val === null) ? null : Number(val);
    const finalDuration = sanitizeNum(duration_minutes);
    const finalTotal = sanitizeNum(total_marks);
    let finalPassing = sanitizeNum(passing_marks);

    // Check if the exam has only structure questions
    const { rows: structCheck } = await db.query(
      `SELECT COUNT(*) AS total_qs,
              COUNT(*) FILTER (WHERE q.question_type = 'photo') AS struct_qs
       FROM exam_questions eq
       JOIN questions q ON q.id = eq.question_id
       WHERE eq.exam_id = $1`,
      [req.params.id]
    );
    const totalQs = parseInt(structCheck[0]?.total_qs || 0);
    const structQs = parseInt(structCheck[0]?.struct_qs || 0);

    if (totalQs > 0 && totalQs === structQs) {
      finalPassing = null;
    }

    const { rows } = await db.query(
      `UPDATE exams SET
         title            = COALESCE($1,  title),
         description      = $2,
         subject_id       = COALESCE($3,  subject_id),
         topic_id         = $4,
         duration_minutes = $5,
         total_marks      = $6,
         passing_marks    = $7,
         is_premium       = COALESCE($8,  is_premium),
         certificate_enabled = COALESCE($9,  certificate_enabled)
       WHERE id = $10 AND status != 'live'
       RETURNING *`,
      [
        title        || null,
        description  || null,
        subject_id   || null,
        topic_id     || null,
        finalDuration,
        finalTotal,
        finalPassing,
        is_premium ?? null,
        certificate_enabled ?? null,
        req.params.id
      ]
    );
    if (!rows[0])
      return res.status(404).json({ success: false, message: 'Exam not found or cannot be edited (live status)' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { rowCount } = await db.query(
      `DELETE FROM exams WHERE id = $1 AND status != 'live'`,
      [req.params.id]
    );
    if (!rowCount)
      return res.status(400).json({ success: false, message: 'Live exams cannot be deleted' });
    res.json({ success: true, message: 'Exam deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.duplicate = async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Get the exam to copy
    const { rows: examRows } = await client.query(
      `SELECT * FROM exams WHERE id = $1`,
      [req.params.id]
    );
    if (!examRows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    const orig = examRows[0];

    // Insert new exam with "Copy of ..." title in draft status
    const { rows: newExamRows } = await client.query(
      `INSERT INTO exams
       (title, description, subject_id, topic_id, batch_id,
        duration_minutes, total_marks, passing_marks, is_premium, status, created_by)
       VALUES ($1, $2, $3, $4, NULL, $5, $6, $7, $8, 'draft', $9)
       RETURNING *`,
      [
        `Copy of ${orig.title}`,
        orig.description,
        orig.subject_id,
        orig.topic_id,
        orig.duration_minutes,
        orig.total_marks,
        orig.passing_marks,
        orig.is_premium,
        req.user.id
      ]
    );

    const newExam = newExamRows[0];

    // Duplicate exam questions
    const { rows: questionRows } = await client.query(
      `SELECT question_id, marks, order_index FROM exam_questions WHERE exam_id = $1`,
      [req.params.id]
    );

    for (const q of questionRows) {
      await client.query(
        `INSERT INTO exam_questions (exam_id, question_id, marks, order_index)
         VALUES ($1, $2, $3, $4)`,
        [newExam.id, q.question_id, q.marks, q.order_index]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ success: true, data: newExam });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
};

// ─── QUESTIONS ───────────────────────────────────────────────────────────────

exports.addQuestions = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { questions } = req.body;
    if (!questions?.length)
      return res.status(400).json({ success: false, message: 'questions array is required' });

    // Check if exam is live
    const { rows: examCheck } = await client.query('SELECT status FROM exams WHERE id = $1', [req.params.id]);
    if (examCheck[0]?.status === 'live') {
      client.release();
      return res.status(400).json({ success: false, message: 'Cannot modify questions of a live exam' });
    }

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

    // Auto-null passing_marks if all questions are of type 'structure'
    const { rows: structCheck } = await client.query(
      `SELECT COUNT(*) AS total_qs,
              COUNT(*) FILTER (WHERE q.question_type = 'photo') AS struct_qs
       FROM exam_questions eq
       JOIN questions q ON q.id = eq.question_id
       WHERE eq.exam_id = $1`,
      [req.params.id]
    );
    const totalQs = parseInt(structCheck[0]?.total_qs || 0);
    const structQs = parseInt(structCheck[0]?.struct_qs || 0);
    if (totalQs > 0 && totalQs === structQs) {
      await client.query(
        `UPDATE exams SET passing_marks = NULL, total_marks = NULL WHERE id = $1`,
        [req.params.id]
      );
    }

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

    // Check if exam is live
    const { rows: examCheck } = await client.query('SELECT status FROM exams WHERE id = $1', [req.params.id]);
    if (examCheck[0]?.status === 'live') {
      client.release();
      return res.status(400).json({ success: false, message: 'Cannot modify questions of a live exam' });
    }

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

    // Auto-null passing_marks if all questions are of type 'structure'
    const { rows: structCheck } = await client.query(
      `SELECT COUNT(*) AS total_qs,
              COUNT(*) FILTER (WHERE q.question_type = 'photo') AS struct_qs
       FROM exam_questions eq
       JOIN questions q ON q.id = eq.question_id
       WHERE eq.exam_id = $1`,
      [req.params.id]
    );
    const totalQs = parseInt(structCheck[0]?.total_qs || 0);
    const structQs = parseInt(structCheck[0]?.struct_qs || 0);
    if (totalQs > 0 && totalQs === structQs) {
      await client.query(
        `UPDATE exams SET passing_marks = NULL, total_marks = NULL WHERE id = $1`,
        [req.params.id]
      );
    }

    await client.query('COMMIT');
    res.json({ success: true, message: 'Question removed' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
};

exports.reorderQuestions = async (req, res) => {
  try {
    const { id: examId } = req.params;
    const { order } = req.body; // array of { question_id, order_index }

    if (!Array.isArray(order) || order.length === 0) {
      return res.status(400).json({ success: false, message: 'order array is required' });
    }

    // Check exam is not live
    const { rows: examCheck } = await db.query('SELECT status FROM exams WHERE id = $1', [examId]);
    if (!examCheck[0]) return res.status(404).json({ success: false, message: 'Exam not found' });
    if (examCheck[0].status === 'live') {
      return res.status(400).json({ success: false, message: 'Cannot reorder questions of a live exam' });
    }

    // Batch update order_index for each question
    for (const item of order) {
      await db.query(
        `UPDATE exam_questions SET order_index = $1 WHERE exam_id = $2 AND question_id = $3`,
        [item.order_index, examId, item.question_id]
      );
    }

    res.json({ success: true, message: 'Questions reordered' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── SCHEDULING ──────────────────────────────────────────────────────────────

exports.schedule = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { scheduled_at } = req.body;

    if (!scheduled_at)
      return res.status(400).json({ success: false, message: 'scheduled_at is required' });

    await client.query('BEGIN');

    // Get question count, duration, and status
    const { rows: qCount } = await client.query(
      `SELECT COUNT(eq.question_id) AS q_count, e.duration_minutes, e.status
       FROM exams e
       LEFT JOIN exam_questions eq ON e.id = eq.exam_id
       WHERE e.id = $1
       GROUP BY e.id, e.duration_minutes, e.status`,
      [req.params.id]
    );

    if (!qCount[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    if (parseInt(qCount[0].q_count) === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Add at least one question before scheduling' });
    }

    const currentStatus = qCount[0].status;
    if (currentStatus !== 'draft' && currentStatus !== 'ended') {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Only draft or ended exams can be scheduled' });
    }

    // Global ends_at is null (remains live until manually ended by admin)
    const ends_at  = null;

    // Delete any old submissions to ensure fresh start
    await client.query(`DELETE FROM exam_submissions WHERE exam_id = $1`, [req.params.id]);

    const { rows } = await client.query(
      `UPDATE exams
       SET status = 'scheduled', scheduled_at = $1, ends_at = $2
       WHERE id = $3
       RETURNING *`,
      [scheduled_at, ends_at, req.params.id]
    );
    const exam = rows[0];

    await client.query('COMMIT');

    // Send notifications outside transaction
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
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
};

exports.goLive = async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Get question count, duration, and status
    const { rows: qCount } = await client.query(
      `SELECT COUNT(eq.question_id) AS q_count, e.duration_minutes, e.status
       FROM exams e
       LEFT JOIN exam_questions eq ON e.id = eq.exam_id
       WHERE e.id = $1
       GROUP BY e.id, e.duration_minutes, e.status`,
      [req.params.id]
    );

    if (!qCount[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    if (parseInt(qCount[0].q_count) === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Add at least one question before making live' });
    }

    const currentStatus = qCount[0].status;
    if (currentStatus !== 'draft' && currentStatus !== 'scheduled' && currentStatus !== 'ended') {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Exam must be draft, scheduled, or ended to go live' });
    }

    const scheduled_at = new Date().toISOString();
    // Global ends_at is null (remains live until manually ended by admin)
    const ends_at  = null;

    // Delete any old submissions to ensure fresh start
    await client.query(`DELETE FROM exam_submissions WHERE exam_id = $1`, [req.params.id]);

    const { rows } = await client.query(
      `UPDATE exams SET status = 'live', scheduled_at = $1, ends_at = $2
       WHERE id = $3
       RETURNING *`,
      [scheduled_at, ends_at, req.params.id]
    );
    const exam = rows[0];

    await client.query('COMMIT');

    // Send notifications outside transaction
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
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
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