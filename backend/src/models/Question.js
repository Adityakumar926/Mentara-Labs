// models/Question.js
const { pool } = require('../config/db');

class Question {
  // Add a new question to an exam
  static async create({ exam_id, question_text, options, correct_answer, marks }) {
    const query = `
      INSERT INTO questions (exam_id, question_text, options, correct_answer, marks) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *;
    `;
    
    // Convert the JavaScript array of options into a JSON string for PostgreSQL
    const optionsJson = JSON.stringify(options);
    const values = [exam_id, question_text, optionsJson, correct_answer, marks];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Fetch all questions for a specific exam
  static async findByExamId(examId) {
    const query = 'SELECT * FROM questions WHERE exam_id = $1 ORDER BY created_at ASC';
    const result = await pool.query(query, [examId]);
    return result.rows;
  }
}

module.exports = Question;