const db = require('../../config/db');

// ─── ANIMATIONS ──────────────────────────────────────────────────────────────

exports.getAll = async (req, res) => {
  try {
    const {
      subject_id, is_premium, is_starred,
      search, page = 1, limit = 20
    } = req.query;
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (subject_id)  { params.push(subject_id);           conditions.push(`a.subject_id = $${params.length}`); }
    if (is_premium)  { params.push(is_premium === 'true'); conditions.push(`a.is_premium = $${params.length}`); }
    if (is_starred)  { params.push(is_starred === 'true'); conditions.push(`a.is_starred = $${params.length}`); }
    if (search)      { params.push(`%${search}%`);         conditions.push(`a.title ILIKE $${params.length}`); }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    params.push(limit, offset);

    const { rows } = await db.query(
      `SELECT
         a.*,
         s.name AS subject_name,
         u.full_name AS created_by_name
       FROM animations a
       LEFT JOIN subjects s ON s.id = a.subject_id
       LEFT JOIN users    u ON u.id = a.created_by
       ${where}
       ORDER BY a.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const { rows: countRows } = await db.query(
      `SELECT COUNT(*) FROM animations a ${where}`,
      params.slice(0, -2)
    );

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: parseInt(countRows[0].count),
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(countRows[0].count / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT a.*, s.name AS subject_name
       FROM animations a
       LEFT JOIN subjects s ON s.id = a.subject_id
       WHERE a.id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Animation not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, description, html_content, thumbnail_url, subject_id, is_premium } = req.body;

    if (!title || !html_content)
      return res.status(400).json({ success: false, message: 'title and html_content are required' });

    sanitizeHtml(html_content, res);

    const { rows } = await db.query(
      `INSERT INTO animations
       (title, description, html_content, thumbnail_url, subject_id, is_premium, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [title, description, html_content, thumbnail_url, subject_id, is_premium ?? false, req.user.id]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { title, description, html_content, thumbnail_url, subject_id, is_premium } = req.body;

    const { rows } = await db.query(
      `UPDATE animations SET
         title         = COALESCE($1, title),
         description   = COALESCE($2, description),
         html_content  = COALESCE($3, html_content),
         thumbnail_url = COALESCE($4, thumbnail_url),
         subject_id    = COALESCE($5, subject_id),
         is_premium    = COALESCE($6, is_premium)
       WHERE id = $7 RETURNING *`,
      [title, description, html_content, thumbnail_url, subject_id, is_premium, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Animation not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await db.query(`DELETE FROM content WHERE animation_id = $1`, [req.params.id]);
    const { rowCount } = await db.query(`DELETE FROM animations WHERE id = $1`, [req.params.id]);
    if (!rowCount) return res.status(404).json({ success: false, message: 'Animation not found' });
    res.json({ success: true, message: 'Animation deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleStar = async (req, res) => {
  try {
    const { rows } = await db.query(
      `UPDATE animations SET is_starred = NOT is_starred
       WHERE id = $1 RETURNING id, is_starred`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Animation not found' });
    res.json({ success: true, is_starred: rows[0].is_starred });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.togglePremium = async (req, res) => {
  try {
    const { rows } = await db.query(
      `UPDATE animations SET is_premium = NOT is_premium
       WHERE id = $1 RETURNING id, is_premium`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Animation not found' });
    res.json({ success: true, is_premium: rows[0].is_premium });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Preview: returns just the html_content for iframe rendering
exports.preview = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT html_content, is_premium FROM animations WHERE id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Animation not found' });
    res.json({ success: true, data: { html_content: rows[0].html_content, is_premium: rows[0].is_premium } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── UPSERT (used by inline editor in CurriculumDetail) ──────────────────────
// If animation_id is provided → update that record's html_content + title.
// If no animation_id → create a new animation record.
// Returns the animation row so the frontend can grab its id.
exports.upsert = async (req, res) => {
  try {
    const { title, html_content, subject_id, animation_id, is_premium } = req.body;

    if (!title || !html_content)
      return res.status(400).json({ success: false, message: 'title and html_content are required' });

    if (sanitizeHtml(html_content, res)) return; // sanitizeHtml writes the error response and returns true

    let row;

    if (animation_id) {
      // Update existing animation
      const { rows } = await db.query(
        `UPDATE animations SET
           title        = $1,
           html_content = $2,
           is_premium   = COALESCE($3, is_premium),
           subject_id   = COALESCE($4, subject_id)
         WHERE id = $5
         RETURNING *`,
        [title, html_content, is_premium ?? null, subject_id ?? null, animation_id]
      );
      if (!rows[0]) return res.status(404).json({ success: false, message: 'Animation not found' });
      row = rows[0];
    } else {
      // Create new animation
      const { rows } = await db.query(
        `INSERT INTO animations
         (title, html_content, subject_id, is_premium, created_by)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [title, html_content, subject_id ?? null, is_premium ?? false, req.user.id]
      );
      row = rows[0];
    }

    res.status(animation_id ? 200 : 201).json({ success: true, data: row });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Shared helper ────────────────────────────────────────────────────────────
// Returns true (and writes response) if content is flagged; false if clean.
function sanitizeHtml(html_content, res) {
  const forbidden = ['eval(', 'document.cookie', 'window.location'];
  for (const pattern of forbidden) {
    if (html_content.includes(pattern)) {
      res.status(400).json({
        success: false,
        message: `Potentially unsafe content detected: "${pattern}"`
      });
      return true;
    }
  }
  return false;
}