const { pool } = require('../config/db');

class Notification {
  // Insert the same notification for a batch of students in one round trip
  static async createForStudents({ studentIds, examId, type, title, message }) {
    if (!studentIds?.length) return [];

    const values = [];
    const placeholders = studentIds
      .map((studentId, i) => {
        const base = i * 5;
        values.push(studentId, examId, type, title, message);
        return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`;
      })
      .join(', ');

    const { rows } = await pool.query(
      `INSERT INTO notifications (student_id, exam_id, type, title, message)
       VALUES ${placeholders}
       RETURNING *`,
      values
    );
    return rows;
  }

  static async findByStudent(studentId, { limit = 20, offset = 0 } = {}) {
    const { rows } = await pool.query(
      `SELECT * FROM notifications
       WHERE student_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [studentId, limit, offset]
    );
    return rows;
  }

  static async unreadCount(studentId) {
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS count FROM notifications WHERE student_id = $1 AND is_read = false`,
      [studentId]
    );
    return rows[0].count;
  }

  static async markRead(id, studentId) {
    const { rows } = await pool.query(
      `UPDATE notifications SET is_read = true
       WHERE id = $1 AND student_id = $2
       RETURNING *`,
      [id, studentId]
    );
    return rows[0];
  }

  static async markAllRead(studentId) {
    await pool.query(
      `UPDATE notifications SET is_read = true WHERE student_id = $1 AND is_read = false`,
      [studentId]
    );
  }

  // Who should hear about this exam: students enrolled in its batch, or
  // every student if the exam isn't tied to a batch.
  static async getTargetStudentIds(examId) {
    const { rows } = await pool.query(`SELECT batch_id FROM exams WHERE id = $1`, [examId]);
    const batchId = rows[0]?.batch_id;

    if (batchId) {
      const { rows: enrolled } = await pool.query(
        `SELECT student_id FROM batch_students WHERE batch_id = $1`,
        [batchId]
      );
      return enrolled.map((r) => r.student_id);
    }

    const { rows: all } = await pool.query(`SELECT id FROM users WHERE role = 'student'`);
    return all.map((r) => r.id);
  }
}

module.exports = Notification;