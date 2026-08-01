const db = require('../../config/db');

exports.getStats = async (req, res) => {
  try {
    const [students, exams, questions, premium, recentExams, weeklyActivity, allQuestions] = await Promise.all([
      db.query("SELECT COUNT(*) FROM users WHERE role IN ('student', 'teacher')"),
      db.query("SELECT COUNT(*), status FROM exams GROUP BY status"),
      db.query("SELECT COUNT(*), question_type FROM questions GROUP BY question_type"),
      db.query("SELECT COUNT(*) FROM users WHERE is_premium = true"),
      db.query(`
        SELECT e.id, e.title, e.status, e.scheduled_at, e.created_at,
               COALESCE(COUNT(es.id), 0) as submission_count,
               COALESCE(AVG(es.percentage), 0) as avg_score
        FROM exams e
        LEFT JOIN exam_submissions es ON e.id = es.exam_id
        GROUP BY e.id
        ORDER BY e.created_at DESC LIMIT 10
      `),
      db.query(`
        SELECT 
          to_char(days.day, 'Dy') AS day,
          (COALESCE(act.cnt, 0) + COALESCE(usr.cnt, 0))::int AS students,
          COALESCE(sub.cnt, 0)::int AS exams
        FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day') AS days(day)
        LEFT JOIN (
          SELECT DATE(created_at) AS act_date, COUNT(DISTINCT student_id) AS cnt 
          FROM activity_logs 
          WHERE created_at >= CURRENT_DATE - INTERVAL '6 days'
          GROUP BY DATE(created_at)
        ) act ON act.act_date = days.day::date
        LEFT JOIN (
          SELECT DATE(created_at) AS u_date, COUNT(*) AS cnt 
          FROM users 
          WHERE created_at >= CURRENT_DATE - INTERVAL '6 days'
          GROUP BY DATE(created_at)
        ) usr ON usr.u_date = days.day::date
        LEFT JOIN (
          SELECT DATE(submitted_at) AS sub_date, COUNT(*) AS cnt 
          FROM exam_submissions 
          WHERE submitted_at >= CURRENT_DATE - INTERVAL '6 days'
          GROUP BY DATE(submitted_at)
        ) sub ON sub.sub_date = days.day::date
        ORDER BY days.day ASC
      `),
      db.query(`
        SELECT q.id, q.question_text, q.question_type, q.created_at, t.name as topic_name, s.name as subject_name
        FROM questions q
        LEFT JOIN topics t ON t.id = q.topic_id
        LEFT JOIN subjects s ON s.id = t.subject_id
        ORDER BY q.created_at DESC
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
        weeklyActivity: weeklyActivity.rows,
        allQuestions: allQuestions.rows
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};