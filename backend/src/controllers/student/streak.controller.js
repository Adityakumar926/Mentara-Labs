const db = require('../../config/db');

// ─── ACTIVITY LOGGING ─────────────────────────────────────────────────────────

exports.logActivity = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { activity_type, content_id } = req.body;
    const studentId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const validTypes = ['study', 'exam', 'animation', 'video'];
    if (!validTypes.includes(activity_type))
      return res.status(400).json({ success: false, message: `activity_type must be one of: ${validTypes.join(', ')}` });

    await client.query('BEGIN');

    // Insert activity (ignore duplicate for same type + content on same day)
    await client.query(
      `INSERT INTO activity_logs (student_id, activity_date, activity_type, content_id)
       VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
      [studentId, today, activity_type, content_id]
    );

    // Compute new streak
    const { rows: streakRows } = await client.query(
      `SELECT current_streak, longest_streak, last_activity_date
       FROM streaks WHERE student_id = $1`,
      [studentId]
    );

    const streak = streakRows[0];
    const lastDate = streak?.last_activity_date
      ? streak.last_activity_date.toISOString().split('T')[0]
      : null;

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let newStreak;
    if (!streak || !lastDate)              newStreak = 1;
    else if (lastDate === today)           newStreak = streak.current_streak;     // Already counted today
    else if (lastDate === yesterday)       newStreak = streak.current_streak + 1; // Consecutive day
    else                                   newStreak = 1;                          // Streak broken

    const newLongest = Math.max(newStreak, streak?.longest_streak ?? 0);

    await client.query(
      `INSERT INTO streaks (student_id, current_streak, longest_streak, last_activity_date, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (student_id) DO UPDATE SET
         current_streak      = EXCLUDED.current_streak,
         longest_streak      = EXCLUDED.longest_streak,
         last_activity_date  = EXCLUDED.last_activity_date,
         updated_at          = NOW()`,
      [studentId, newStreak, newLongest, today]
    );

    await client.query('COMMIT');
    res.json({
      success: true,
      data: {
        current_streak: newStreak,
        longest_streak: newLongest,
        activity_date: today
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
};

// ─── CALENDAR VIEW (LeetCode-style) ──────────────────────────────────────────

exports.getCalendar = async (req, res) => {
  try {
    const { year, month } = req.query;
    const currentYear  = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const y = parseInt(year  ?? currentYear);
    const m = parseInt(month ?? currentMonth);

    if (isNaN(y) || isNaN(m) || m < 1 || m > 12)
      return res.status(400).json({ success: false, message: 'Invalid year or month' });

    // Daily activity for the requested month
    const { rows: activity } = await db.query(
      `SELECT
         activity_date::text AS date,
         array_agg(DISTINCT activity_type) AS types,
         COUNT(*) AS event_count
       FROM activity_logs
       WHERE student_id = $1
         AND EXTRACT(YEAR  FROM activity_date) = $2
         AND EXTRACT(MONTH FROM activity_date) = $3
       GROUP BY activity_date
       ORDER BY activity_date`,
      [req.user.id, y, m]
    );

    // Streak info
    const { rows: streakRows } = await db.query(
      `SELECT current_streak, longest_streak, last_activity_date
       FROM streaks WHERE student_id = $1`,
      [req.user.id]
    );

    // Total activity days all-time
    const { rows: totalRows } = await db.query(
      `SELECT COUNT(DISTINCT activity_date) AS total_days
       FROM activity_logs WHERE student_id = $1`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: {
        year: y,
        month: m,
        calendar: activity,
        streak: streakRows[0] ?? { current_streak: 0, longest_streak: 0, last_activity_date: null },
        total_active_days: parseInt(totalRows[0].total_days)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── YEARLY HEATMAP ───────────────────────────────────────────────────────────

exports.getYearlyHeatmap = async (req, res) => {
  try {
    const year = parseInt(req.query.year ?? new Date().getFullYear());
    const { rows } = await db.query(
      `SELECT
         activity_date::text AS date,
         COUNT(*) AS count
       FROM activity_logs
       WHERE student_id = $1
         AND EXTRACT(YEAR FROM activity_date) = $2
       GROUP BY activity_date
       ORDER BY activity_date`,
      [req.user.id, year]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};