require('dotenv').config();
const pool = require('./src/config/db');

async function inspectTopics() {
  try {
    const { rows: topics } = await pool.query(`
      SELECT 
        t.id, t.name, t.parent_topic_id, t.order_index,
        s.name AS subject_name,
        cl.name AS class_name
      FROM topics t
      JOIN subjects s ON s.id = t.subject_id
      JOIN classes cl ON cl.id = s.class_id
      WHERE cl.name = 'Stage 1'
      ORDER BY s.order_index, t.parent_topic_id ASC NULLS FIRST, t.order_index ASC
    `);

    console.log(`Found ${topics.length} topics in Stage 1:`);
    topics.forEach((t) => {
      console.log(`[${t.class_name} | ${t.subject_name}] ${t.parent_topic_id ? '  └─ Subtopic:' : 'Strand (Root):'} "${t.name}" (ID: ${t.id}, Parent: ${t.parent_topic_id})`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

inspectTopics();
