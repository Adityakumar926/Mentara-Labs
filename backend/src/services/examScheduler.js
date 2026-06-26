// src/services/examScheduler.js
// Runs every 60 seconds to:
//   1. Flip scheduled → live when scheduled_at is reached
//   2. Flip live → ended when ends_at is passed, and auto-submit all in-progress attempts

const db = require('../config/db');
const Notification = require('../models/Notification');
const { emitToStudents } = require('../sockets');

async function tick() {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // ── 1. Scheduled → Live ────────────────────────────────────────────────
    const { rows: started } = await client.query(
      `UPDATE exams
       SET status = 'live'
       WHERE status = 'scheduled' AND scheduled_at <= NOW()
       RETURNING id, title`
    );
    if (started.length) {
      console.log(`[Scheduler] Started ${started.length} exam(s):`, started.map((e) => e.title).join(', '));

      // Notify students outside the transaction — a notification hiccup
      // should never roll back the exam status flip itself.
      for (const exam of started) {
        try {
          const studentIds = await Notification.getTargetStudentIds(exam.id);
          const title = 'Exam is live';
          const message = `${exam.title} has started — jump in now.`;
          await Notification.createForStudents({
            studentIds,
            examId: exam.id,
            type: 'exam_live',
            title,
            message,
          });
          emitToStudents(studentIds, 'notification:new', { type: 'exam_live', examId: exam.id, title, message });
        } catch (notifyErr) {
          console.error(`[Scheduler] Failed to notify for exam ${exam.id}:`, notifyErr.message);
        }
      }
    }

    // ── 2. Live → Ended (time up) ──────────────────────────────────────────
    const { rows: ended } = await client.query(
      `UPDATE exams
       SET status = 'ended'
       WHERE status = 'live' AND ends_at <= NOW()
       RETURNING id, title`
    );

    if (ended.length) {
      console.log(`[Scheduler] Ended ${ended.length} exam(s) globally:`, ended.map((e) => e.title).join(', '));
    }

    // ── 3. Auto-submit all expired in_progress student submissions ─────────
    const { rows: expired } = await client.query(
      `SELECT es.id AS submission_id, es.student_id, es.exam_id, e.total_marks, e.passing_marks, e.title AS exam_title
       FROM exam_submissions es
       JOIN exams e ON e.id = es.exam_id
       WHERE es.status = 'in_progress' AND es.deadline_at <= NOW()`
    );

    for (const sub of expired) {
      // Score answers already saved
      const { rows: answers } = await client.query(
        `SELECT
           sa.question_id,
           sa.answer          AS student_answer,
           q.correct_answer,
           q.question_type,
           eq.marks
         FROM submission_answers sa
         JOIN questions      q  ON q.id  = sa.question_id
         JOIN exam_questions eq ON eq.question_id = sa.question_id
                               AND eq.exam_id = $1
         WHERE sa.submission_id = $2`,
        [sub.exam_id, sub.submission_id]
      );

      let score = 0;
      for (const a of answers) {
        let is_correct = false;
        if (a.question_type === 'mcq' || a.question_type === 'fill_blank') {
          is_correct =
            String(a.student_answer).trim().toLowerCase() ===
            String(a.correct_answer).trim().toLowerCase();
        }
        if (is_correct) score += Number(a.marks);

        await client.query(
          `UPDATE submission_answers SET is_correct = $1
           WHERE submission_id = $2 AND question_id = $3`,
          [is_correct, sub.submission_id, a.question_id]
        );
      }

      const percentage = sub.total_marks > 0
        ? parseFloat(((score / sub.total_marks) * 100).toFixed(2))
        : 0;
      const passed = sub.passing_marks !== null ? score >= sub.passing_marks : null;

      await client.query(
        `UPDATE exam_submissions
         SET status       = 'submitted',
             submitted_at = NOW(),
             score        = $1,
             total_marks  = $2,
             percentage   = $3,
             passed       = $4
         WHERE id = $5`,
        [score, sub.total_marks, percentage, passed, sub.submission_id]
      );

      // Log activity for streak
      await client.query(
        `INSERT INTO activity_logs (student_id, activity_date, activity_type, content_id)
         VALUES ($1, CURRENT_DATE, 'exam', $2)
         ON CONFLICT DO NOTHING`,
        [sub.student_id, sub.exam_id]
      );
    }

    if (expired.length) {
      console.log(`[Scheduler] Auto-submitted ${expired.length} expired student attempt(s)`);
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Scheduler] Error:', err.message);
  } finally {
    client.release();
  }
}

function startScheduler() {
  console.log('[Scheduler] Exam scheduler started — checking every 60 seconds');
  tick(); // run immediately on startup
  setInterval(tick, 60 * 1000);
}

module.exports = { startScheduler };