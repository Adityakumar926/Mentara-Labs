require('dotenv').config();
const pool = require('./src/config/db');

async function checkAnimationMappings() {
  try {
    console.log('[Diagnostic] Checking animations and content table records...');

    const { rows: anims } = await pool.query('SELECT id, title, subject_id FROM public.animations');
    console.log(`Total animations in public.animations: ${anims.length}`);

    const { rows: contentAnims } = await pool.query("SELECT id, title, topic_id, animation_id FROM public.content WHERE content_type = 'animation'");
    console.log(`Total animation rows in public.content: ${contentAnims.length}`);

    const { rows: orphanedAnims } = await pool.query(
      "SELECT id, title, subject_id FROM public.animations WHERE subject_id IS NULL OR subject_id NOT IN (SELECT id FROM public.subjects)"
    );
    console.log(`Animations with missing/unlinked subject_id: ${orphanedAnims.length}`);

  } catch (err) {
    console.error('Error running diagnostic:', err);
  } finally {
    process.exit(0);
  }
}

checkAnimationMappings();
