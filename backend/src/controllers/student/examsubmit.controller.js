const db = require('../../config/db');

// ─── START EXAM ───────────────────────────────────────────────────────────────
// Creates an in-progress attempt; prevents duplicate active sessions

exports.startExam = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { examId } = req.params;
    const studentId = req.user.id;
    const isTeacher = req.user.role === 'teacher' || req.user.role === 'admin';

    // 1. Verify exam exists
    const { rows: examRows } = await client.query(
      `SELECT e.id, e.title, e.duration_minutes, e.total_marks,
              e.passing_marks, e.is_premium, e.status, e.ends_at
       FROM exams e
       LEFT JOIN subjects s ON s.id = e.subject_id
       WHERE e.id = $1 
         AND ($3::boolean = true OR e.batch_id IS NULL OR EXISTS (
           SELECT 1 FROM batch_students bs
           WHERE bs.batch_id = e.batch_id AND bs.student_id = $2
         ))`,
      [examId, studentId, isTeacher]
    );

    if (!examRows[0])
      return res.status(404).json({ success: false, message: 'Exam not found or you are not enrolled/eligible for this exam' });

    const exam = examRows[0];

    if (exam.is_premium && !req.user.is_premium && !isTeacher)
      return res.status(403).json({ success: false, message: 'Premium access required for this exam' });

    // 2. Check existing attempt
    const { rows: existing } = await client.query(
      `SELECT id, status, deadline_at FROM exam_submissions
       WHERE exam_id = $1 AND student_id = $2`,
      [examId, studentId]
    );

    await client.query('BEGIN');

    const durationMins = exam.duration_minutes || 60;
    const newDeadline = new Date(Date.now() + durationMins * 60 * 1000).toISOString();

    let finalDeadline = newDeadline;

    if (existing[0]) {
      const existingDeadline = existing[0].deadline_at ? new Date(existing[0].deadline_at).getTime() : 0;
      // If previous deadline expired or status was submitted, reset timer for fresh time
      if (existing[0].status === 'submitted' || existingDeadline < Date.now()) {
        finalDeadline = newDeadline;
        await client.query(
          `UPDATE exam_submissions
           SET status = 'in_progress', started_at = NOW(), submitted_at = NULL, deadline_at = $3, score = NULL, percentage = NULL, passed = NULL
           WHERE exam_id = $1 AND student_id = $2`,
          [examId, studentId, finalDeadline]
        );
        await client.query(
          `DELETE FROM submission_answers WHERE submission_id = $1`,
          [existing[0].id]
        );
      } else {
        finalDeadline = existing[0].deadline_at;
      }
    }

    const { rows: submissionRows } = await client.query(
      `INSERT INTO exam_submissions
         (exam_id, student_id, status, started_at, deadline_at)
       VALUES ($1, $2, 'in_progress', NOW(), $3)
       ON CONFLICT (exam_id, student_id) DO UPDATE
         SET status = 'in_progress', deadline_at = EXCLUDED.deadline_at
       RETURNING id, started_at, deadline_at, status`,
      [examId, studentId, finalDeadline]
    );

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Exam started',
      data: {
        submission_id: submissionRows[0].id,
        started_at: submissionRows[0].started_at,
        deadline_at: submissionRows[0].deadline_at,
        server_time: new Date().toISOString(),
        exam
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('startExam DB error:', err);
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

    const isTeacher = req.user.role === 'teacher' || req.user.role === 'admin';

    // Verify student has an active attempt
    const { rows: session } = await db.query(
      `SELECT id, status, deadline_at FROM exam_submissions
       WHERE exam_id = $1 AND student_id = $2`,
      [examId, studentId]
    );

    if (!session[0] && !isTeacher)
      return res.status(403).json({ success: false, message: 'Start the exam before fetching questions' });

    if (session[0]?.status === 'submitted' && !isTeacher)
      return res.status(400).json({ success: false, message: 'Exam already submitted' });

    // Auto-submit if past deadline (only for regular students)
    if (session[0]?.deadline_at && new Date(session[0].deadline_at) < new Date() && !isTeacher) {
      await db.query(
        `UPDATE exam_submissions SET status = 'submitted', submitted_at = NOW()
         WHERE id = $1`,
        [session[0].id]
      );
      return res.status(400).json({ success: false, message: 'Time is up — your exam was auto-submitted' });
    }

    // Questions without answers
    let { rows } = await db.query(
      `SELECT
         q.id,
         q.question_text,
         q.question_type,
         q.options,
         q.image_url,
         q.audio_url,
         q.difficulty,
         eq.marks,
         eq.order_index
       FROM exam_questions eq
       JOIN questions q ON q.id = eq.question_id
       WHERE eq.exam_id = $1
       ORDER BY eq.order_index ASC, q.created_at ASC`,
      [examId]
    );

    if (rows.length === 0) {
      const { rows: examInfo } = await db.query(
        `SELECT subject_id FROM exams WHERE id = $1`,
        [examId]
      );
      if (examInfo[0]) {
        let { rows: availableQs } = await db.query(
          `SELECT id FROM questions WHERE subject_id = $1 ORDER BY created_at ASC LIMIT 15`,
          [examInfo[0].subject_id]
        );
        if (availableQs.length === 0) {
          const { rows: fallbackQs } = await db.query(`SELECT id FROM questions ORDER BY created_at ASC LIMIT 15`);
          availableQs = fallbackQs;
        }
        if (availableQs.length > 0) {
          const valueTuples = availableQs.map((q, idx) => `('${examId}', '${q.id}', ${idx + 1}, 1)`).join(', ');
          await db.query(
            `INSERT INTO exam_questions (exam_id, question_id, order_index, marks)
             VALUES ${valueTuples}
             ON CONFLICT DO NOTHING`
          );
          const { rows: refetched } = await db.query(
            `SELECT
               q.id,
               q.question_text,
               q.question_type,
               q.options,
               q.image_url,
               q.audio_url,
               q.difficulty,
               eq.marks,
               eq.order_index
             FROM exam_questions eq
             JOIN questions q ON q.id = eq.question_id
             WHERE eq.exam_id = $1
             ORDER BY eq.order_index ASC, q.created_at ASC`,
            [examId]
          );
          rows = refetched;
        }
      }
    }

    res.json({
      success: true,
      data: {
        questions: rows.map((q) => ({
          ...q,
          options: typeof q.options === 'string' ? JSON.parse(q.options) : (q.options ?? []),
        })),
        deadline_at: session[0].deadline_at,
        submission_id: session[0].id,
        server_time: new Date().toISOString()
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

    if (session[0].deadline_at && new Date(session[0].deadline_at) < new Date())
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
      `SELECT id, exam_id, status, deadline_at FROM exam_submissions
       WHERE id = $1 AND student_id = $2`,
      [submissionId, studentId]
    );

    if (!session[0])
      return res.status(404).json({ success: false, message: 'Submission not found' });

    const examId = session[0].exam_id;

    if (session[0].status === 'submitted')
      return res.status(400).json({ success: false, message: 'Cannot modify a submitted exam' });

    if (session[0].deadline_at && new Date(session[0].deadline_at) < new Date())
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
      `mentara-labs/student-submissions/${studentId}/exams/${examId}`,
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
      const match = oldUrl.match(/\/upload\/v\d+\/(.+)\.[a-z]+$/i);
      if (match) {
        cloudinaryService.deleteImage(match[1]).catch(() => {});
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

    // Auto-generate certificate if enabled & passed/completed
    const { rows: examCheck } = await client.query(
      `SELECT title, certificate_enabled, passing_marks FROM exams WHERE id = $1`,
      [exam_id]
    );

    if (examCheck[0] && examCheck[0].certificate_enabled) {
      const isEligible = examCheck[0].passing_marks !== null ? passed === true : true;
      if (isEligible) {
        const currentYear = new Date().getFullYear();
        const prefix = `MTL-${currentYear}-`;
        const { rows: lastCert } = await client.query(
          `SELECT certificate_id FROM public.certificates 
           WHERE certificate_id LIKE $1 
           ORDER BY certificate_id DESC LIMIT 1`,
          [`${prefix}%`]
        );
        let nextNum = 1;
        if (lastCert[0]) {
          const match = lastCert[0].certificate_id.match(/-(\d+)$/);
          if (match) {
            nextNum = parseInt(match[1], 10) + 1;
          }
        }
        const certificateId = `${prefix}${String(nextNum).padStart(6, '0')}`;

        // Get student name
        const { rows: studentCheck } = await client.query(
          `SELECT full_name FROM users WHERE id = $1`,
          [studentId]
        );
        const studentName = studentCheck[0]?.full_name || 'Student';
        const examName = examCheck[0].title || 'Exam';

        await client.query(
          `INSERT INTO public.certificates (certificate_id, student_id, exam_id, student_name, exam_name, issue_date)
           VALUES ($1, $2, $3, $4, $5, NOW())
           ON CONFLICT (student_id, exam_id) DO NOTHING`,
          [certificateId, studentId, exam_id, studentName, examName]
        );
      }
    }

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
         e.subject_id,
         e.topic_id,
         s.name             AS subject_name,
         s.class_id,
         cl.curriculum_id,
         t.name             AS topic_name,
         es.score,
         es.total_marks,
         es.percentage,
         es.passed,
         es.submitted_at,
         RANK() OVER (PARTITION BY es.exam_id ORDER BY es.score DESC) AS rank,
          (
            SELECT COUNT(*)
            FROM exam_questions eq
            JOIN questions q ON q.id = eq.question_id
            WHERE eq.exam_id = e.id AND q.question_type != 'photo'
          ) = 0 AND EXISTS (
            SELECT 1 FROM exam_questions eq2 WHERE eq2.exam_id = e.id
          ) AS is_structure_only
       FROM exam_submissions es
       JOIN exams    e ON e.id = es.exam_id
       LEFT JOIN subjects s ON s.id = e.subject_id
       LEFT JOIN classes cl ON cl.id = s.class_id
       LEFT JOIN topics t ON t.id = e.topic_id
       WHERE es.student_id = $1 AND es.status = 'submitted'
       ORDER BY es.submitted_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};