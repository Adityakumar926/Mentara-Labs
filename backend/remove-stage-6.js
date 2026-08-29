require('dotenv').config();
const pool = require('./src/config/db');

async function removeStage6() {
  try {
    console.log('[Remove Stage 6] Removing Stage 6 and all associated subjects and topics...');

    // 1. Get Stage 6 class ID
    const stage6Res = await pool.query("SELECT id FROM public.classes WHERE name = 'Stage 6'");
    
    if (stage6Res.rows.length > 0) {
      const stage6Id = stage6Res.rows[0].id;

      // Delete topics under Stage 6 subjects
      const deletedTopics = await pool.query(`
        DELETE FROM public.topics WHERE subject_id IN (
          SELECT id FROM public.subjects WHERE class_id = $1
        )
      `, [stage6Id]);
      console.log(`Deleted ${deletedTopics.rowCount || 0} topics for Stage 6.`);

      // Delete Stage 6 subjects
      const deletedSubjects = await pool.query("DELETE FROM public.subjects WHERE class_id = $1", [stage6Id]);
      console.log(`Deleted ${deletedSubjects.rowCount || 0} subjects for Stage 6.`);

      // Delete Stage 6 class
      await pool.query("DELETE FROM public.classes WHERE id = $1", [stage6Id]);
      console.log('Successfully deleted Stage 6 class record.');
    } else {
      console.log('Stage 6 was not found in the database.');
    }

    console.log('\n✅ [Remove Stage 6 Complete] Stage 6 removed from database!');
  } catch (err) {
    console.error('Error removing Stage 6:', err);
  } finally {
    process.exit(0);
  }
}

removeStage6();
