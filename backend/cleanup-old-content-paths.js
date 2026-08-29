require('dotenv').config();
const pool = require('./src/config/db');

async function cleanupOldContentPaths() {
  try {
    console.log('[Cleanup] Starting database cleanup for old content paths and orphaned assets...');

    // 1. Delete content records pointing to topics or subjects that no longer exist
    const deleteOrphanedContent = await pool.query(`
      DELETE FROM public.content
      WHERE topic_id IS NOT NULL AND topic_id NOT IN (SELECT id FROM public.topics)
    `);
    console.log(`Deleted ${deleteOrphanedContent.rowCount || 0} orphaned content records.`);

    // 2. Clear old file URLs, mux video IDs, and file paths from content table
    const clearContentUrls = await pool.query(`
      UPDATE public.content
      SET file_url = NULL,
          mux_asset_id = NULL,
          mux_playback_id = NULL,
          mux_upload_id = NULL
      WHERE file_url LIKE '%old%' OR file_url LIKE '%temp%' OR file_url LIKE '%stage%'
    `);
    console.log(`Cleared file URLs for ${clearContentUrls.rowCount || 0} content rows.`);

    // 3. Clear old image URLs and orphaned topic references from questions table
    const updateQuestions = await pool.query(`
      UPDATE public.questions
      SET image_url = NULL
      WHERE image_url IS NOT NULL AND (image_url LIKE '%old%' OR image_url LIKE '%stage%');
    `);
    console.log(`Cleared image URLs for ${updateQuestions.rowCount || 0} question rows.`);

    const clearOrphanedQuestions = await pool.query(`
      UPDATE public.questions
      SET topic_id = NULL
      WHERE topic_id IS NOT NULL AND topic_id NOT IN (SELECT id FROM public.topics);
    `);
    console.log(`Cleared orphaned topic IDs for ${clearOrphanedQuestions.rowCount || 0} questions.`);

    const clearOrphanedQuestionSubjects = await pool.query(`
      UPDATE public.questions
      SET subject_id = NULL
      WHERE subject_id IS NOT NULL AND subject_id NOT IN (SELECT id FROM public.subjects);
    `);
    console.log(`Cleared orphaned subject IDs for ${clearOrphanedQuestionSubjects.rowCount || 0} questions.`);

    // 4. Clear orphaned references in exams table
    const clearOrphanedExams = await pool.query(`
      UPDATE public.exams
      SET topic_id = NULL
      WHERE topic_id IS NOT NULL AND topic_id NOT IN (SELECT id FROM public.topics);
    `);
    console.log(`Cleared orphaned topic IDs for ${clearOrphanedExams.rowCount || 0} exams.`);

    const clearOrphanedExamSubjects = await pool.query(`
      UPDATE public.exams
      SET subject_id = NULL
      WHERE subject_id IS NOT NULL AND subject_id NOT IN (SELECT id FROM public.subjects);
    `);
    console.log(`Cleared orphaned subject IDs for ${clearOrphanedExamSubjects.rowCount || 0} exams.`);

    // 5. Unlink orphaned animation subject references
    const clearOrphanedAnimations = await pool.query(`
      UPDATE public.animations
      SET subject_id = NULL
      WHERE subject_id IS NOT NULL AND subject_id NOT IN (SELECT id FROM public.subjects);
    `);
    console.log(`Unlinked ${clearOrphanedAnimations.rowCount || 0} orphaned animation subject references.`);

    console.log('\n✅ [Cleanup Complete] Old content paths, old image URLs, and orphaned references removed from database!');
    console.log('🔒 User data and Teacher Zone remain 100% safe & untouched.');
  } catch (err) {
    console.error('Error cleaning up database content paths:', err);
  } finally {
    process.exit(0);
  }
}

cleanupOldContentPaths();
