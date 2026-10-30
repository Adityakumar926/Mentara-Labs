const db = require('../config/db');

let tableEnsured = false;
async function ensureTable() {
  if (tableEnsured) return;
  await db.query(`
    CREATE TABLE IF NOT EXISTS assessments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      stage INTEGER DEFAULT 3,
      results JSONB NOT NULL,
      is_partial BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
  tableEnsured = true;
}

/**
 * Submit completed or partial 8-mission assessment
 */
exports.submitAssessment = async (req, res) => {
  try {
    await ensureTable();
    const userId = req.user.id;
    const { stage, results, answers, report, childName, ageBand, isPartial = false } = req.body;
    const finalResults = results || { childName, ageBand, answers, report };

    if (!finalResults || typeof finalResults !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid assessment results payload'
      });
    }

    const query = `
      INSERT INTO assessments (user_id, stage, results, is_partial, completed_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, user_id, stage, results, is_partial, created_at, completed_at;
    `;

    const values = [userId, stage || 3, JSON.stringify(finalResults), isPartial];
    const { rows } = await db.query(query, values);

    return res.status(201).json({
      success: true,
      data: rows[0],
      message: 'Assessment results saved successfully'
    });
  } catch (error) {
    console.error('Submit assessment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error saving assessment results'
    });
  }
};

/**
 * Retrieve user's completed assessments
 */
exports.getMyResults = async (req, res) => {
  try {
    await ensureTable();
    const userId = req.user.id;
    const query = `
      SELECT * FROM assessments 
      WHERE user_id = $1 
      ORDER BY completed_at DESC 
      LIMIT 10;
    `;
    const { rows } = await db.query(query, [userId]);

    return res.json({
      success: true,
      data: rows,
      message: 'Assessments retrieved successfully'
    });
  } catch (error) {
    console.error('Get my results error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving assessment records'
    });
  }
};

/**
 * Teacher review endpoint
 */
exports.getClassResults = async (req, res) => {
  try {
    await ensureTable();
    const { classId } = req.params;
    const query = `
      SELECT a.*, u.full_name, u.email 
      FROM assessments a
      JOIN users u ON a.user_id = u.id
      WHERE u.class_id = $1
      ORDER BY a.completed_at DESC;
    `;
    const { rows } = await db.query(query, [classId]);

    return res.json({
      success: true,
      data: rows,
      message: 'Classroom assessments retrieved successfully'
    });
  } catch (error) {
    console.error('Class results error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving classroom records'
    });
  }
};
