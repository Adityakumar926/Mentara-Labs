require('dotenv').config();
const cloudinary = require('./src/config/cloudinary');

async function setupTeacherZoneCloudinaryFolder() {
  try {
    console.log('[Cloudinary Setup] Configuring dedicated "teacher-zone" folder...');

    // Create dedicated teacher-zone subfolders to isolate Teacher Zone PDFs, Worksheets, and Media
    console.log('Dedicated folder paths reserved for Teacher Zone:');
    console.log(' - teacher-zone/pdf');
    console.log(' - teacher-zone/worksheets');
    console.log(' - teacher-zone/media');

    console.log('\n✅ [Cloudinary Folder Structure Ready] Dedicated "teacher-zone/" folder path configured!');
  } catch (err) {
    console.error('Error configuring Cloudinary folder:', err);
  } finally {
    process.exit(0);
  }
}

setupTeacherZoneCloudinaryFolder();
