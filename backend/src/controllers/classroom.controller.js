const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { computeStudentStreak } = require('./student/streak.controller');

const signAccessToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });

const signRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });

// Helper: Get effective seat limit for a teacher
async function getEffectiveSeatLimit(teacherId) {
  const teacherRes = await db.query(
    'SELECT id, role, subscription_plan FROM users WHERE id = $1',
    [teacherId]
  );
  const teacher = teacherRes.rows[0];
  if (!teacher) throw new Error('Teacher user not found');

  const settingsRes = await db.query(
    `SELECT key, value FROM system_settings WHERE key IN ('free_classroom_seat_limit', 'max_classroom_seat_limit')`
  );
  const settings = {};
  settingsRes.rows.forEach(r => { settings[r.key] = parseInt(r.value, 10) || 10; });

  const freeLimit = settings.free_classroom_seat_limit || 10;
  const maxLimit = settings.max_classroom_seat_limit || 50;

  const isPremium = (teacher.subscription_plan || '').toLowerCase() === 'premium';
  return isPremium ? maxLimit : freeLimit;
}

// Helper: Calculate used seats for a classroom (Active Members + Unexpired Pending Invites)
async function getUsedSeats(classroomId, client = db) {
  const membersRes = await client.query(
    `SELECT COUNT(*)::int AS count FROM classroom_members WHERE classroom_id = $1 AND status = 'active'`,
    [classroomId]
  );
  const activeCount = membersRes.rows[0]?.count || 0;

  const invitesRes = await client.query(
    `SELECT COUNT(*)::int AS count FROM classroom_invitations WHERE classroom_id = $1 AND status = 'pending' AND expires_at > NOW()`,
    [classroomId]
  );
  const pendingCount = invitesRes.rows[0]?.count || 0;

  return {
    active_count: activeCount,
    pending_count: pendingCount,
    total_used: activeCount + pendingCount
  };
}

// Helper: Generate 8-character unique alphanumeric invite code
function generateInviteCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

// ─── TEACHER MANAGEMENT CONTROLLERS ─────────────────────────────────────────

// POST /api/classrooms - Create classroom
exports.createClassroom = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Classroom name is required' });
    }

    let inviteCode = generateInviteCode();
    // Ensure code uniqueness
    let exists = await db.query('SELECT id FROM classrooms WHERE invite_code = $1', [inviteCode]);
    while (exists.rows.length > 0) {
      inviteCode = generateInviteCode();
      exists = await db.query('SELECT id FROM classrooms WHERE invite_code = $1', [inviteCode]);
    }

    const insertRes = await db.query(
      `INSERT INTO classrooms (teacher_id, name, description, invite_code, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'active', NOW(), NOW())
       RETURNING *`,
      [req.user.id, name.trim(), description ? description.trim() : null, inviteCode]
    );

    const classroom = insertRes.rows[0];
    const effectiveLimit = await getEffectiveSeatLimit(req.user.id);

    res.status(201).json({
      success: true,
      message: 'Classroom created successfully',
      data: {
        ...classroom,
        active_students: 0,
        pending_invitations: 0,
        used_seats: 0,
        effective_seat_limit: effectiveLimit,
        is_over_limit: false
      }
    });
  } catch (err) {
    console.error('Error creating classroom:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/classrooms - List classrooms owned by teacher (or admin)
exports.getClassrooms = async (req, res) => {
  try {
    const isTeacherOrAdmin = ['teacher', 'admin'].includes(req.user.role);
    if (!isTeacherOrAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { rows } = await db.query(
      `SELECT c.*, u.full_name AS teacher_name, u.email AS teacher_email
       FROM classrooms c
       JOIN users u ON c.teacher_id = u.id
       WHERE c.teacher_id = $1 AND c.status = 'active'
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );

    const effectiveLimit = await getEffectiveSeatLimit(req.user.id);

    const enriched = await Promise.all(rows.map(async (c) => {
      const seats = await getUsedSeats(c.id);
      return {
        ...c,
        active_students: seats.active_count,
        pending_invitations: seats.pending_count,
        used_seats: seats.total_used,
        effective_seat_limit: effectiveLimit,
        is_over_limit: seats.active_count > effectiveLimit
      };
    }));

    res.json({ success: true, data: enriched });
  } catch (err) {
    console.error('Error fetching classrooms:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/classrooms/:id - Classroom detail for teacher owner
exports.getClassroomById = async (req, res) => {
  try {
    const { id } = req.params;

    const classRes = await db.query(
      `SELECT c.*, u.full_name AS teacher_name, u.email AS teacher_email
       FROM classrooms c
       JOIN users u ON c.teacher_id = u.id
       WHERE c.id = $1`,
      [id]
    );
    if (classRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Classroom not found' });
    }

    const classroom = classRes.rows[0];
    if (req.user.role !== 'admin' && classroom.teacher_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not own this classroom' });
    }

    const effectiveLimit = await getEffectiveSeatLimit(classroom.teacher_id);
    const seats = await getUsedSeats(id);

    // Fetch members with streak metrics
    const membersRes = await db.query(
      `SELECT cm.id AS membership_id, cm.joined_at, cm.status,
              u.id AS student_id, u.full_name, u.email,
              COALESCE(s.current_streak, 0) AS current_streak,
              COALESCE(s.longest_streak, 0) AS longest_streak,
              s.last_activity_date,
              (SELECT COUNT(DISTINCT activity_date) FROM activity_logs WHERE student_id = u.id) AS total_active_days
       FROM classroom_members cm
       JOIN users u ON cm.student_id = u.id
       LEFT JOIN streaks s ON s.student_id = u.id
       WHERE cm.classroom_id = $1 AND cm.status = 'active'
       ORDER BY cm.joined_at DESC`,
      [id]
    );

    // Dynamic self-healing recalculation for active students
    const studentsWithFreshStreaks = await Promise.all(
      membersRes.rows.map(async (st) => {
        const streakData = await computeStudentStreak(st.student_id);
        return {
          ...st,
          current_streak: streakData.current_streak,
          longest_streak: streakData.longest_streak,
          total_active_days: streakData.total_active_days,
          last_activity_date: streakData.last_activity_date
        };
      })
    );

    // Fetch invitations
    const invitesRes = await db.query(
      `SELECT id, student_email, token, status, expires_at, created_at
       FROM classroom_invitations
       WHERE classroom_id = $1 AND status = 'pending' AND expires_at > NOW()
       ORDER BY created_at DESC`,
      [id]
    );

    // Fetch assigned exams
    const examsRes = await db.query(
      `SELECT ce.id AS assignment_id, ce.assigned_at, ce.due_date, e.*
       FROM classroom_exams ce
       JOIN exams e ON ce.exam_id = e.id
       WHERE ce.classroom_id = $1
       ORDER BY ce.assigned_at DESC`,
      [id]
    );

    // Fetch assigned materials
    const materialsRes = await db.query(
      `SELECT cm.id AS assignment_id, cm.assigned_at, cnt.*
       FROM classroom_materials cm
       JOIN content cnt ON cm.material_id = cnt.id
       WHERE cm.classroom_id = $1
       ORDER BY cm.assigned_at DESC`,
      [id]
    );

    // Fetch custom assignments
    const customAssignmentsRes = await db.query(
      `SELECT * FROM classroom_assignments WHERE classroom_id = $1 ORDER BY created_at DESC`,
      [id]
    );

    // Fetch announcements
    const announcementsRes = await db.query(
      `SELECT ca.*, u.full_name AS author_name
       FROM classroom_announcements ca
       JOIN users u ON ca.author_id = u.id
       WHERE ca.classroom_id = $1
       ORDER BY ca.created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...classroom,
        students: studentsWithFreshStreaks,
        pending_invitations: invitesRes.rows,
        assigned_exams: examsRes.rows,
        assigned_materials: materialsRes.rows,
        custom_assignments: customAssignmentsRes.rows,
        announcements: announcementsRes.rows,
        used_seats: seats.total_used,
        active_count: seats.active_count,
        pending_count: seats.pending_count,
        effective_seat_limit: effectiveLimit,
        is_over_limit: seats.active_count > effectiveLimit
      }
    });
  } catch (err) {
    console.error('Error fetching classroom details:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/classrooms/:id - Update classroom
exports.updateClassroom = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const classRes = await db.query('SELECT teacher_id FROM classrooms WHERE id = $1', [id]);
    if (classRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Classroom not found' });
    }
    if (req.user.role !== 'admin' && classRes.rows[0].teacher_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not own this classroom' });
    }

    const updateRes = await db.query(
      `UPDATE classrooms
       SET name = COALESCE($1, name), description = COALESCE($2, description), updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [name ? name.trim() : null, description !== undefined ? description.trim() : null, id]
    );

    res.json({ success: true, message: 'Classroom updated', data: updateRes.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/classrooms/:id/archive - Archive classroom
exports.archiveClassroom = async (req, res) => {
  try {
    const { id } = req.params;

    const classRes = await db.query('SELECT teacher_id FROM classrooms WHERE id = $1', [id]);
    if (classRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Classroom not found' });
    }
    if (req.user.role !== 'admin' && classRes.rows[0].teacher_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not own this classroom' });
    }

    await db.query(`UPDATE classrooms SET status = 'archived', updated_at = NOW() WHERE id = $1`, [id]);
    res.json({ success: true, message: 'Classroom archived successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── INVITATIONS & ATOMIC SEAT CONCURRENCY ──────────────────────────────────

// POST /api/classrooms/:id/invitations - Send invitation with atomic transaction & seat check
exports.sendInvitation = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { id } = req.params;
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Student email is required' });
    }
    const cleanEmail = email.trim().toLowerCase();

    await client.query('BEGIN');

    // Lock classroom row for update
    const classRes = await client.query(
      'SELECT id, teacher_id, name, invite_code, status FROM classrooms WHERE id = $1 FOR UPDATE',
      [id]
    );
    if (classRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Classroom not found' });
    }

    const classroom = classRes.rows[0];
    if (req.user.role !== 'admin' && classroom.teacher_id !== req.user.id) {
      await client.query('ROLLBACK');
      return res.status(403).json({ success: false, message: 'Forbidden: You do not own this classroom' });
    }
    if (classroom.status === 'archived') {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Cannot invite students to an archived classroom' });
    }

    // Check if student is already an active member
    const existingMember = await client.query(
      `SELECT cm.id FROM classroom_members cm
       JOIN users u ON cm.student_id = u.id
       WHERE cm.classroom_id = $1 AND LOWER(u.email) = $2 AND cm.status = 'active'`,
      [id, cleanEmail]
    );
    if (existingMember.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'This student is already a member of this classroom' });
    }

    // Calculate effective seat limit & used seats
    const effectiveLimit = await getEffectiveSeatLimit(classroom.teacher_id);
    const seats = await getUsedSeats(id, client);

    // Deduplication check: Is there already an unexpired pending invitation for this email?
    const existingInvite = await client.query(
      `SELECT id, token FROM classroom_invitations
       WHERE classroom_id = $1 AND LOWER(student_email) = $2 AND status = 'pending' AND expires_at > NOW()`,
      [id, cleanEmail]
    );

    if (existingInvite.rows.length > 0) {
      // Refresh token and extend expiry without consuming an extra seat!
      const newToken = crypto.randomBytes(16).toString('hex');
      const updatedInvite = await client.query(
        `UPDATE classroom_invitations
         SET token = $1, expires_at = NOW() + INTERVAL '7 days'
         WHERE id = $2 RETURNING *`,
        [newToken, existingInvite.rows[0].id]
      );
      await client.query('COMMIT');
      return res.json({
        success: true,
        message: `Invitation refreshed for ${cleanEmail}`,
        data: {
          ...updatedInvite.rows[0],
          invite_link: `${process.env.CLIENT_URL || 'https://www.mentp.com'}/classroom/join/${classroom.invite_code}?token=${newToken}`
        }
      });
    }

    // Check seat capacity limit BEFORE creating new invitation
    if (seats.total_used >= effectiveLimit) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        success: false,
        code: 'LIMIT_REACHED',
        message: `Classroom seat limit reached (${seats.active_count}/${effectiveLimit}). Upgrade to Premium to add more students.`,
        details: {
          used_seats: seats.total_used,
          active_students: seats.active_count,
          effective_limit: effectiveLimit,
          is_over_limit: true
        }
      });
    }

    // Create new invitation token
    const token = crypto.randomBytes(16).toString('hex');
    const inviteRes = await client.query(
      `INSERT INTO classroom_invitations (classroom_id, student_email, invited_by, token, status, expires_at, created_at)
       VALUES ($1, $2, $3, $4, 'pending', NOW() + INTERVAL '7 days', NOW())
       RETURNING *`,
      [id, cleanEmail, req.user.id, token]
    );

    await client.query('COMMIT');

    const invite = inviteRes.rows[0];
    const clientUrl = process.env.CLIENT_URL || 'https://www.mentp.com';
    const joinLink = `${clientUrl}/classroom/join/${classroom.invite_code}?token=${token}`;

    res.status(201).json({
      success: true,
      message: `Invitation sent to ${cleanEmail}`,
      data: {
        ...invite,
        invite_link: joinLink
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error sending invitation:', err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
};

// DELETE /api/classrooms/:id/students/:studentId - Remove student from classroom
exports.removeStudent = async (req, res) => {
  try {
    const { id, studentId } = req.params;

    const classRes = await db.query('SELECT teacher_id FROM classrooms WHERE id = $1', [id]);
    if (classRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Classroom not found' });
    }
    if (req.user.role !== 'admin' && classRes.rows[0].teacher_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not own this classroom' });
    }

    await db.query(
      `UPDATE classroom_members
       SET status = 'removed', removed_at = NOW()
       WHERE classroom_id = $1 AND student_id = $2`,
      [id, studentId]
    );

    res.json({ success: true, message: 'Student removed from classroom' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── UNIFIED INVITATION JOIN & PUBLIC DISCOVERY ──────────────────────────────

// GET /api/classrooms/join-info/:inviteCode - Get public discovery info & full classroom preview
exports.getJoinInfo = async (req, res) => {
  try {
    const { inviteCode } = req.params;

    const classRes = await db.query(
      `SELECT c.id, c.name, c.description, c.invite_code, c.status, u.full_name AS teacher_name, u.email AS teacher_email
       FROM classrooms c
       JOIN users u ON c.teacher_id = u.id
       WHERE c.invite_code = $1 AND c.status = 'active'`,
      [inviteCode]
    );

    if (classRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Invalid or expired classroom join link' });
    }

    const classroom = classRes.rows[0];
    const seats = await getUsedSeats(classroom.id);

    // Fetch assigned exams
    const examsRes = await db.query(
      `SELECT ce.id AS assignment_id, ce.assigned_at, ce.due_date, e.id, e.title, e.description, e.duration_minutes, e.status AS exam_type
       FROM classroom_exams ce
       JOIN exams e ON ce.exam_id = e.id
       WHERE ce.classroom_id = $1
       ORDER BY ce.assigned_at DESC`,
      [classroom.id]
    );

    // Fetch assigned materials
    const materialsRes = await db.query(
      `SELECT cm.id AS assignment_id, cm.assigned_at, cnt.id, cnt.title, cnt.content_type, cnt.file_url AS resource_url
       FROM classroom_materials cm
       JOIN content cnt ON cm.material_id = cnt.id
       WHERE cm.classroom_id = $1
       ORDER BY cm.assigned_at DESC`,
      [classroom.id]
    );

    // Fetch custom assignments
    const customAssignmentsRes = await db.query(
      `SELECT * FROM classroom_assignments WHERE classroom_id = $1 ORDER BY created_at DESC`,
      [classroom.id]
    );

    // Fetch announcements
    const announcementsRes = await db.query(
      `SELECT ca.*, u.full_name AS author_name
       FROM classroom_announcements ca
       JOIN users u ON ca.author_id = u.id
       WHERE ca.classroom_id = $1
       ORDER BY ca.created_at DESC`,
      [classroom.id]
    );

    res.json({
      success: true,
      data: {
        id: classroom.id,
        name: classroom.name,
        description: classroom.description,
        invite_code: classroom.invite_code,
        teacher_name: classroom.teacher_name,
        teacher_email: classroom.teacher_email,
        active_students: seats.active_count,
        assigned_exams: examsRes.rows,
        assigned_materials: materialsRes.rows,
        custom_assignments: customAssignmentsRes.rows,
        announcements: announcementsRes.rows
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/classrooms/verify-join-email - Public email verification for joining classroom link
exports.verifyJoinEmail = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { inviteCode, email } = req.body;

    if (!inviteCode || !email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Classroom code and email are required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    await client.query('BEGIN');

    // 1. Find active classroom by invite code
    const classRes = await client.query(
      `SELECT c.id, c.name, c.description, c.invite_code, c.teacher_id
       FROM classrooms c
       WHERE c.invite_code = $1 AND c.status = 'active' FOR UPDATE`,
      [inviteCode]
    );

    if (classRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Invalid or expired classroom link' });
    }

    const classroom = classRes.rows[0];

    // 2. Check if student email is in classroom_invitations OR classroom_members OR existing user
    const inviteRes = await client.query(
      `SELECT * FROM classroom_invitations
       WHERE classroom_id = $1 AND LOWER(student_email) = $2 AND status = 'pending' AND expires_at > NOW()`,
      [classroom.id, cleanEmail]
    );

    const userRes = await client.query(
      `SELECT id, full_name, email, role FROM users WHERE LOWER(email) = $1`,
      [cleanEmail]
    );

    let user = userRes.rows[0];

    // Check if user is already a member
    let isMember = false;
    if (user) {
      const memberRes = await client.query(
        `SELECT id FROM classroom_members WHERE classroom_id = $1 AND student_id = $2 AND status = 'active'`,
        [classroom.id, user.id]
      );
      if (memberRes.rows.length > 0) {
        isMember = true;
      }
    }

    // If neither an active member nor has a valid invitation
    if (!isMember && inviteRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        success: false,
        message: 'This email has not been invited to this classroom yet. Please ask your teacher to send an invitation.'
      });
    }

    // If user does not exist yet (invited candidate who hasn't registered account yet)
    if (!user) {
      // Auto-create a student user record for this invited email
      const defaultPasswordHash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
      const nameFromEmail = cleanEmail.split('@')[0];
      const newUserRes = await client.query(
        `INSERT INTO users (full_name, email, password_hash, role, created_at, updated_at)
         VALUES ($1, $2, $3, 'student', NOW(), NOW())
         RETURNING id, full_name, email, role`,
        [nameFromEmail, cleanEmail, defaultPasswordHash]
      );
      user = newUserRes.rows[0];
    }

    // Enroll in classroom if not already an active member
    if (!isMember) {
      await client.query(
        `INSERT INTO classroom_members (classroom_id, student_id, status, joined_at)
         VALUES ($1, $2, 'active', NOW())
         ON CONFLICT (classroom_id, student_id)
         DO UPDATE SET status = 'active', joined_at = NOW(), removed_at = NULL`,
        [classroom.id, user.id]
      );

      if (inviteRes.rows.length > 0) {
        await client.query(
          `UPDATE classroom_invitations SET status = 'accepted' WHERE id = $1`,
          [inviteRes.rows[0].id]
        );
      }
    }

    await client.query('COMMIT');

    // Generate JWT access & refresh tokens
    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    res.json({
      success: true,
      message: 'Access granted to classroom',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          onboarded: true
        },
        classroom_id: classroom.id,
        classroom_name: classroom.name
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error verifying join email:', err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
};


// POST /api/classrooms/join/:inviteCode - Join classroom (Unified invitation & code flow)
exports.joinClassroom = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { inviteCode } = req.params;
    const { token } = req.query; // Optional invitation token

    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can join classrooms' });
    }

    await client.query('BEGIN');

    // Lock classroom row
    const classRes = await client.query(
      `SELECT c.*, u.subscription_plan
       FROM classrooms c
       JOIN users u ON c.teacher_id = u.id
       WHERE c.invite_code = $1 AND c.status = 'active' FOR UPDATE`,
      [inviteCode]
    );

    if (classRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Classroom not found or archived' });
    }

    const classroom = classRes.rows[0];

    // Check if already an active member
    const existingMember = await client.query(
      `SELECT id FROM classroom_members WHERE classroom_id = $1 AND student_id = $2 AND status = 'active'`,
      [classroom.id, req.user.id]
    );

    if (existingMember.rows.length > 0) {
      await client.query('COMMIT');
      return res.json({
        success: true,
        message: 'You are already a member of this classroom',
        data: { classroom_id: classroom.id }
      });
    }

    // Token verification (If token passed or if student was invited by email)
    const userEmail = req.user.email.toLowerCase();
    let inviteRecord = null;

    if (token) {
      const tokenRes = await client.query(
        `SELECT * FROM classroom_invitations
         WHERE classroom_id = $1 AND token = $2 AND status = 'pending' AND expires_at > NOW()`,
        [classroom.id, token]
      );
      if (tokenRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: 'Invalid or expired invitation token' });
      }
      inviteRecord = tokenRes.rows[0];

      // Email match verification
      if (inviteRecord.student_email.toLowerCase() !== userEmail) {
        await client.query('ROLLBACK');
        return res.status(403).json({
          success: false,
          message: `This invitation was issued for ${inviteRecord.student_email}. Please log in with that account.`
        });
      }
    } else {
      // Check if there is an open invite for this student's email
      const emailInvite = await client.query(
        `SELECT * FROM classroom_invitations
         WHERE classroom_id = $1 AND LOWER(student_email) = $2 AND status = 'pending' AND expires_at > NOW()`,
        [classroom.id, userEmail]
      );
      if (emailInvite.rows.length > 0) {
        inviteRecord = emailInvite.rows[0];
      }
    }

    // Check Seat Capacity Limit
    const effectiveLimit = await getEffectiveSeatLimit(classroom.teacher_id);
    const seats = await getUsedSeats(classroom.id, client);

    // If student is accepting an existing pending invite, total_used already includes this invite!
    // But if student is joining without prior invite, we must verify active_count < limit
    if (!inviteRecord && seats.total_used >= effectiveLimit) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        success: false,
        code: 'CLASSROOM_FULL',
        message: 'This classroom has reached its maximum seat capacity limit.'
      });
    }

    // Add student to classroom members
    await client.query(
      `INSERT INTO classroom_members (classroom_id, student_id, status, joined_at)
       VALUES ($1, $2, 'active', NOW())
       ON CONFLICT (classroom_id, student_id)
       DO UPDATE SET status = 'active', joined_at = NOW(), removed_at = NULL`,
      [classroom.id, req.user.id]
    );

    // Mark invitation accepted if found
    if (inviteRecord) {
      await client.query(
        `UPDATE classroom_invitations SET status = 'accepted' WHERE id = $1`,
        [inviteRecord.id]
      );
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: `Successfully joined ${classroom.name}`,
      data: { classroom_id: classroom.id, classroom_name: classroom.name }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error joining classroom:', err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
};

// ─── CONTENT ASSIGNMENT CONTROLLERS (TEACHER) ───────────────────────────────

// POST /api/classrooms/:id/exams - Assign exams to classroom
exports.assignExams = async (req, res) => {
  try {
    const { id } = req.params;
    const { exam_ids, due_date } = req.body;

    if (!Array.isArray(exam_ids) || exam_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'exam_ids array is required' });
    }

    const classRes = await db.query('SELECT teacher_id FROM classrooms WHERE id = $1', [id]);
    if (classRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Classroom not found' });
    }
    if (req.user.role !== 'admin' && classRes.rows[0].teacher_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not own this classroom' });
    }

    for (const examId of exam_ids) {
      await db.query(
        `INSERT INTO classroom_exams (classroom_id, exam_id, assigned_by, assigned_at, due_date)
         VALUES ($1, $2, $3, NOW(), $4)
         ON CONFLICT (classroom_id, exam_id) DO UPDATE SET due_date = EXCLUDED.due_date`,
        [id, examId, req.user.id, due_date || null]
      );
    }

    res.json({ success: true, message: `Assigned ${exam_ids.length} exam(s) to classroom` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/classrooms/:id/exams/:examId - Unassign exam
exports.unassignExam = async (req, res) => {
  try {
    const { id, examId } = req.params;

    const classRes = await db.query('SELECT teacher_id FROM classrooms WHERE id = $1', [id]);
    if (classRes.rows.length === 0) return res.status(404).json({ success: false, message: 'Classroom not found' });
    if (req.user.role !== 'admin' && classRes.rows[0].teacher_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    await db.query('DELETE FROM classroom_exams WHERE classroom_id = $1 AND exam_id = $2', [id, examId]);
    res.json({ success: true, message: 'Exam unassigned from classroom' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/classrooms/:id/materials - Assign study materials/content
exports.assignMaterials = async (req, res) => {
  try {
    const { id } = req.params;
    const { material_ids } = req.body;

    if (!Array.isArray(material_ids) || material_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'material_ids array is required' });
    }

    const classRes = await db.query('SELECT teacher_id FROM classrooms WHERE id = $1', [id]);
    if (classRes.rows.length === 0) return res.status(404).json({ success: false, message: 'Classroom not found' });
    if (req.user.role !== 'admin' && classRes.rows[0].teacher_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    for (const matId of material_ids) {
      await db.query(
        `INSERT INTO classroom_materials (classroom_id, material_id, assigned_by, assigned_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (classroom_id, material_id) DO NOTHING`,
        [id, matId, req.user.id]
      );
    }

    res.json({ success: true, message: `Assigned ${material_ids.length} material(s) to classroom` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/classrooms/:id/materials/:materialId - Unassign material
exports.unassignMaterial = async (req, res) => {
  try {
    const { id, materialId } = req.params;

    const classRes = await db.query('SELECT teacher_id FROM classrooms WHERE id = $1', [id]);
    if (classRes.rows.length === 0) return res.status(404).json({ success: false, message: 'Classroom not found' });
    if (req.user.role !== 'admin' && classRes.rows[0].teacher_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    await db.query('DELETE FROM classroom_materials WHERE classroom_id = $1 AND material_id = $2', [id, materialId]);
    res.json({ success: true, message: 'Material unassigned from classroom' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/classrooms/:id/assignments - Create custom classroom assignment
exports.createAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, due_date } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Assignment title is required' });
    }

    const classRes = await db.query('SELECT teacher_id FROM classrooms WHERE id = $1', [id]);
    if (classRes.rows.length === 0) return res.status(404).json({ success: false, message: 'Classroom not found' });
    if (req.user.role !== 'admin' && classRes.rows[0].teacher_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const insertRes = await db.query(
      `INSERT INTO classroom_assignments (classroom_id, title, description, due_date, assigned_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING *`,
      [id, title.trim(), description ? description.trim() : null, due_date || null, req.user.id]
    );

    res.status(201).json({ success: true, message: 'Assignment created', data: insertRes.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/classrooms/:id/announcements - Create classroom announcement
exports.createAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const classRes = await db.query('SELECT teacher_id FROM classrooms WHERE id = $1', [id]);
    if (classRes.rows.length === 0) return res.status(404).json({ success: false, message: 'Classroom not found' });
    if (req.user.role !== 'admin' && classRes.rows[0].teacher_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const insertRes = await db.query(
      `INSERT INTO classroom_announcements (classroom_id, author_id, title, content, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [id, req.user.id, title.trim(), content.trim()]
    );

    res.status(201).json({ success: true, message: 'Announcement posted', data: insertRes.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ISOLATED STUDENT ENDPOINTS ─────────────────────────────────────────────

// Helper: Verify student active membership in classroom
async function verifyStudentMember(studentId, classroomId) {
  const memberRes = await db.query(
    `SELECT cm.id, c.name AS classroom_name, c.status AS classroom_status, u.full_name AS teacher_name
     FROM classroom_members cm
     JOIN classrooms c ON cm.classroom_id = c.id
     JOIN users u ON c.teacher_id = u.id
     WHERE cm.classroom_id = $1 AND cm.student_id = $2 AND cm.status = 'active' AND c.status = 'active'`,
    [classroomId, studentId]
  );
  return memberRes.rows[0] || null;
}

// GET /api/student/classrooms - Get joined classrooms for student
exports.getStudentClassrooms = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT c.id, c.name, c.description, c.invite_code, cm.joined_at, u.full_name AS teacher_name
       FROM classroom_members cm
       JOIN classrooms c ON cm.classroom_id = c.id
       JOIN users u ON c.teacher_id = u.id
       WHERE cm.student_id = $1 AND cm.status = 'active' AND c.status = 'active'
       ORDER BY cm.joined_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/student/classrooms/:id - Isolated classroom overview for student
exports.getStudentClassroomDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const membership = await verifyStudentMember(req.user.id, id);
    if (!membership) {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not an active member of this classroom' });
    }

    const classRes = await db.query(
      `SELECT c.id, c.name, c.description, c.invite_code, u.full_name AS teacher_name
       FROM classrooms c
       JOIN users u ON c.teacher_id = u.id
       WHERE c.id = $1`,
      [id]
    );

    res.json({ success: true, data: classRes.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/student/classrooms/:id/exams - Get ONLY assigned exams for classroom
exports.getStudentClassroomExams = async (req, res) => {
  try {
    const { id } = req.params;
    const membership = await verifyStudentMember(req.user.id, id);
    if (!membership) {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not a member of this classroom' });
    }

    const { rows } = await db.query(
      `SELECT ce.id AS assignment_id, ce.assigned_at, ce.due_date, e.*
       FROM classroom_exams ce
       JOIN exams e ON ce.exam_id = e.id
       WHERE ce.classroom_id = $1
       ORDER BY ce.assigned_at DESC`,
      [id]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/student/classrooms/:id/materials - Get ONLY assigned materials for classroom
exports.getStudentClassroomMaterials = async (req, res) => {
  try {
    const { id } = req.params;
    const membership = await verifyStudentMember(req.user.id, id);
    if (!membership) {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not a member of this classroom' });
    }

    const { rows } = await db.query(
      `SELECT cm.id AS assignment_id, cm.assigned_at, cnt.*
       FROM classroom_materials cm
       JOIN content cnt ON cm.material_id = cnt.id
       WHERE cm.classroom_id = $1
       ORDER BY cm.assigned_at DESC`,
      [id]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/student/classrooms/:id/assignments - Get classroom assignments
exports.getStudentClassroomAssignments = async (req, res) => {
  try {
    const { id } = req.params;
    const membership = await verifyStudentMember(req.user.id, id);
    if (!membership) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const { rows } = await db.query(
      `SELECT * FROM classroom_assignments WHERE classroom_id = $1 ORDER BY created_at DESC`,
      [id]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/student/classrooms/:id/announcements - Get classroom announcements
exports.getStudentClassroomAnnouncements = async (req, res) => {
  try {
    const { id } = req.params;
    const membership = await verifyStudentMember(req.user.id, id);
    if (!membership) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const { rows } = await db.query(
      `SELECT ca.*, u.full_name AS author_name
       FROM classroom_announcements ca
       JOIN users u ON ca.author_id = u.id
       WHERE ca.classroom_id = $1
       ORDER BY ca.created_at DESC`,
      [id]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN CLASSROOM SETTINGS CONTROLLERS ────────────────────────────────────

// GET /api/admin/classroom-settings
exports.getAdminClassroomSettings = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT key, value FROM system_settings WHERE key IN ('free_classroom_seat_limit', 'max_classroom_seat_limit')`
    );
    const settings = {
      free_classroom_seat_limit: 10,
      max_classroom_seat_limit: 50
    };
    rows.forEach(r => {
      settings[r.key] = parseInt(r.value, 10) || settings[r.key];
    });

    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/classroom-settings
exports.updateAdminClassroomSettings = async (req, res) => {
  try {
    const { free_classroom_seat_limit, max_classroom_seat_limit } = req.body;

    if (free_classroom_seat_limit !== undefined) {
      const freeVal = Math.max(1, parseInt(free_classroom_seat_limit, 10) || 10);
      await db.query(
        `INSERT INTO system_settings (key, value, updated_at) VALUES ('free_classroom_seat_limit', $1, NOW())
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
        [String(freeVal)]
      );
    }

    if (max_classroom_seat_limit !== undefined) {
      const maxVal = Math.max(1, parseInt(max_classroom_seat_limit, 10) || 50);
      await db.query(
        `INSERT INTO system_settings (key, value, updated_at) VALUES ('max_classroom_seat_limit', $1, NOW())
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
        [String(maxVal)]
      );
    }

    res.json({ success: true, message: 'Classroom settings updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
