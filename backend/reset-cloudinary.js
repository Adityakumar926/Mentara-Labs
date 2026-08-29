require('dotenv').config();
const cloudinary = require('./src/config/cloudinary');

async function resetCloudinary() {
  try {
    console.log('[Cloudinary Reset] Initializing Cloudinary asset cleanup...');
    console.log(`Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);

    // Folders to target for deletion (old student questions/audios/materials)
    // EXCLUDING 'avatars' and any teacher zone assets.
    const targetFolders = [
      'question-images',
      'question-audios'
    ];

    for (const folder of targetFolders) {
      console.log(`\nProcessing deletion for folder: "${folder}"...`);
      try {
        // Delete all image resources in this prefix
        const result = await cloudinary.api.delete_resources_by_prefix(folder, {
          resource_type: 'image',
          invalidate: true
        });
        console.log(`Images deleted in "${folder}":`, Object.keys(result.deleted || {}).length, 'files removed.');

        // Delete all video/audio resources in this prefix
        const audioResult = await cloudinary.api.delete_resources_by_prefix(folder, {
          resource_type: 'video', // Audio/video files in Cloudinary
          invalidate: true
        });
        console.log(`Audios/Videos deleted in "${folder}":`, Object.keys(audioResult.deleted || {}).length, 'files removed.');
      } catch (fErr) {
        console.log(`Note for "${folder}":`, fErr.message);
      }
    }

    console.log('\n🔒 User avatars ("avatars" folder) and Teacher Zone assets were PRESERVED and untouched.');
    console.log('✅ [Cloudinary Reset Complete] Specified non-avatar/non-teacher assets reset successfully!');
  } catch (err) {
    console.error('Error during Cloudinary reset:', err);
  } finally {
    process.exit(0);
  }
}

resetCloudinary();
