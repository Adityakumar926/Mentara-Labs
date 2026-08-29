require('dotenv').config();
const pool = require('./src/config/db');

async function relinkTeacherAnimations() {
  try {
    console.log('[Relink Animations] Relinking Teacher Zone 3D simulations to active Blueprint subjects & topics...');

    // 1. Fetch all active subjects and their root/sub-topics for Stages 1 to 5
    const { rows: topics } = await pool.query(`
      SELECT 
        t.id AS topic_id,
        t.name AS topic_name,
        s.id AS subject_id,
        s.name AS subject_name,
        cl.name AS class_name
      FROM topics t
      JOIN subjects s ON t.subject_id = s.id
      JOIN classes cl ON s.class_id = cl.id
      ORDER BY cl.order_index, s.order_index, t.order_index
    `);

    // Helper map to find matching topic ID for an animation title
    function findBestTopic(animTitle) {
      const lower = animTitle.toLowerCase();
      
      // Science
      if (lower.includes('earth') || lower.includes('space')) {
        return topics.find(t => t.subject_name === 'Science' && t.topic_name.toLowerCase().includes('space')) ||
               topics.find(t => t.subject_name === 'Science');
      }
      if (lower.includes('force') || lower.includes('physics')) {
        return topics.find(t => t.subject_name === 'Science' && t.topic_name.toLowerCase().includes('force')) ||
               topics.find(t => t.subject_name === 'Science');
      }
      if (lower.includes('living') || lower.includes('biology')) {
        return topics.find(t => t.subject_name === 'Science' && t.topic_name.toLowerCase().includes('life')) ||
               topics.find(t => t.subject_name === 'Science');
      }
      if (lower.includes('material') || lower.includes('chemistry')) {
        return topics.find(t => t.subject_name === 'Science' && t.topic_name.toLowerCase().includes('material')) ||
               topics.find(t => t.subject_name === 'Science');
      }

      // English
      if (lower.includes('grammar')) {
        return topics.find(t => t.subject_name === 'English' && t.topic_name.toLowerCase().includes('grammar')) ||
               topics.find(t => t.subject_name === 'English');
      }
      if (lower.includes('read')) {
        return topics.find(t => t.subject_name === 'English' && t.topic_name.toLowerCase().includes('reading')) ||
               topics.find(t => t.subject_name === 'English');
      }
      if (lower.includes('writ')) {
        return topics.find(t => t.subject_name === 'English' && t.topic_name.toLowerCase().includes('writing')) ||
               topics.find(t => t.subject_name === 'English');
      }
      if (lower.includes('speak') || lower.includes('talk') || lower.includes('vocab') || lower.includes('word') || lower.includes('communicat')) {
        return topics.find(t => t.subject_name === 'English' && (t.topic_name.toLowerCase().includes('speaking') || t.topic_name.toLowerCase().includes('vocabulary'))) ||
               topics.find(t => t.subject_name === 'English');
      }

      // Mathematics
      if (lower.includes('number') || lower.includes('sim') || lower.includes('time')) {
        return topics.find(t => t.subject_name === 'Mathematics') || topics[0];
      }

      return topics.find(t => t.subject_name === 'Science') || topics[0];
    }

    const { rows: anims } = await pool.query('SELECT id, title FROM public.animations');
    console.log(`Processing ${anims.length} animations...`);

    let updatedCount = 0;
    let contentCreatedCount = 0;

    for (const anim of anims) {
      const matched = findBestTopic(anim.title);
      if (matched) {
        // Update animation subject_id
        await pool.query('UPDATE public.animations SET subject_id = $1 WHERE id = $2', [matched.subject_id, anim.id]);
        updatedCount++;

        // Check if content row already exists for this animation
        const { rows: existingContent } = await pool.query(
          "SELECT id FROM public.content WHERE animation_id = $1 AND topic_id = $2",
          [anim.id, matched.topic_id]
        );

        if (existingContent.length === 0) {
          const { rows: orderRows } = await pool.query(
            "SELECT COALESCE(MAX(order_index), -1) + 1 AS next_order FROM content WHERE topic_id = $1",
            [matched.topic_id]
          );

          await pool.query(
            `INSERT INTO content
               (topic_id, title, content_type, animation_id, is_premium, order_index, destination)
             VALUES ($1, $2, 'animation', $3, false, $4, 'teacher')`,
            [matched.topic_id, anim.title, anim.id, orderRows[0].next_order]
          );
          contentCreatedCount++;
        }
      }
    }

    console.log(`\n✅ Updated ${updatedCount} animation subject links.`);
    console.log(`✅ Created ${contentCreatedCount} new content records for Teacher Zone!`);
    console.log('Teacher Zone interactive 3D simulations are now fully linked and viewable!');

  } catch (err) {
    console.error('Error relinking animations:', err);
  } finally {
    process.exit(0);
  }
}

relinkTeacherAnimations();
