const db     = require('../../config/db');
const bcrypt = require('bcryptjs');

// ─── PROFILE ──────────────────────────────────────────────────────────────────

exports.getProfile = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT
         u.id, u.email, u.full_name, u.role,
         u.is_premium, u.premium_expires_at, u.avatar_url, u.created_at,
         s.current_streak, s.longest_streak, s.last_activity_date,
         (SELECT COUNT(DISTINCT activity_date) FROM activity_logs WHERE student_id = u.id) AS total_active_days,
         (SELECT COUNT(*)                      FROM exam_submissions WHERE student_id = u.id) AS exams_taken,
         (SELECT ROUND(AVG(percentage),2)      FROM exam_submissions WHERE student_id = u.id) AS avg_exam_score
       FROM users u
       LEFT JOIN streaks s ON s.student_id = u.id
       WHERE u.id = $1`,
      [req.user.id]
    );
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /student/profile
 *
 * Text-only profile fields. The avatar is no longer accepted as a URL here —
 * it's handled exclusively by the dedicated POST /student/profile/avatar
 * endpoint below, which takes a real multipart file upload.
 */
exports.updateProfile = async (req, res) => {
  try {
    const { full_name } = req.body;
    const { rows } = await db.query(
      `UPDATE users
       SET full_name  = COALESCE($1, full_name),
           updated_at = NOW()
       WHERE id = $2
       RETURNING id, email, full_name, avatar_url, is_premium`,
      [full_name, req.user.id]
    );
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /student/profile/avatar
 *
 * Dedicated endpoint for avatar uploads — handles multipart, pushes to Cloudinary.
 * Route already wires: upload('image').single('avatar'), handleUploadError
 * before this controller (see student.routes.js — no changes needed there).
 */
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const cloudinaryService = require('../../services/cloudinary.service');

    // Look up the existing avatar so we can clean it up after a successful replace
    const { rows: existing } = await db.query(
      `SELECT avatar_url FROM users WHERE id = $1`,
      [req.user.id]
    );
    const oldAvatarUrl = existing[0]?.avatar_url;

    const { url, publicId } = await cloudinaryService.uploadImage(
      req.file.buffer,
      'avatars',
      {
        // Auto-crop to a square face thumbnail
        transformation: [{ width: 256, height: 256, crop: 'fill', gravity: 'face' }],
        // Tag with user ID so you can clean up old avatars later
        tags: [`user_${req.user.id}`],
      }
    );

    // Persist the new avatar URL
    const { rows } = await db.query(
      `UPDATE users
       SET avatar_url = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, email, full_name, avatar_url`,
      [url, req.user.id]
    );

    // Best-effort cleanup of the previous Cloudinary asset (non-blocking, won't fail the request)
    if (oldAvatarUrl && oldAvatarUrl.includes('cloudinary')) {
      const match = oldAvatarUrl.match(/avatars\/[^./]+/);
      if (match) {
        cloudinaryService.deleteImage(match[0]).catch(() => {});
      }
    }

    res.json({ success: true, data: rows[0], cloudinary_public_id: publicId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PASSWORD ─────────────────────────────────────────────────────────────────

exports.changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password)
      return res.status(400).json({ success: false, message: 'Both passwords are required' });
    if (new_password.length < 8)
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });

    const { rows } = await db.query(
      `SELECT password_hash FROM users WHERE id = $1`, [req.user.id]
    );
    const valid = await bcrypt.compare(current_password, rows[0].password_hash);
    if (!valid)
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });

    const hash = await bcrypt.hash(new_password, 12);
    await db.query(
      `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
      [hash, req.user.id]
    );
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PROGRESS OVERVIEW ────────────────────────────────────────────────────────

exports.getProgress = async (req, res) => {
  try {
    const studentId = req.user.id;

    const [curriculums, exams, recentActivity] = await Promise.all([
      db.query(
        `SELECT
           c.id, c.name,
           COUNT(DISTINCT s.id)  AS total_subjects,
           COUNT(DISTINCT al.content_id) FILTER (
             WHERE al.activity_type IN ('study','video','animation')
           ) AS studied_content,
           COUNT(DISTINCT e.id)  AS total_exams,
           COUNT(DISTINCT es.id) AS completed_exams,
           ROUND(AVG(es.percentage), 2) AS avg_exam_score
         FROM batch_students bs
         JOIN batches    b  ON b.id = bs.batch_id
         JOIN curriculums c ON c.id = b.curriculum_id
         LEFT JOIN subjects s  ON s.curriculum_id = c.id
         LEFT JOIN content  ct ON ct.subject_id   = s.id
         LEFT JOIN activity_logs al ON al.student_id = bs.student_id AND al.content_id = ct.id
         LEFT JOIN exams e  ON e.batch_id = b.id
         LEFT JOIN exam_submissions es ON es.exam_id = e.id AND es.student_id = bs.student_id
         WHERE bs.student_id = $1
         GROUP BY c.id`,
        [studentId]
      ),
      db.query(
        `SELECT
           e.title, es.score, es.total_marks,
           es.percentage, es.submitted_at
         FROM exam_submissions es
         JOIN exams e ON e.id = es.exam_id
         WHERE es.student_id = $1
         ORDER BY es.submitted_at DESC LIMIT 10`,
        [studentId]
      ),
      db.query(
        `SELECT
           activity_date::text AS date,
           array_agg(DISTINCT activity_type) AS types
         FROM activity_logs
         WHERE student_id = $1
           AND activity_date >= NOW() - INTERVAL '7 days'
         GROUP BY activity_date
         ORDER BY activity_date DESC`,
        [studentId]
      ),
    ]);

    res.json({
      success: true,
      data: {
        curriculums:    curriculums.rows,
        recent_exams:   exams.rows,
        last_7_days:    recentActivity.rows,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};