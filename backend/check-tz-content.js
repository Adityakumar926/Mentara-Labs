require('dotenv').config();
const pool = require('./src/config/db');

async function checkTZ() {
  try {
    const { rows: classes } = await pool.query("SELECT * FROM classes WHERE LOWER(name) LIKE '%teacher%' OR LOWER(name) LIKE '%zone%'");
    console.log('Teacher Zone classes:', classes);

    if (classes.length > 0) {
      const classId = classes[0].id;
      const { rows: subjects } = await pool.query("SELECT id, name FROM subjects WHERE class_id = $1", [classId]);
      console.log(`Teacher Zone subjects (${subjects.length}):`, subjects.map(s => s.name));

      const { rows: topics } = await pool.query(
        "SELECT t.id, t.name, s.name as subject_name FROM topics t JOIN subjects s ON s.id = t.subject_id WHERE s.class_id = $1",
        [classId]
      );
      console.log(`Teacher Zone topics (${topics.length}):`, topics.map(t => `${t.subject_name} -> ${t.name}`));

      const { rows: contents } = await pool.query(
        "SELECT c.* FROM content c JOIN topics t ON t.id = c.topic_id JOIN subjects s ON s.id = t.subject_id WHERE s.class_id = $1",
        [classId]
      );
      console.log(`Teacher Zone contents (${contents.length}):`, contents);
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

checkTZ();
