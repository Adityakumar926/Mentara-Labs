require('dotenv').config();
const db = require('./src/config/db');

async function setupTriggers() {
  try {
    console.log('Creating sync function for animations...');
    await db.query(`
      CREATE OR REPLACE FUNCTION sync_animation_target_tab()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.html_content ILIKE '%target_tab=notes%' OR NEW.html_content ILIKE '%target_tab:notes%' OR NEW.html_content ILIKE '%study_adventure%' THEN
          NEW.target_tab := 'notes';
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await db.query(`
      DROP TRIGGER IF EXISTS trg_sync_animation_target_tab ON animations;
      CREATE TRIGGER trg_sync_animation_target_tab
      BEFORE INSERT OR UPDATE ON animations
      FOR EACH ROW
      EXECUTE FUNCTION sync_animation_target_tab();
    `);
    console.log('Animation trigger created successfully.');

    console.log('Creating sync function for content...');
    await db.query(`
      CREATE OR REPLACE FUNCTION sync_content_target_tab()
      RETURNS TRIGGER AS $$
      DECLARE
        anim_tab VARCHAR(50);
        anim_html TEXT;
      BEGIN
        IF NEW.animation_id IS NOT NULL THEN
          SELECT target_tab, html_content INTO anim_tab, anim_html FROM animations WHERE id = NEW.animation_id;
          IF anim_tab = 'notes' OR anim_html ILIKE '%target_tab=notes%' OR anim_html ILIKE '%target_tab:notes%' OR anim_html ILIKE '%study_adventure%' THEN
            NEW.target_tab := 'notes';
          END IF;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await db.query(`
      DROP TRIGGER IF EXISTS trg_sync_content_target_tab ON content;
      CREATE TRIGGER trg_sync_content_target_tab
      BEFORE INSERT OR UPDATE ON content
      FOR EACH ROW
      EXECUTE FUNCTION sync_content_target_tab();
    `);
    console.log('Content trigger created successfully.');

    // Also update existing rows if their html_content has target_tab=notes or if the linked animation has notes
    console.log('Syncing existing rows...');
    await db.query(`
      UPDATE animations
      SET target_tab = 'notes'
      WHERE html_content ILIKE '%target_tab=notes%'
         OR html_content ILIKE '%target_tab:notes%'
         OR html_content ILIKE '%study_adventure%';
    `);

    await db.query(`
      UPDATE content c
      SET target_tab = 'notes'
      FROM animations a
      WHERE c.animation_id = a.id
        AND (a.target_tab = 'notes' OR a.html_content ILIKE '%target_tab=notes%' OR a.html_content ILIKE '%target_tab:notes%');
    `);

    console.log('Database triggers and backfill complete!');
  } catch (err) {
    console.error('Trigger error:', err);
  } finally {
    process.exit();
  }
}

setupTriggers();
