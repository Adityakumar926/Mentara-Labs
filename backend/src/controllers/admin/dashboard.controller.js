const db = require('../../config/db');

exports.getStats = async (req, res) => {
  try {
    const [students, exams, questions, premium, recentExams, weeklyActivity] = await Promise.all([
      db.query("SELECT COUNT(*) FROM users WHERE role IN ('student', 'teacher')"),
      db.query("SELECT COUNT(*), status FROM exams GROUP BY status"),
      db.query("SELECT COUNT(*), question_type FROM questions GROUP BY question_type"),
      db.query("SELECT COUNT(*) FROM users WHERE is_premium = true"),
      db.query(`
        SELECT e.title, e.status, e.scheduled_at,
               COUNT(es.id) as submission_count,
               AVG(es.percentage) as avg_score
        FROM exams e
        LEFT JOIN exam_submissions es ON e.id = es.exam_id
        GROUP BY e.id
        ORDER BY e.created_at DESC LIMIT 5
      `),
      db.query(`
        SELECT 
          to_char(days.day, 'Dy') AS day,
          COALESCE(act.cnt, 0)::int AS students,
          COALESCE(sub.cnt, 0)::int AS exams
        FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day') AS days(day)
        LEFT JOIN (
          SELECT activity_date, COUNT(DISTINCT student_id) AS cnt 
          FROM activity_logs 
          WHERE activity_date >= CURRENT_DATE - INTERVAL '6 days'
          GROUP BY activity_date
        ) act ON act.activity_date = days.day::date
        LEFT JOIN (
          SELECT submitted_at::date AS sub_date, COUNT(*) AS cnt 
          FROM exam_submissions 
          WHERE submitted_at >= CURRENT_DATE - INTERVAL '6 days' AND status = 'submitted'
          GROUP BY submitted_at::date
        ) sub ON sub.sub_date = days.day::date
        ORDER BY days.day ASC
      `)
    ]);

    res.json({
      success: true,
      data: {
        totalStudents: parseInt(students.rows[0].count),
        examsByStatus: exams.rows,
        questionsByType: questions.rows,
        premiumUsers: parseInt(premium.rows[0].count),
        totalBatches: 0,
        recentExams: recentExams.rows,
        weeklyActivity: weeklyActivity.rows
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};