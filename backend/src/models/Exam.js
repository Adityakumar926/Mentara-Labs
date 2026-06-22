const { pool } = require('../config/db');

class Exam {
  // Create a new exam
  static async create({ title, description, teacher_id, duration_minutes }) {
    const query = `
      INSERT INTO exams (title, description, teacher_id, duration_minutes) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *;
    `;
    const values = [title, description, teacher_id, duration_minutes];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Get all exams
  static async findAll() {
    const query = 'SELECT * FROM exams ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  // Get exams created by a specific teacher
  static async findByTeacher(teacher_id) {
    const query = 'SELECT * FROM exams WHERE teacher_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [teacher_id]);
    return result.rows;
  }
}

module.exports = Exam;