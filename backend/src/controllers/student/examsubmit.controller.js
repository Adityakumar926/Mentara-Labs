const db = require('../../config/db');

// ─── START EXAM ───────────────────────────────────────────────────────────────
// Creates an in-progress attempt; prevents duplicate active sessions

exports.startExam = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { examId } = req.params;
    const studentId = req.user.id;

    if (!req.user.class_id)
      return res.status(403).json({ success: false, message: 'You must complete onboarding to select a curriculum and class before taking exams' });

    // 1. Verify exam exists, is live, and student is eligible (class match + optional batch)
    const { rows: examRows } = await client.query(
      `SELECT e.id, e.title, e.duration_minutes, e.total_marks,
              e.passing_marks, e.is_premium, e.status, e.ends_at
       FROM exams e
       JOIN subjects s ON s.id = e.subject_id
       WHERE e.id = $1 
         AND s.class_id = $3
         AND (e.batch_id IS NULL OR EXISTS (
           SELECT 1 FROM batch_students bs
           WHERE bs.batch_id = e.batch_id AND bs.student_id = $2
         ))`,
      [examId, studentId, req.user.class_id]
    );

    if (!examRows[0])
      return res.status(404).json({ success: false, message: 'Exam not found or you are not enrolled/eligible for this exam' });

    const exam = examRows[0];

    if (exam.status !== 'live')
      return res.status(400).json({ success: false, message: `Exam is not live (current status: ${exam.status})` });

    if (exam.is_premium && !req.user.is_premium)
      return res.status(403).json({ success: false, message: 'Premium access required for this exam' });

    // 2. Block if already submitted
    const { rows: existing } = await client.query(
      `SELECT id, status, deadline_at FROM exam_submissions
       WHERE exam_id = $1 AND student_id = $2`,
      [examId, studentId]
    );

    if (existing[0]?.status === 'submitted')
      return res.status(409).json({ success: false, message: 'You have already submitted this exam' });

    // 3. Upsert attempt — idempotent so React StrictMode double-invoke and
    //    any network retries never hit the unique constraint.
    //    If a row already exists (in_progress), keep its original deadline_at.
    await client.query('BEGIN');

    const deadline = new Date(
      Date.now() + exam.duration_minutes * 60 * 1000
    ).toISOString();

    const { rows: submissionRows } = await client.query(
      `INSERT INTO exam_submissions
         (exam_id, student_id, status, started_at, deadline_at)
       VALUES ($1, $2, 'in_progress', NOW(), $3)
       ON CONFLICT (exam_id, student_id) DO UPDATE
         SET started_at = exam_submissions.started_at
       RETURNING id, started_at, deadline_at, status`,
      [examId, studentId, deadline]
    );

    await client.query('COMMIT');

    const isNew = submissionRows[0].status === 'in_progress';
    res.status(isNew ? 201 : 200).json({
      success: true,
      message: existing[0] ? 'Resuming existing attempt' : 'Exam started',
      data: {
        submission_id: submissionRows[0].id,
        started_at: submissionRows[0].started_at,
        deadline_at: submissionRows[0].deadline_at,
        exam
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
};

// ─── GET EXAM QUESTIONS (for the student during attempt) ──────────────────────
// Strips correct_answer and explanation before sending

exports.getExamQuestions = async (req, res) => {
  try {
    const { examId } = req.params;
    const studentId = req.user.id;

    // Verify student has an active attempt
    const { rows: session } = await db.query(
      `SELECT id, status, deadline_at FROM exam_submissions
       WHERE exam_id = $1 AND student_id = $2`,
      [examId, studentId]
    );

    if (!session[0])
      return res.status(403).json({ success: false, message: 'Start the exam before fetching questions' });

    if (session[0].status === 'submitted')
      return res.status(400).json({ success: false, message: 'Exam already submitted' });

    // Auto-submit if past deadline
    if (new Date(session[0].deadline_at) < new Date()) {
      await db.query(
        `UPDATE exam_submissions SET status = 'submitted', submitted_at = NOW()
         WHERE id = $1`,
        [session[0].id]
      );
      return res.status(400).json({ success: false, message: 'Time is up — your exam was auto-submitted' });
    }

    // Questions with any previously saved student answers for this submission
    const { rows } = await db.query(
      `SELECT
         q.id,
         q.question_text,
         q.question_type,
         q.options,
         q.image_url,
         eq.marks,
         eq.order_index,
         sa.answer AS student_answer
       FROM exam_questions eq
       JOIN questions q ON q.id = eq.question_id
       LEFT JOIN submission_answers sa ON sa.question_id = q.id AND sa.submission_id = $2
       WHERE eq.exam_id = $1
       ORDER BY eq.order_index`,
      [examId, session[0].id]
    );

    res.json({
      success: true,
      data: {
        questions: rows.map((q) => ({
          ...q,
          options: typeof q.options === 'string' ? JSON.parse(q.options) : (q.options ?? []),
        })),
        deadline_at: session[0].deadline_at,
        submission_id: session[0].id
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── SAVE ANSWER (auto-save per question) ─────────────────────────────────────

exports.saveAnswer = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { question_id, answer } = req.body;
    const studentId = req.user.id;

    if (!question_id || answer === undefined)
      return res.status(400).json({ success: false, message: 'question_id and answer are required' });

    // Verify ownership and active status
    const { rows: session } = await db.query(
      `SELECT id, status, deadline_at FROM exam_submissions
       WHERE id = $1 AND student_id = $2`,
      [submissionId, studentId]
    );

    if (!session[0])
      return res.status(404).json({ success: false, message: 'Submission not found' });

    if (session[0].status === 'submitted')
      return res.status(400).json({ success: false, message: 'Cannot modify a submitted exam' });

    if (new Date(session[0].deadline_at) < new Date())
      return res.status(400).json({ success: false, message: 'Time is up' });

    // Upsert the answer
    await db.query(
      `INSERT INTO submission_answers (submission_id, question_id, answer, saved_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (submission_id, question_id)
       DO UPDATE SET answer = EXCLUDED.answer, saved_at = NOW()`,
      [submissionId, question_id, answer]
    );

    res.json({ success: true, message: 'Answer saved' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── SAVE PHOTO ANSWER (for question_type = 'photo') ───────────────────────────
// Student uploads a real image file (e.g. a photo of handwritten work) instead
// of pasting a URL. Route wires: upload('examPhoto').single('photo'), handleUploadError.

exports.savePhotoAnswer = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { question_id } = req.body;
    const studentId = req.user.id;

    if (!question_id)
      return res.status(400).json({ success: false, message: 'question_id is required' });

    if (!req.file)
      return res.status(400).json({ success: false, message: 'No photo uploaded' });

    // Verify ownership and active status — same checks as the text saveAnswer flow
    const { rows: session } = await db.query(
      `SELECT id, status, deadline_at FROM exam_submissions
       WHERE id = $1 AND student_id = $2`,
      [submissionId, studentId]
    );

    if (!session[0])
      return res.status(404).json({ success: false, message: 'Submission not found' });

    if (session[0].status === 'submitted')
      return res.status(400).json({ success: false, message: 'Cannot modify a submitted exam' });

    if (new Date(session[0].deadline_at) < new Date())
      return res.status(400).json({ success: false, message: 'Time is up' });

    // If this question already has a photo answer, remove the old Cloudinary asset
    const { rows: existingAnswer } = await db.query(
      `SELECT answer FROM submission_answers WHERE submission_id = $1 AND question_id = $2`,
      [submissionId, question_id]
    );
    const oldUrl = existingAnswer[0]?.answer;

    const cloudinaryService = require('../../services/cloudinary.service');
    const { url, publicId } = await cloudinaryService.uploadImage(
      req.file.buffer,
      `exam-answers/${submissionId}`,
      { tags: [`submission_${submissionId}`, `question_${question_id}`] }
    );

    // Upsert into the same answer column saveAnswer uses — for photo questions
    // it just holds a URL instead of typed text
    await db.query(
      `INSERT INTO submission_answers (submission_id, question_id, answer, saved_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (submission_id, question_id)
       DO UPDATE SET answer = EXCLUDED.answer, saved_at = NOW()`,
      [submissionId, question_id, url]
    );

    if (oldUrl && oldUrl.includes('cloudinary')) {
      const match = oldUrl.match(/exam-answers\/[^./]+\/[^./]+/);
      if (match) {
        cloudinaryService.deleteImage(match[0]).catch(() => {});
      }
    }

    res.json({ success: true, message: 'Answer photo uploaded', data: { url, cloudinary_public_id: publicId } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── SUBMIT EXAM ──────────────────────────────────────────────────────────────
// Scores all answers atomically, calculates percentage, marks pass/fail

exports.submitExam = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { submissionId } = req.params;
    const studentId = req.user.id;

    await client.query('BEGIN');

    // Lock the row to prevent race conditions on double-submit
    const { rows: session } = await client.query(
      `SELECT es.id, es.exam_id, es.status, es.deadline_at,
              e.total_marks, e.passing_marks
       FROM exam_submissions es
       JOIN exams e ON e.id = es.exam_id
       WHERE es.id = $1 AND es.student_id = $2
       FOR UPDATE`,
      [submissionId, studentId]
    );

    if (!session[0])
      return res.status(404).json({ success: false, message: 'Submission not found' });

    if (session[0].status === 'submitted') {
      await client.query('ROLLBACK');
      return res.status(409).json({ success: false, message: 'Exam already submitted' });
    }

    const { exam_id, total_marks, passing_marks } = session[0];

    // Fetch all answers alongside correct answers
    const { rows: answers } = await client.query(
      `SELECT
         sa.question_id,
         sa.answer            AS student_answer,
         q.correct_answer,
         q.question_type,
         eq.marks
       FROM submission_answers sa
       JOIN questions q      ON q.id  = sa.question_id
       JOIN exam_questions eq ON eq.question_id = sa.question_id
                             AND eq.exam_id = $1
       WHERE sa.submission_id = $2`,
      [exam_id, submissionId]
    );

    // Score each answer
    let score = 0;
    const scoredAnswers = answers.map((a) => {
      let is_correct = false;

      if (a.question_type === 'mcq' || a.question_type === 'photo' || a.question_type === 'fill_blank') {
        is_correct =
          String(a.student_answer).trim().toLowerCase() ===
          String(a.correct_answer).trim().toLowerCase();
      }
      // manual/essay types are not auto-graded — admin reviews separately

      if (is_correct) score += Number(a.marks);

      return { ...a, is_correct };
    });

    // Update scored answers
    for (const a of scoredAnswers) {
      await client.query(
        `UPDATE submission_answers SET is_correct = $1 WHERE submission_id = $2 AND question_id = $3`,
        [a.is_correct, submissionId, a.question_id]
      );
    }

    const percentage = total_marks > 0
      ? parseFloat(((score / total_marks) * 100).toFixed(2))
      : 0;

    const passed = passing_marks !== null ? score >= passing_marks : null;

    // Finalise submission
    const { rows: finalRows } = await client.query(
      `UPDATE exam_submissions
       SET status       = 'submitted',
           submitted_at = NOW(),
           score        = $1,
           total_marks  = $2,
           percentage   = $3,
           passed       = $4
       WHERE id = $5
       RETURNING *`,
      [score, total_marks, percentage, passed, submissionId]
    );

    // Log activity for streak tracking
    await client.query(
      `INSERT INTO activity_logs (student_id, activity_date, activity_type, content_id)
       VALUES ($1, CURRENT_DATE, 'exam', $2)
       ON CONFLICT DO NOTHING`,
      [studentId, exam_id]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Exam submitted successfully',
      data: {
        score,
        total_marks,
        percentage,
        passed,
        submission: finalRows[0]
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
};

// ─── MY RESULT ────────────────────────────────────────────────────────────────
// Student views their own result with per-question breakdown

exports.getMyResult = async (req, res) => {
  try {
    const { examId } = req.params;
    const studentId = req.user.id;

    const { rows: submission } = await db.query(
      `SELECT
         es.*,
         e.title          AS exam_title,
         e.passing_marks,
         e.duration_minutes,
         e.ends_at        AS exam_ends_at,
         e.status         AS exam_status,
         s.name           AS subject_name
       FROM exam_submissions es
       JOIN exams    e ON e.id = es.exam_id
       LEFT JOIN subjects s ON s.id = e.subject_id
       WHERE es.exam_id = $1 AND es.student_id = $2 AND es.status = 'submitted'`,
      [examId, studentId]
    );

    if (!submission[0])
      return res.status(404).json({ success: false, message: 'No submitted result found for this exam' });

    // Per-question breakdown (now reveal correct answers)
    const { rows: breakdown } = await db.query(
      `SELECT
         q.id,
         q.question_text,
         q.question_type,
         q.options,
         q.correct_answer,
         q.explanation,
         sa.answer   AS student_answer,
         sa.is_correct,
         eq.marks
       FROM exam_questions eq
       JOIN questions          q  ON q.id  = eq.question_id
       LEFT JOIN submission_answers sa ON sa.question_id = eq.question_id
                                      AND sa.submission_id = $1
       WHERE eq.exam_id = $2
       ORDER BY eq.order_index`,
      [submission[0].id, examId]
    );

    // Rank among all students who took the same exam
    const { rows: rankRow } = await db.query(
      `SELECT rank, total_submissions
       FROM (
         SELECT student_id,
                RANK() OVER (ORDER BY score DESC) AS rank,
                COUNT(*) OVER ()                  AS total_submissions
         FROM exam_submissions
         WHERE exam_id = $1 AND status = 'submitted'
       ) ranked
       WHERE student_id = $2`,
      [examId, studentId]
    );

    res.json({
      success: true,
      data: {
        submission: submission[0],
        breakdown,
        rank: rankRow[0]?.rank ?? null,
        total_submissions: rankRow[0]?.total_submissions ?? null
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── MY EXAM HISTORY ──────────────────────────────────────────────────────────

exports.getMyExamHistory = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT
         es.id              AS submission_id,
         e.id               AS exam_id,
         e.title,
         s.name             AS subject_name,
         es.score,
         es.total_marks,
         es.percentage,
         es.passed,
         es.submitted_at,
         RANK() OVER (PARTITION BY es.exam_id ORDER BY es.score DESC) AS rank
       FROM exam_submissions es
       JOIN exams    e ON e.id = es.exam_id
       LEFT JOIN subjects s ON s.id = e.subject_id
       WHERE es.student_id = $1 AND es.status = 'submitted'
       ORDER BY es.submitted_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};