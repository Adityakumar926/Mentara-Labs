const { pool } = require('../config/db');

// Animations are single-page HTML/CSS/JS files stored as text in Postgres.
// No file storage (B2/Cloudinary) needed — the entire html_content is a DB column.

class Animation {
  static async create({ title, description, html_content, subject_id, created_by }) {
    const { rows } = await pool.query(
      `INSERT INTO animations
         (title, description, html_content, subject_id, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, description, html_content, subject_id, created_by]
    );
    return rows[0];
  }

  static async findAll({ subject_id } = {}) {
    const conditions = [];
    const params     = [];

    if (subject_id) {
      params.push(subject_id);
      conditions.push(`a.subject_id = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await pool.query(
      `SELECT
         a.id, a.title, a.description,
         a.subject_id, a.is_premium, a.is_starred,
         a.created_by, a.created_at, a.updated_at,
         u.full_name AS created_by_name
       FROM animations a
       LEFT JOIN users u ON u.id = a.created_by
       ${where}
       ORDER BY a.created_at DESC`,
      params
    );
    return rows;
  }

  static async findById(id) {
    const { rows } = await pool.query(
      `SELECT
         a.*,
         u.full_name AS created_by_name
       FROM animations a
       LEFT JOIN users u ON u.id = a.created_by
       WHERE a.id = $1`,
      [id]
    );
    return rows[0];
  }

  static async update(id, { title, description, html_content, subject_id }) {
    const { rows } = await pool.query(
      `UPDATE animations
       SET title        = COALESCE($1, title),
           description  = COALESCE($2, description),
           html_content = COALESCE($3, html_content),
           subject_id   = COALESCE($4, subject_id),
           updated_at   = NOW()
       WHERE id = $5
       RETURNING *`,
      [title, description, html_content, subject_id, id]
    );
    return rows[0];
  }

  static async delete(id) {
    const { rows } = await pool.query(
      `DELETE FROM animations WHERE id = $1 RETURNING id`,
      [id]
    );
    return rows[0];
  }

  static async toggleStar(id) {
    const { rows } = await pool.query(
      `UPDATE animations
       SET is_starred = NOT is_starred, updated_at = NOW()
       WHERE id = $1
       RETURNING id, is_starred`,
      [id]
    );
    return rows[0];
  }

  static async togglePremium(id) {
    const { rows } = await pool.query(
      `UPDATE animations
       SET is_premium = NOT is_premium, updated_at = NOW()
       WHERE id = $1
       RETURNING id, is_premium`,
      [id]
    );
    return rows[0];
  }
}

module.exports = Animation;