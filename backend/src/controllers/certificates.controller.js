const db = require('../config/db');

// ─── STUDENT: GET MY CERTIFICATES ─────────────────────────────────────────────
exports.getMyCertificates = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { rows } = await db.query(
      `SELECT c.*, e.title AS exam_name
       FROM public.certificates c
       JOIN public.exams e ON e.id = c.exam_id
       WHERE c.student_id = $1
       ORDER BY c.issue_date DESC`,
      [studentId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── STUDENT: GET SINGLE CERTIFICATE ──────────────────────────────────────────
exports.getCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isSysAdmin = req.user.role === 'admin';

    const { rows } = await db.query(
      `SELECT c.*, e.title AS exam_name
       FROM public.certificates c
       JOIN public.exams e ON e.id = c.exam_id
       WHERE c.id = $1`,
      [id]
    );

    if (!rows[0]) {
      return res.status(404).json({ success: false, message: 'Certificate not found.' });
    }

    const cert = rows[0];

    // Security: Only owner student or admin can access
    if (cert.student_id !== userId && !isSysAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, data: cert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUBLIC: VERIFY CERTIFICATE ────────────────────────────────────────────────
exports.verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const { rows } = await db.query(
      `SELECT c.certificate_id, c.student_name, c.exam_name, c.issue_date
       FROM public.certificates c
       WHERE c.certificate_id = $1`,
      [certificateId]
    );

    if (!rows[0]) {
      return res.status(404).json({ success: false, message: 'Certificate not found.' });
    }

    res.json({
      success: true,
      status: 'Verified',
      data: rows[0]
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN: GET ALL CERTIFICATES ───────────────────────────────────────────────
exports.getAdminCertificates = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, parseInt(limit, 10) || 20);
    const offset = (parsedPage - 1) * parsedLimit;

    const querySearch = `%${search}%`;

    const { rows: certs } = await db.query(
      `SELECT c.*, u.email AS student_email
       FROM public.certificates c
       JOIN public.users u ON u.id = c.student_id
       WHERE c.student_name ILIKE $1 
          OR c.exam_name ILIKE $1 
          OR c.certificate_id ILIKE $1
       ORDER BY c.issue_date DESC
       LIMIT $2 OFFSET $3`,
      [querySearch, parsedLimit, offset]
    );

    const { rows: countRows } = await db.query(
      `SELECT COUNT(*) AS total
       FROM public.certificates c
       WHERE c.student_name ILIKE $1 
          OR c.exam_name ILIKE $1 
          OR c.certificate_id ILIKE $1`,
      [querySearch]
    );

    const total = parseInt(countRows[0]?.total || 0, 10);

    res.json({
      success: true,
      data: certs,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        pages: Math.ceil(total / parsedLimit)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
