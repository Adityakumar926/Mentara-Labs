const db = require('../../config/db');

// Get all topics and subtopics under a subject
exports.getAll = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { rows } = await db.query(
      `SELECT t.*, 
              (SELECT COUNT(*) FROM content c WHERE c.topic_id = t.id) AS resource_count
       FROM topics t
       WHERE t.subject_id = $1
       ORDER BY t.parent_topic_id ASC NULLS FIRST, t.order_index ASC, t.created_at ASC`,
      [subjectId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get a single topic
exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT * FROM topics WHERE id = $1', [id]);
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Topic not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create a new topic
exports.create = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { name, description, parent_topic_id, order_index } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

    const { rows } = await db.query(
      `INSERT INTO topics (subject_id, parent_topic_id, name, description, order_index)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [subjectId, parent_topic_id || null, name, description, order_index || 0]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update a topic
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, parent_topic_id, order_index } = req.body;

    const fields = [];
    const values = [];
    let idx = 1;

    if (name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(name);
    }
    if (description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(description);
    }
    if (parent_topic_id !== undefined) {
      fields.push(`parent_topic_id = $${idx++}`);
      values.push(parent_topic_id === '' || parent_topic_id === 'null' || parent_topic_id === null ? null : parent_topic_id);
    }
    if (order_index !== undefined) {
      fields.push(`order_index = $${idx++}`);
      values.push(order_index);
    }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(id);
    const query = `
      UPDATE topics
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${idx}
      RETURNING *
    `;

    const { rows } = await db.query(query, values);
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Topic not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete a topic
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await db.query('DELETE FROM topics WHERE id = $1', [id]);
    if (!rowCount) return res.status(404).json({ success: false, message: 'Topic not found' });
    res.json({ success: true, message: 'Topic deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Reorder topics
exports.reorder = async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { order } = req.body; // Array of { id, order_index }
    await client.query('BEGIN');
    for (const item of order) {
      await client.query(
        'UPDATE topics SET order_index = $1 WHERE id = $2',
        [item.order_index, item.id]
      );
    }
    await client.query('COMMIT');
    res.json({ success: true, message: 'Topics order updated' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
};
