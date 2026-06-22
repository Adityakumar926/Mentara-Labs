const db = require('../../config/db');

// ─── BATCH CRUD ───────────────────────────────────────────────────────────────

exports.getAll = async (req, res) => {
  try {
    const { curriculum_id } = req.query;
    const conditions = [];
    const params = [];

    if (curriculum_id) {
      params.push(curriculum_id);
      conditions.push(`b.curriculum_id = $${params.length}`);
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const { rows } = await db.query(
      `SELECT
         b.*,
         c.name AS curriculum_name,
         COUNT(bs.student_id) AS student_count
       FROM batches b
       LEFT JOIN curriculums c    ON c.id = b.curriculum_id
       LEFT JOIN batch_students bs ON bs.batch_id = b.id
       ${where}
       GROUP BY b.id, c.name
       ORDER BY b.created_at DESC`,
      params
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const [batchRes, studentsRes] = await Promise.all([
      db.query(
        `SELECT b.*, c.name AS curriculum_name
         FROM batches b
         LEFT JOIN curriculums c ON c.id = b.curriculum_id
         WHERE b.id = $1`,
        [req.params.id]
      ),
      db.query(
        `SELECT u.id, u.full_name, u.email, u.is_premium, u.avatar_url, bs.joined_at
         FROM batch_students bs
         JOIN users u ON u.id = bs.student_id
         WHERE bs.batch_id = $1
         ORDER BY bs.joined_at DESC`,
        [req.params.id]
      )
    ]);

    if (!batchRes.rows[0])
      return res.status(404).json({ success: false, message: 'Batch not found' });

    res.json({
      success: true,
      data: { ...batchRes.rows[0], students: studentsRes.rows }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, curriculum_id, start_date, end_date } = req.body;
    if (!name || !curriculum_id)
      return res.status(400).json({ success: false, message: 'name and curriculum_id are required' });

    const { rows } = await db.query(
      `INSERT INTO batches (name, curriculum_id, start_date, end_date)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, curriculum_id, start_date, end_date]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, start_date, end_date } = req.body;
    const { rows } = await db.query(
      `UPDATE batches
       SET name       = COALESCE($1, name),
           start_date = COALESCE($2, start_date),
           end_date   = COALESCE($3, end_date)
       WHERE id = $4 RETURNING *`,
      [name, start_date, end_date, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Batch not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { rowCount } = await db.query(
      'DELETE FROM batches WHERE id = $1', [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ success: false, message: 'Batch not found' });
    res.json({ success: true, message: 'Batch deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── STUDENT MANAGEMENT ───────────────────────────────────────────────────────

exports.addStudents = async (req, res) => {
  // Body: { student_ids: [uuid, ...] }
  const client = await db.pool.connect();
  try {
    const { student_ids } = req.body;
    if (!student_ids?.length)
      return res.status(400).json({ success: false, message: 'student_ids array is required' });

    await client.query('BEGIN');
    let added = 0;
    for (const sid of student_ids) {
      const result = await client.query(
        `INSERT INTO batch_students (batch_id, student_id)
         VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [req.params.id, sid]
      );
      added += result.rowCount;
    }
    await client.query('COMMIT');
    res.json({ success: true, message: `${added} student(s) added to batch` });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
};

exports.removeStudent = async (req, res) => {
  try {
    const { rowCount } = await db.query(
      `DELETE FROM batch_students
       WHERE batch_id = $1 AND student_id = $2`,
      [req.params.id, req.params.studentId]
    );
    if (!rowCount)
      return res.status(404).json({ success: false, message: 'Student not in batch' });
    res.json({ success: true, message: 'Student removed from batch' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAvailableStudents = async (req, res) => {
  // Students not yet in this batch
  try {
    const { search } = req.query;
    const params = [req.params.id];
    let searchClause = '';
    if (search) {
      params.push(`%${search}%`);
      searchClause = `AND (u.full_name ILIKE $${params.length} OR u.email ILIKE $${params.length})`;
    }

    const { rows } = await db.query(
      `SELECT u.id, u.full_name, u.email, u.is_premium, u.avatar_url
       FROM users u
       WHERE u.role = 'student'
         AND u.id NOT IN (
           SELECT student_id FROM batch_students WHERE batch_id = $1
         )
         ${searchClause}
       ORDER BY u.full_name
       LIMIT 50`,
      params
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── BATCH ANALYTICS ─────────────────────────────────────────────────────────

exports.getBatchAnalytics = async (req, res) => {
  try {
    const batchId = req.params.id;

    const [examStats, topStudents, activityTrend] = await Promise.all([
      // Per-exam performance in this batch
      db.query(
        `SELECT
           e.title,
           e.status,
           COUNT(es.id)                AS submissions,
           ROUND(AVG(es.percentage), 2) AS avg_score,
           MAX(es.score)               AS highest,
           MIN(es.score)               AS lowest
         FROM exams e
         LEFT JOIN exam_submissions es ON es.exam_id = e.id
         WHERE e.batch_id = $1
         GROUP BY e.id
         ORDER BY e.scheduled_at DESC`,
        [batchId]
      ),
      // Top 5 students by avg score
      db.query(
        `SELECT
           u.full_name,
           u.email,
           ROUND(AVG(es.percentage), 2) AS avg_score,
           COUNT(es.id)                 AS exams_taken
         FROM batch_students bs
         JOIN users u ON u.id = bs.student_id
         LEFT JOIN exam_submissions es ON es.student_id = u.id
         WHERE bs.batch_id = $1
         GROUP BY u.id
         ORDER BY avg_score DESC NULLS LAST
         LIMIT 5`,
        [batchId]
      ),
      // Daily activity last 30 days
      db.query(
        `SELECT
           al.activity_date,
           COUNT(DISTINCT al.student_id) AS active_students
         FROM activity_logs al
         JOIN batch_students bs ON bs.student_id = al.student_id
         WHERE bs.batch_id = $1
           AND al.activity_date >= NOW() - INTERVAL '30 days'
         GROUP BY al.activity_date
         ORDER BY al.activity_date`,
        [batchId]
      )
    ]);

    res.json({
      success: true,
      data: {
        examStats: examStats.rows,
        topStudents: topStudents.rows,
        activityTrend: activityTrend.rows
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};