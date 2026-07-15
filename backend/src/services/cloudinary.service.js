const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

/**
 * Uploads an image buffer to Cloudinary.
 * @param {Buffer} buffer     - File buffer from multer memoryStorage
 * @param {string} folder     - Cloudinary folder, e.g. 'avatars', 'thumbnails', 'question-images'
 * @param {object} [options]  - Extra Cloudinary upload options (transformation, tags, etc.)
 * @returns {Promise<{url: string, publicId: string}>}
 */
exports.uploadImage = (buffer, folder, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Deletes an image from Cloudinary by its public_id.
 * Store the publicId returned from uploadImage if you need to delete later.
 */
exports.deleteImage = async (publicId, options = {}) => {
  return cloudinary.uploader.destroy(publicId, options);
};