const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

/**
 * Uploads an image buffer to Cloudinary.
 * @param {Buffer} buffer     - File buffer from multer memoryStorage
 * @param {string} folder     - Cloudinary folder, e.g. 'avatars', 'thumbnails', 'question-images'
 * @param {object} [options]  - Extra Cloudinary upload options (transformation, tags, etc.)
 * @returns {Promise<{url: string, publicId: string}>}
 */
exports.uploadImage = async (buffer, folder, options = {}, retries = 3) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'image',
            timeout: 60000,
            ...options,
          },
          (error, result) => {
            if (error) return reject(error);
            resolve({ url: result.secure_url, publicId: result.public_id });
          }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
      });
    } catch (err) {
      attempt++;
      if (attempt >= retries) throw err;
      await new Promise((r) => setTimeout(r, attempt * 500)); // exponential backoff 500ms, 1000ms...
    }
  }
};

/**
 * Deletes an image from Cloudinary by its public_id.
 * Store the publicId returned from uploadImage if you need to delete later.
 */
exports.deleteImage = async (publicId, options = {}) => {
  return cloudinary.uploader.destroy(publicId, options);
};