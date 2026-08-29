require('dotenv').config();
const cloudinary = require('./src/config/cloudinary');

async function purgeEmptyFolders() {
  try {
    console.log('[Cloudinary Cleanup] Purging all empty folders (preserving "avatars")...');

    const rootFoldersRes = await cloudinary.api.root_folders();
    const rootFolders = rootFoldersRes.folders || [];

    for (const folder of rootFolders) {
      if (folder.name.toLowerCase() === 'avatars' || folder.path.toLowerCase() === 'avatars') {
        console.log(`🔒 PRESERVED: Keeping "${folder.path}" folder 100% safe & untouched.`);
        continue;
      }

      console.log(`Deleting empty folder tree: "${folder.path}"...`);
      await deleteFolderRecursive(folder.path);
    }

    console.log('\n🔒 User avatars ("avatars" folder) remain 100% PRESERVED & untouched.');
    console.log('✅ [Cloudinary Cleanup Complete] All empty folders removed!');
    console.log('Folders will now be created 100% dynamically on-demand at upload time!');
  } catch (err) {
    console.error('Error purging empty folders:', err);
  } finally {
    process.exit(0);
  }
}

async function deleteFolderRecursive(folderPath) {
  try {
    const subRes = await cloudinary.api.sub_folders(folderPath);
    for (const sub of (subRes.folders || [])) {
      await deleteFolderRecursive(sub.path);
    }
  } catch (_) {}

  try {
    await cloudinary.api.delete_folder(folderPath);
  } catch (_) {}
}

purgeEmptyFolders();
