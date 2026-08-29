require('dotenv').config();
const pool = require('./src/config/db');

async function inspectAnimations() {
  try {
    const { rows: anims } = await pool.query('SELECT id, title, description, subject_id FROM public.animations ORDER BY title');
    console.log(`Found ${anims.length} animations:`);
    anims.forEach((a, i) => {
      console.log(`${i+1}. [${a.id}] "${a.title}" (subject_id: ${a.subject_id})`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

inspectAnimations();
