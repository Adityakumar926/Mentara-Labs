require('dotenv').config();
const pool = require('./src/config/db');

const SAMPLE_GLOBAL_PERSPECTIVES_TOPICS = [
  {
    name: '🌍 Belonging & Being Human',
    description: 'Exploring family, school communities, cultural diversity, and global identity.'
  },
  {
    name: '💧 Water & The Environment',
    description: 'Understanding nature, clean water access, recycling, and caring for our planet.'
  },
  {
    name: '🤝 Collaboration & Teamwork',
    description: 'Developing team problem-solving skills to address community challenges.'
  },
  {
    name: '🗣️ Global Communication & Opinions',
    description: 'Sharing viewpoints, active listening, and presenting ideas respectfully.'
  }
];

async function seedGlobalPerspectives() {
  try {
    console.log('[DB Seed] Seeding Global Perspectives into Database...');
    const classesRes = await pool.query('SELECT * FROM classes ORDER BY name ASC');
    const classes = classesRes.rows;

    for (const cls of classes) {
      // Check if Global Perspectives subject already exists for this class
      const existingSubj = await pool.query(
        "SELECT * FROM subjects WHERE class_id = $1 AND (LOWER(name) LIKE '%global%' OR LOWER(name) LIKE '%perspective%')",
        [cls.id]
      );

      let subjectId;
      if (existingSubj.rows.length > 0) {
        subjectId = existingSubj.rows[0].id;
        console.log(`Global Perspectives already exists for ${cls.name}: ${subjectId}`);
      } else {
        const insertRes = await pool.query(
          `INSERT INTO subjects (class_id, name, description, order_index)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [
            cls.id,
            'Global Perspectives',
            'Develop global awareness, critical thinking, research skills, and collaborative problem-solving across world topics.',
            3
          ]
        );
        subjectId = insertRes.rows[0].id;
        console.log(`Created Global Perspectives for ${cls.name}: ${subjectId}`);
      }

      // Check existing topics
      const existingTopics = await pool.query(
        'SELECT * FROM topics WHERE subject_id = $1',
        [subjectId]
      );

      if (existingTopics.rows.length === 0) {
        for (let i = 0; i < SAMPLE_GLOBAL_PERSPECTIVES_TOPICS.length; i++) {
          const t = SAMPLE_GLOBAL_PERSPECTIVES_TOPICS[i];
          await pool.query(
            `INSERT INTO topics (subject_id, name, description, order_index)
             VALUES ($1, $2, $3, $4)`,
            [subjectId, t.name, t.description, i]
          );
        }
        console.log(`Added ${SAMPLE_GLOBAL_PERSPECTIVES_TOPICS.length} topics for ${cls.name} Global Perspectives.`);
      } else {
        console.log(`${cls.name} Global Perspectives already has ${existingTopics.rows.length} topics.`);
      }
    }

    console.log('[DB Seed] Finished seeding Global Perspectives successfully!');
  } catch (err) {
    console.error('Error seeding Global Perspectives:', err);
  } finally {
    process.exit(0);
  }
}

seedGlobalPerspectives();
