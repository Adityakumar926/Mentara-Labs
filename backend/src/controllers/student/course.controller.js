const db = require('../../config/db');

// ─── STUDENT CURRICULUM ACCESS ────────────────────────────────────────────────

exports.getMyCurriculums = async (req, res) => {
  try {
    if (!req.user.curriculum_id) {
      return res.json({ success: true, data: [] });
    }
    const { rows } = await db.query(
      `SELECT
         c.id, c.name, c.description, c.thumbnail_url,
         (SELECT COUNT(*) FROM classes cl WHERE cl.curriculum_id = c.id) AS class_count
       FROM curriculums c
       WHERE c.id = $1 AND c.is_active = true`,
      [req.user.curriculum_id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCurriculumSubjects = async (req, res) => {
  try {
    if (req.user.curriculum_id !== req.params.curriculumId) {
      return res.status(403).json({ success: false, message: 'Access denied: not enrolled in this curriculum' });
    }

    const { rows } = await db.query(
      `SELECT
         s.*,
         cl.name AS class_name,
         curr.name AS curriculum_name,
         (SELECT COUNT(*) FROM topics t WHERE t.subject_id = s.id) AS topic_count,
         (
           SELECT COUNT(*)::int 
           FROM content c 
           JOIN topics t ON t.id = c.topic_id 
           WHERE t.subject_id = s.id
         ) + (
           SELECT COUNT(*)::int 
           FROM exams e 
           JOIN topics t ON t.id = e.topic_id 
           WHERE t.subject_id = s.id AND e.status IN ('live', 'scheduled', 'ended')
         ) AS content_count,
         (
           SELECT COUNT(*)::int 
           FROM content c 
           JOIN topics t ON t.id = c.topic_id 
           WHERE t.subject_id = s.id AND c.is_premium = true
         ) + (
           SELECT COUNT(*)::int 
           FROM exams e 
           JOIN topics t ON t.id = e.topic_id 
           WHERE t.subject_id = s.id AND e.is_premium = true AND e.status IN ('live', 'scheduled', 'ended')
         ) AS premium_content_count
       FROM subjects s
       JOIN classes cl ON cl.id = s.class_id
       JOIN curriculums curr ON curr.id = cl.curriculum_id
       WHERE s.class_id = $1
       ORDER BY s.order_index`,
      [req.user.class_id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get topics in a subject
exports.getSubjectTopics = async (req, res) => {
  try {
    const { subjectId } = req.params;

    // Verify subject belongs to student's class
    const { rows: access } = await db.query(
      `SELECT 1 FROM subjects s
       WHERE s.id = $1 AND s.class_id = $2`,
      [subjectId, req.user.class_id]
    );
    if (!access.length) {
      return res.status(403).json({ success: false, message: 'Access denied to this subject' });
    }

    const { rows } = await db.query(
      `SELECT t.*,
              up.completed AS is_completed,
              (SELECT COUNT(*)::int FROM content c WHERE c.topic_id = t.id) AS resource_count,
              (SELECT COUNT(*)::int FROM exams e WHERE e.topic_id = t.id AND e.status IN ('live', 'scheduled', 'ended')
                 AND (e.batch_id IS NULL OR EXISTS (
                   SELECT 1 FROM batch_students bs
                   WHERE bs.batch_id = e.batch_id AND bs.student_id = $1
                 ))
              ) AS exam_count
       FROM topics t
       LEFT JOIN user_progress up ON up.topic_id = t.id AND up.user_id = $1
       WHERE t.subject_id = $2
       ORDER BY t.parent_topic_id ASC NULLS FIRST, t.order_index ASC`,
      [req.user.id, subjectId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get learning resources in a topic
exports.getTopicContent = async (req, res) => {
  try {
    const { topicId } = req.params;
    const isPremium = req.user.is_premium;

    // Verify topic belongs to student's class via subjects
    const { rows: access } = await db.query(
      `SELECT t.name AS topic_name, s.name AS subject_name FROM topics t
       JOIN subjects s ON s.id = t.subject_id
       WHERE t.id = $1 AND s.class_id = $2`,
      [topicId, req.user.class_id]
    );
    if (!access.length) {
      return res.status(403).json({ success: false, message: 'Access denied to this topic' });
    }

    const { rows: contentRows } = await db.query(
      `SELECT
         c.id,
         c.title,
         c.content_type,
         c.order_index,
         c.is_premium,
         CASE WHEN c.is_premium AND $2 = false THEN NULL ELSE c.file_url          END AS file_url,
         CASE WHEN c.is_premium AND $2 = false THEN NULL ELSE c.mux_playback_id   END AS mux_playback_id,
         CASE WHEN c.is_premium AND $2 = false THEN NULL ELSE c.animation_id      END AS animation_id,
         up.completed AS is_completed,
         up.video_progress
       FROM content c
       LEFT JOIN user_progress up ON up.content_id = c.id AND up.user_id = $3
       WHERE c.topic_id = $1
       ORDER BY c.order_index`,
      [topicId, isPremium, req.user.id]
    );

    const { rows: examRows } = await db.query(
      `SELECT
         e.id,
         e.title,
         e.description,
         e.duration_minutes,
         e.total_marks,
         e.passing_marks,
         e.is_premium,
         e.status,
         e.scheduled_at,
         e.ends_at,
         es.status AS submission_status,
         es.id AS submission_id
       FROM exams e
       LEFT JOIN exam_submissions es ON es.exam_id = e.id AND es.student_id = $2
       WHERE e.topic_id = $1
         AND e.status IN ('live', 'scheduled', 'ended')
         AND (e.batch_id IS NULL OR EXISTS (
           SELECT 1 FROM batch_students bs
           WHERE bs.batch_id = e.batch_id AND bs.student_id = $2
         ))
       ORDER BY e.created_at DESC`,
      [topicId, req.user.id]
    );

    res.json({
      success: true,
      data: {
        topic_name: access[0].topic_name,
        subject_name: access[0].subject_name,
        items: contentRows,
        exams: examRows
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── INDIVIDUAL CONTENT ───────────────────────────────────────────────────────

exports.getNoteUrl = async (req, res) => {
  // PDFs are stored on Cloudinary — return the public URL directly
  try {
    const { rows } = await db.query(
      `SELECT c.file_url, c.is_premium FROM content c
       WHERE c.id = $1 AND c.content_type = 'note'`,
      [req.params.contentId]
    );
    if (!rows[0])
      return res.status(404).json({ success: false, message: 'Note not found' });
    if (rows[0].is_premium && !req.user.is_premium)
      return res.status(403).json({ success: false, message: 'Premium access required' });

    res.json({ success: true, url: rows[0].file_url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getWorksheetUrl = async (req, res) => {
  // Worksheet images are stored on Cloudinary — return the public URL directly.
  // The student will use this URL to render the drawable worksheet canvas.
  try {
    const { rows } = await db.query(
      `SELECT c.file_url, c.is_premium FROM content c
       WHERE c.id = $1 AND c.content_type = 'worksheet'`,
      [req.params.contentId]
    );
    if (!rows[0])
      return res.status(404).json({ success: false, message: 'Worksheet not found' });
    if (rows[0].is_premium && !req.user.is_premium)
      return res.status(403).json({ success: false, message: 'Premium access required' });

    res.json({ success: true, url: rows[0].file_url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAnimation = async (req, res) => {
  // Animations are stored as html_content text in the DB — no file fetch needed
  try {
    const { rows } = await db.query(
      `SELECT id, title, description, html_content, is_premium FROM animations
       WHERE id = $1`,
      [req.params.animationId]
    );
    if (!rows[0])
      return res.status(404).json({ success: false, message: 'Animation not found' });
    if (rows[0].is_premium && !req.user.is_premium)
      return res.status(403).json({ success: false, message: 'Premium access required' });

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getVideoToken = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT mux_playback_id, is_premium FROM content
       WHERE id = $1 AND content_type = 'video'`,
      [req.params.contentId]
    );
    if (!rows[0])
      return res.status(404).json({ success: false, message: 'Video not found' });
    if (rows[0].is_premium && !req.user.is_premium)
      return res.status(403).json({ success: false, message: 'Premium access required' });

    res.json({ success: true, playback_id: rows[0].mux_playback_id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── STUDENT QUESTIONS ────────────────────────────────────────────────────────

exports.getMyQuestions = async (req, res) => {
  try {
    const studentId = req.user.id;
    const isPremium = req.user.is_premium;
    const { subject_id, search } = req.query;

    const extraParams = [];
    const conditions  = [];

    if (subject_id) {
      extraParams.push(subject_id);
      conditions.push(`s.id = $${4 + extraParams.length}`);
    }
    if (search) {
      extraParams.push(`%${search.toLowerCase()}%`);
      conditions.push(`LOWER(q.question_text) LIKE $${4 + extraParams.length}`);
    }

    const where = conditions.length ? 'AND ' + conditions.join(' AND ') : '';

    const { rows } = await db.query(
      `SELECT
         q.id,
         q.question_type,
         q.is_premium,
         CASE WHEN q.is_premium AND NOT $2::boolean THEN '[PREMIUM]' ELSE q.question_text  END AS question_text,
         CASE WHEN q.is_premium AND NOT $2::boolean THEN NULL        ELSE q.options        END AS options,
         CASE WHEN q.is_premium AND NOT $2::boolean THEN NULL        ELSE q.correct_answer END AS correct_answer,
         CASE WHEN q.is_premium AND NOT $2::boolean THEN NULL        ELSE q.image_url      END AS image_url,
         s.id          AS subject_id,
         s.name        AS subject_name,
         s.order_index AS subject_order,
         c.id          AS curriculum_id,
         c.name        AS curriculum_name
       FROM subjects    s
       JOIN classes     cl ON cl.id           = s.class_id
       JOIN curriculums c  ON c.id            = cl.curriculum_id
       JOIN questions   q  ON q.subject_id    = s.id
       WHERE c.id = $1 AND cl.id = $3
         AND c.is_active = true
         ${where}
       ORDER BY s.order_index, q.is_premium ASC, q.created_at DESC`,
      [req.user.curriculum_id, isPremium, req.user.class_id, ...extraParams]
    );

    const grouped     = [];
    const seenSubject = new Map();

    for (const row of rows) {
      if (!seenSubject.has(row.subject_id)) {
        const group = {
          subject_id:      row.subject_id,
          subject_name:    row.subject_name,
          curriculum_name: row.curriculum_name,
          questions:       [],
        };
        seenSubject.set(row.subject_id, group);
        grouped.push(group);
      }
      seenSubject.get(row.subject_id).questions.push({
        id:             row.id,
        question_text:  row.question_text,
        question_type:  row.question_type,
        options:        row.options,
        correct_answer: row.correct_answer,
        image_url:      row.image_url,
        is_premium:     row.is_premium,
      });
    }

    res.json({ success: true, data: grouped });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all active curriculums (for student onboarding)
exports.getAllCurriculums = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT id, name, description, thumbnail_url
       FROM curriculums
       WHERE is_active = true
       ORDER BY name ASC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get active classes under a curriculum (for student onboarding)
exports.getCurriculumClasses = async (req, res) => {
  try {
    const { curriculumId } = req.params;
    const { rows } = await db.query(
      `SELECT id, name, description
       FROM classes
       WHERE curriculum_id = $1
       ORDER BY order_index ASC, name ASC`,
      [curriculumId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all subjects, contents, and exams for student class (Explore Dashboard)
exports.getExploreContents = async (req, res) => {
  try {
    if (!req.user.class_id) {
      return res.json({ success: true, data: { subjects: [], contents: [], exams: [] } });
    }
    const isPremium = req.user.is_premium;

    // 1. Get all subjects of the student's class
    const { rows: subjects } = await db.query(
      `SELECT s.*, 
              cl.name AS class_name,
              curr.name AS curriculum_name
       FROM subjects s
       JOIN classes cl ON cl.id = s.class_id
       JOIN curriculums curr ON curr.id = cl.curriculum_id
       WHERE s.class_id = $1
       ORDER BY s.order_index`,
      [req.user.class_id]
    );

    // 2. Get all content items of all subjects in this class
    const { rows: contents } = await db.query(
      `SELECT c.id,
              c.title,
              c.content_type,
              c.order_index,
              c.is_premium,
              c.topic_id,
              t.name AS topic_name,
              s.id AS subject_id,
              s.name AS subject_name,
              CASE WHEN c.is_premium AND $2 = false THEN NULL ELSE c.file_url          END AS file_url,
              CASE WHEN c.is_premium AND $2 = false THEN NULL ELSE c.mux_playback_id   END AS mux_playback_id,
              CASE WHEN c.is_premium AND $2 = false THEN NULL ELSE c.animation_id      END AS animation_id,
              up.completed AS is_completed
       FROM content c
       JOIN topics t ON t.id = c.topic_id
       JOIN subjects s ON s.id = t.subject_id
       LEFT JOIN user_progress up ON up.content_id = c.id AND up.user_id = $3
       WHERE s.class_id = $1
       ORDER BY s.order_index, t.order_index, c.order_index`,
      [req.user.class_id, isPremium, req.user.id]
    );

    // 3. Get all live and scheduled exams for this class
    const { rows: exams } = await db.query(
      `SELECT e.id,
              e.title,
              e.description,
              e.duration_minutes,
              e.total_marks,
              e.passing_marks,
              e.is_premium,
              e.status,
              e.scheduled_at,
              e.ends_at,
              e.subject_id,
              e.topic_id,
              s.name AS subject_name,
              t.name AS topic_name,
              es.status AS submission_status,
              es.id AS submission_id
       FROM exams e
       JOIN subjects s ON s.id = e.subject_id
       LEFT JOIN topics t ON t.id = e.topic_id
       LEFT JOIN exam_submissions es ON es.exam_id = e.id AND es.student_id = $2
       WHERE s.class_id = $1
         AND e.status IN ('live', 'scheduled')
       ORDER BY e.created_at DESC`,
      [req.user.class_id, req.user.id]
    );

    res.json({
      success: true,
      data: {
        subjects,
        contents,
        exams
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /student/exams — live exams from enrolled classes (no batches)
exports.getLiveExams = async (req, res) => {
  try {
    if (!req.user.class_id) {
      return res.json({ success: true, data: [] });
    }

    const { rows } = await db.query(
      `SELECT
         e.id, e.title, e.description, e.duration_minutes,
         e.total_marks, e.passing_marks, e.is_premium,
         e.scheduled_at, e.ends_at,
         s.name AS subject_name,
         EXISTS (
           SELECT 1 FROM exam_submissions es
           WHERE es.exam_id = e.id AND es.student_id = $1
         ) AS already_attempted
       FROM exams e
       JOIN subjects s ON s.id = e.subject_id
       WHERE s.class_id = $2
         AND e.status = 'live'
       ORDER BY e.ends_at ASC`,
      [req.user.id, req.user.class_id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /student/exams/scheduled — upcoming exams from enrolled classes (no batches)
exports.getScheduledExams = async (req, res) => {
  try {
    if (!req.user.class_id) {
      return res.json({ success: true, data: [] });
    }

    const { rows } = await db.query(
      `SELECT
         e.id, e.title, e.description, e.duration_minutes,
         e.total_marks, e.passing_marks, e.is_premium,
         e.scheduled_at, e.ends_at,
         s.name AS subject_name
       FROM exams e
       JOIN subjects s ON s.id = e.subject_id
       WHERE s.class_id = $2
         AND e.status = 'scheduled'
       ORDER BY e.scheduled_at ASC`,
      [req.user.id, req.user.class_id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};