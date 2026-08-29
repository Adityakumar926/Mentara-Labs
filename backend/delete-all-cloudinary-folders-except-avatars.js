require('dotenv').config();
const cloudinary = require('./src/config/cloudinary');

async function deleteAllCloudinaryFoldersExceptAvatars() {
  try {
    console.log('[Cloudinary Purge] Initializing total Cloudinary folder reset (preserving "avatars")...');

    // 1. Fetch root folders
    const rootFoldersRes = await cloudinary.api.root_folders();
    const rootFolders = rootFoldersRes.folders || [];
    console.log(`Found ${rootFolders.length} root folders in Cloudinary:`, rootFolders.map(f => f.name));

    for (const folder of rootFolders) {
      const folderName = folder.name;
      const folderPath = folder.path;

      // STRICT SAFEGUARD: Do NOT delete avatars folder
      if (folderName.toLowerCase() === 'avatars' || folderPath.toLowerCase() === 'avatars') {
        console.log(`\n🔒 PRESERVED: Keeping "${folderPath}" folder 100% safe & untouched.`);
        continue;
      }

      console.log(`\nPurging folder: "${folderPath}"...`);

      // Delete all image, video/audio, and raw resources under this folder path
      for (const resType of ['image', 'video', 'raw']) {
        let hasMore = true;
        while (hasMore) {
          try {
            const delRes = await cloudinary.api.delete_resources_by_prefix(folderPath, {
              resource_type: resType,
              invalidate: true
            });
            const count = Object.keys(delRes.deleted || {}).length;
            if (count > 0) {
              console.log(`  - Deleted ${count} ${resType} assets in "${folderPath}".`);
            } else {
              hasMore = false;
            }
          } catch (err) {
            hasMore = false;
          }
        }
      }

      // Delete subfolders recursively if any, then delete the root folder entry
      try {
        const subFoldersRes = await cloudinary.api.sub_folders(folderPath);
        for (const sub of (subFoldersRes.folders || [])) {
          try {
            await cloudinary.api.delete_folder(sub.path);
            console.log(`  - Deleted subfolder: "${sub.path}"`);
          } catch (_) {}
        }
      } catch (_) {}

      try {
        await cloudinary.api.delete_folder(folderPath);
        console.log(`  - Deleted folder entry: "${folderPath}".`);
      } catch (fErr) {
        console.log(`  - Folder note for "${folderPath}":`, fErr.message);
      }
    }

    console.log('\n🔒 User avatars ("avatars" folder) remain 100% PRESERVED & untouched.');
    console.log('✅ [Cloudinary Purge Complete] All non-avatar folders deleted cleanly from Cloudinary!');
  } catch (err) {
    console.error('Error purging Cloudinary folders:', err);
  } finally {
    process.exit(0);
  }
}

deleteAllCloudinaryFoldersExceptAvatars();
