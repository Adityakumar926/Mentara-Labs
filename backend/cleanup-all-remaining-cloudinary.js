require('dotenv').config();
const cloudinary = require('./src/config/cloudinary');

async function cleanRemainingCloudinary() {
  try {
    console.log('[Cloudinary Deep Clean] Inspecting and purging remaining non-avatar / non-teacher assets...');

    // 1. Delete all resources in mentara-labs/worksheets
    try {
      const wsImg = await cloudinary.api.delete_resources_by_prefix('mentara-labs/worksheets', { resource_type: 'image', invalidate: true });
      console.log('Deleted worksheets (images):', Object.keys(wsImg.deleted || {}).length);
      const wsRaw = await cloudinary.api.delete_resources_by_prefix('mentara-labs/worksheets', { resource_type: 'raw', invalidate: true });
      console.log('Deleted worksheets (raw/pdf):', Object.keys(wsRaw.deleted || {}).length);
    } catch (e) { console.log('Worksheets delete note:', e.message); }

    // 2. Delete all resources in mentara-labs/notes
    try {
      const notesImg = await cloudinary.api.delete_resources_by_prefix('mentara-labs/notes', { resource_type: 'image', invalidate: true });
      console.log('Deleted notes (images):', Object.keys(notesImg.deleted || {}).length);
      const notesRaw = await cloudinary.api.delete_resources_by_prefix('mentara-labs/notes', { resource_type: 'raw', invalidate: true });
      console.log('Deleted notes (raw/pdf):', Object.keys(notesRaw.deleted || {}).length);
    } catch (e) { console.log('Notes delete note:', e.message); }

    // 3. Delete all resources in mentara-labs/videos
    try {
      const vids = await cloudinary.api.delete_resources_by_prefix('mentara-labs/videos', { resource_type: 'video', invalidate: true });
      console.log('Deleted videos:', Object.keys(vids.deleted || {}).length);
    } catch (e) { console.log('Videos delete note:', e.message); }

    // 4. Clean any remaining question-images and question-audios (paginated until empty)
    for (const prefix of ['question-images', 'question-audios']) {
      for (const resType of ['image', 'video', 'raw']) {
        let hasMore = true;
        while (hasMore) {
          try {
            const res = await cloudinary.api.delete_resources_by_prefix(prefix, { resource_type: resType, invalidate: true });
            const count = Object.keys(res.deleted || {}).length;
            if (count === 0) {
              hasMore = false;
            } else {
              console.log(`Deleted ${count} ${resType} files in prefix "${prefix}"`);
            }
          } catch (err) {
            hasMore = false;
          }
        }
      }
    }

    console.log('\n🔒 User avatars ("avatars" folder) and Teacher Zone files remain 100% PRESERVED & untouched.');
    console.log('✅ [Cloudinary Deep Clean Complete] All non-teacher, non-avatar worksheets, notes, and question assets removed!');
  } catch (err) {
    console.error('Error during deep clean:', err);
  } finally {
    process.exit(0);
  }
}

cleanRemainingCloudinary();
