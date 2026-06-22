const db = require('../../config/db');

exports.getStats = async (req, res) => {
  try {
    const [students, exams, questions, premium, batches, recentExams] = await Promise.all([
      db.query("SELECT COUNT(*) FROM users WHERE role = 'student'"),
      db.query("SELECT COUNT(*), status FROM exams GROUP BY status"),
      db.query("SELECT COUNT(*), question_type FROM questions GROUP BY question_type"),
      db.query("SELECT COUNT(*) FROM users WHERE is_premium = true"),
      db.query("SELECT COUNT(*) FROM batches"),
      db.query(`
        SELECT e.title, e.status, e.scheduled_at,
               COUNT(es.id) as submission_count,
               AVG(es.percentage) as avg_score
        FROM exams e
        LEFT JOIN exam_submissions es ON e.id = es.exam_id
        GROUP BY e.id
        ORDER BY e.created_at DESC LIMIT 5
      `)
    ]);

    res.json({
      success: true,
      data: {
        totalStudents: parseInt(students.rows[0].count),
        examsByStatus: exams.rows,
        questionsByType: questions.rows,
        premiumUsers: parseInt(premium.rows[0].count),
        totalBatches: parseInt(batches.rows[0].count),
        recentExams: recentExams.rows
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};