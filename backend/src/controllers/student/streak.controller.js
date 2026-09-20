const db = require('../../config/db');

// ─── HELPER: COMPUTE STREAK DYNAMICALLY FROM ACTIVITY LOGS ──────────────────

async function computeStudentStreak(studentId, runner = db) {
  const { rows } = await runner.query(
    `SELECT DISTINCT activity_date::text AS date
     FROM activity_logs
     WHERE student_id = $1
     ORDER BY date ASC`,
    [studentId]
  );

  if (!rows || rows.length === 0) {
    await runner.query(
      `INSERT INTO streaks (student_id, current_streak, longest_streak, last_activity_date, updated_at)
       VALUES ($1, 0, 0, NULL, NOW())
       ON CONFLICT (student_id) DO UPDATE SET
         current_streak = 0,
         updated_at = NOW()`,
      [studentId]
    );
    return {
      current_streak: 0,
      longest_streak: 0,
      total_active_days: 0,
      last_activity_date: null
    };
  }

  const dates = rows.map(r => r.date);
  const total_active_days = dates.length;
  const last_activity_date = dates[dates.length - 1];

  let longest_streak = 0;
  let tempStreak = 0;
  let prevTimestamp = null;

  for (const dStr of dates) {
    const ts = new Date(dStr + 'T00:00:00Z').getTime();
    if (prevTimestamp === null) {
      tempStreak = 1;
    } else {
      const diffDays = Math.round((ts - prevTimestamp) / 86400000);
      if (diffDays === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    if (tempStreak > longest_streak) {
      longest_streak = tempStreak;
    }
    prevTimestamp = ts;
  }

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const yesterdayDate = new Date(now.getTime() - 86400000);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

  let current_streak = 0;
  if (last_activity_date === todayStr || last_activity_date === yesterdayStr) {
    let curr = 1;
    let lastTs = new Date(dates[dates.length - 1] + 'T00:00:00Z').getTime();
    for (let i = dates.length - 2; i >= 0; i--) {
      const ts = new Date(dates[i] + 'T00:00:00Z').getTime();
      const diffDays = Math.round((lastTs - ts) / 86400000);
      if (diffDays === 1) {
        curr++;
        lastTs = ts;
      } else {
        break;
      }
    }
    current_streak = curr;
  } else {
    current_streak = 0;
  }

  const finalLongest = Math.max(longest_streak, current_streak);

  await runner.query(
    `INSERT INTO streaks (student_id, current_streak, longest_streak, last_activity_date, updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (student_id) DO UPDATE SET
       current_streak = EXCLUDED.current_streak,
       longest_streak = GREATEST(streaks.longest_streak, EXCLUDED.longest_streak),
       last_activity_date = EXCLUDED.last_activity_date,
       updated_at = NOW()`,
    [studentId, current_streak, finalLongest, last_activity_date]
  );

  return {
    current_streak,
    longest_streak: finalLongest,
    total_active_days,
    last_activity_date
  };
}

exports.computeStudentStreak = computeStudentStreak;

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

    const streakData = await computeStudentStreak(studentId, client);

    await client.query('COMMIT');
    res.json({
      success: true,
      data: {
        current_streak: streakData.current_streak,
        longest_streak: streakData.longest_streak,
        total_active_days: streakData.total_active_days,
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

    // Ensure up-to-date streak metrics in DB
    const streakData = await computeStudentStreak(req.user.id);

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

    res.json({
      success: true,
      data: {
        year: y,
        month: m,
        calendar: activity,
        streak: {
          current_streak: streakData.current_streak,
          longest_streak: streakData.longest_streak,
          last_activity_date: streakData.last_activity_date
        },
        total_active_days: streakData.total_active_days
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
    await computeStudentStreak(req.user.id);

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