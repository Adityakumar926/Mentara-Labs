require('dotenv').config();
const pool = require('./src/config/db');

async function purgeExamsMaterialsQuestions() {
  try {
    console.log('[Purge] Starting database cleanup of existing exams, materials, and questions...');

    // 1. Delete submission answers
    const delAnswers = await pool.query('DELETE FROM public.submission_answers');
    console.log(`Deleted ${delAnswers.rowCount || 0} submission answers.`);

    // 2. Delete exam submissions
    const delSubmissions = await pool.query('DELETE FROM public.exam_submissions');
    console.log(`Deleted ${delSubmissions.rowCount || 0} exam submissions.`);

    // 3. Delete exam questions junction
    const delExamQuestions = await pool.query('DELETE FROM public.exam_questions');
    console.log(`Deleted ${delExamQuestions.rowCount || 0} exam-question mappings.`);

    // 4. Delete notifications linked to exams
    const delNotifications = await pool.query('DELETE FROM public.notifications WHERE exam_id IS NOT NULL');
    console.log(`Deleted ${delNotifications.rowCount || 0} exam notifications.`);

    // 5. Delete all exams
    const delExams = await pool.query('DELETE FROM public.exams');
    console.log(`Deleted ${delExams.rowCount || 0} exams.`);

    // 6. Delete user progress & activity logs linked to content/exams
    await pool.query('DELETE FROM public.user_progress');
    await pool.query('DELETE FROM public.activity_logs');
    console.log('Cleared user progress and activity logs.');

    // 7. Delete all student content/materials (notes, videos, worksheets)
    const delContent = await pool.query('DELETE FROM public.content');
    console.log(`Deleted ${delContent.rowCount || 0} material content items.`);

    // 8. Delete all questions
    const delQuestions = await pool.query('DELETE FROM public.questions');
    console.log(`Deleted ${delQuestions.rowCount || 0} questions.`);

    console.log('\n✅ [Purge Complete] All exams, student materials, and questions deleted!');
    console.log('🔒 Teacher Zone tools (public.animations), User accounts, and Curriculum Structure remain 100% safe & intact.');
  } catch (err) {
    console.error('Error purging exams, materials, and questions:', err);
  } finally {
    process.exit(0);
  }
}

purgeExamsMaterialsQuestions();
