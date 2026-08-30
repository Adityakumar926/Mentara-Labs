require('dotenv').config();
const db = require('./src/config/db');

async function removeAnimations() {
  try {
    console.log('Removing animation and simulation content from database...');
    
    const resContent = await db.query(
      "DELETE FROM content WHERE content_type IN ('animation', 'simulation')"
    );
    console.log(`Deleted ${resContent.rowCount} rows from content table.`);

    try {
      const resAnim = await db.query("TRUNCATE TABLE animations CASCADE");
      console.log('Truncated animations table.');
    } catch (err) {
      console.log('Notice regarding animations table:', err.message);
    }

    console.log('Successfully cleaned up all animation & simulation content.');
    process.exit(0);
  } catch (err) {
    console.error('Error removing animations:', err);
    process.exit(1);
  }
}

removeAnimations();
