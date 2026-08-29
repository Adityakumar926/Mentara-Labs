const db = require('../config/db');

/**
 * Sanitizes folder names for Cloudinary path compatibility while keeping natural human readability.
 * Replaces slashes, colons, or invalid filesystem chars.
 */
function sanitizePathSegment(segment) {
  if (!segment) return 'General';
  return segment
    .trim()
    .replace(/[\/\?\<\>\\:\*\|"']/g, '-')
    .replace(/\s+/g, ' ');
}

/**
 * Dynamically builds Cloudinary folder path based on topic_id or subject_id:
 * Format: [Curriculum]/[Stage]/[Subject]/[Strand]/[Sub-strand]/[ContentType]
 * e.g.: Cambridge Primary/Stage 1/English/Reading/Word Structure & Phonics/notes
 */
async function buildCloudinaryPath({ topicId, subjectId, contentType = 'notes', destination = 'shared' }) {
  try {
    let curriculum = 'Cambridge Primary';
    let stage = 'General';
    let subject = 'General';
    let strand = 'General';
    let subStrand = 'General';

    if (topicId) {
      const { rows } = await db.query(
        `SELECT 
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
         WHERE t.id = $1`,
        [topicId]
      );

      if (rows[0]) {
        curriculum = rows[0].curriculum_name || curriculum;
        stage = rows[0].class_name || stage;
        subject = rows[0].subject_name || subject;

        if (rows[0].parent_topic_id) {
          strand = rows[0].strand_name || 'General';
          subStrand = rows[0].sub_strand_name || 'General';
        } else {
          strand = rows[0].sub_strand_name || 'General';
          subStrand = 'General';
        }
      }
    } else if (subjectId) {
      const { rows } = await db.query(
        `SELECT 
           c.name AS curriculum_name,
           cl.name AS class_name,
           s.name AS subject_name
         FROM subjects s
         JOIN classes cl ON s.class_id = cl.id
         JOIN curriculums c ON cl.curriculum_id = c.id
         WHERE s.id = $1`,
        [subjectId]
      );

      if (rows[0]) {
        curriculum = rows[0].curriculum_name || curriculum;
        stage = rows[0].class_name || stage;
        subject = rows[0].subject_name || subject;
      }
    }

    // Sanitize segments
    const cleanCurriculum = sanitizePathSegment(curriculum);
    const cleanStage = sanitizePathSegment(stage);
    const cleanSubject = sanitizePathSegment(subject);
    const cleanStrand = sanitizePathSegment(strand);
    const cleanSubStrand = sanitizePathSegment(subStrand);
    const cleanContentType = sanitizePathSegment(contentType);

    let folderPath;
    if (destination === 'teacher') {
      folderPath = `Teacher Zone/${cleanCurriculum}/${cleanStage}/${cleanSubject}/${cleanStrand}/${cleanSubStrand}/${cleanContentType}`;
    } else {
      folderPath = `${cleanCurriculum}/${cleanStage}/${cleanSubject}/${cleanStrand}/${cleanSubStrand}/${cleanContentType}`;
    }

    return folderPath;
  } catch (err) {
    console.error('Error building Cloudinary path:', err.message);
    return `Mentera Content/${contentType}`;
  }
}

module.exports = {
  buildCloudinaryPath,
  sanitizePathSegment
};
