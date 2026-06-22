const { pool } = require('../config/db');

class User {
  // Create a new user
  static async create({ name, email, password, role = 'student' }) {
    const query = `
      INSERT INTO users (name, email, password, role) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id, name, email, role, created_at;
    `;
    // We use parameterized queries ($1, $2) to prevent SQL injection!
    const values = [name, email, password, role];
    
    const result = await pool.query(query, values);
    return result.rows[0]; // Return the newly created user (excluding password)
  }

  // Find a user by their email (useful for Login)
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0]; // Returns undefined if no user is found
  }

  // Find a user by ID
  static async findById(id) {
    const query = 'SELECT id, name, email, role, created_at FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = User;