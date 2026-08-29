require('dotenv').config();
const pool = require('./src/config/db');
const cloudinary = require('./src/config/cloudinary');

function sanitizePathSegment(segment) {
  if (!segment) return 'General';
  return segment
    .trim()
    .replace(/[\/\?\<\>\\:\*\|"']/g, '-')
    .replace(/\s+/g, ' ');
}

async function precreateCloudinaryFolders() {
  try {
    console.log('[Cloudinary Folder Generator] Fetching active curriculum database hierarchy (Stages 1-5)...');

    const { rows: topics } = await pool.query(`
      SELECT 
        c.name AS curriculum_name,
        cl.name AS class_name,
        s.name AS subject_name,
        p_t.name AS strand_name,
        t.name AS sub_strand_name,
        t.parent_topic_id
      FROM topics t
      LEFT JOIN topics p_t ON t.parent_topic_id = p_t.id
      JOIN subjects s ON t.subject_id = s.id
      JOIN classes cl ON s.class_id = cl.id
      JOIN curriculums c ON cl.curriculum_id = c.id
      ORDER BY cl.order_index, s.order_index, COALESCE(p_t.order_index, t.order_index), t.order_index
    `);

    console.log(`Retrieved ${topics.length} topic nodes from database.`);

    const contentTypes = ['notes', 'worksheets', 'videos', 'questions'];
    const createdFolders = new Set();

    for (const row of topics) {
      const curriculum = sanitizePathSegment(row.curriculum_name || 'Cambridge Primary');
      const stage = sanitizePathSegment(row.class_name);
      const subject = sanitizePathSegment(row.subject_name);
      const strand = sanitizePathSegment(row.parent_topic_id ? row.strand_name : row.sub_strand_name);
      const subStrand = sanitizePathSegment(row.parent_topic_id ? row.sub_strand_name : 'General');

      for (const cType of contentTypes) {
        // Standard Student / Shared Path
        const studentPath = `${curriculum}/${stage}/${subject}/${strand}/${subStrand}/${cType}`;
        createdFolders.add(studentPath);

        // Teacher Zone Path
        const teacherPath = `Teacher Zone/${curriculum}/${stage}/${subject}/${strand}/${subStrand}/${cType}`;
        createdFolders.add(teacherPath);
      }
    }

    console.log(`\nGenerated ${createdFolders.size} unique Cloudinary folder paths to create.`);
    console.log('Sending requests to Cloudinary API...');

    let count = 0;
    const folderArray = Array.from(createdFolders);
    const BATCH_SIZE = 10;

    for (let i = 0; i < folderArray.length; i += BATCH_SIZE) {
      const batch = folderArray.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(async (folderPath) => {
          try {
            await cloudinary.api.create_folder(folderPath);
          } catch (_) {}
        })
      );
      count += batch.length;
      if (count % 100 === 0 || count >= folderArray.length) {
        console.log(`Created ${Math.min(count, folderArray.length)}/${folderArray.length} folders...`);
      }
    }

    console.log('\n✅ [Cloudinary Folder Generator Complete] Pre-created clean folder structure in Cloudinary!');
    console.log('You can now see the structured Curriculum & Teacher Zone folder trees in your Cloudinary Media Library!');
  } catch (err) {
    console.error('Error pre-creating Cloudinary folders:', err);
  } finally {
    process.exit(0);
  }
}

precreateCloudinaryFolders();
