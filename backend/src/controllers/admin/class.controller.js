const db = require('../../config/db');

// Get all classes under a curriculum
exports.getAll = async (req, res) => {
  try {
    const { curriculumId } = req.params;
    const { rows } = await db.query(
      `SELECT c.*, 
              COUNT(s.id) AS subject_count
       FROM classes c
       LEFT JOIN subjects s ON s.class_id = c.id
       WHERE c.curriculum_id = $1
       GROUP BY c.id
       ORDER BY c.order_index ASC, c.created_at DESC`,
      [curriculumId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get a single class
exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT * FROM classes WHERE id = $1', [id]);
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Class not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create a new class under a curriculum
exports.create = async (req, res) => {
  try {
    const { curriculumId } = req.params;
    const { name, description, order_index } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

    const { rows } = await db.query(
      `INSERT INTO classes (curriculum_id, name, description, order_index)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [curriculumId, name, description, order_index || 0]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update an existing class
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, order_index } = req.body;

    const { rows } = await db.query(
      `UPDATE classes
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           order_index = COALESCE($3, order_index),
           updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [name, description, order_index, id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Class not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete a class
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await db.query('DELETE FROM classes WHERE id = $1', [id]);
    if (!rowCount) return res.status(404).json({ success: false, message: 'Class not found' });
    res.json({ success: true, message: 'Class deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
