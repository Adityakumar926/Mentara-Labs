require('dotenv').config();
const cloudinary = require('./src/config/cloudinary');

async function checkCloudinaryTZ() {
  try {
    console.log('[Cloudinary Check] Searching Cloudinary for Teacher Zone files...');
    
    const res = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'Teacher Zone',
      max_results: 100
    });
    
    console.log('Teacher Zone files in Cloudinary:', res.resources);

    const res2 = await cloudinary.api.resources({
      type: 'upload',
      resource_type: 'raw',
      prefix: 'Teacher Zone',
      max_results: 100
    });
    
    console.log('Teacher Zone raw/PDF files in Cloudinary:', res2.resources);

  } catch (err) {
    console.error('Cloudinary API error:', err.message);
  } finally {
    process.exit(0);
  }
}

checkCloudinaryTZ();
