const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

/**
 * Sanitizes Cloudinary public_id by removing file extensions (.png, .pdf, .jpg)
 * and replacing invalid special characters (&, #, ?, %, spaces) with clean underscores.
 */
const sanitizePublicId = (publicId) => {
  if (!publicId) return undefined;
  const parts = publicId.split('/');
  const filename = parts.pop();
  const folder = parts.join('/');
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  const cleanName = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_');
  return folder ? `${folder}/${cleanName}` : cleanName;
};

exports.sanitizePublicId = sanitizePublicId;

/**
 * Uploads an image buffer to Cloudinary.
 * @param {Buffer} buffer     - File buffer from multer memoryStorage
 * @param {string} folder     - Cloudinary folder, e.g. 'avatars', 'thumbnails', 'question-images'
 * @param {object} [options]  - Extra Cloudinary upload options (transformation, tags, etc.)
 * @returns {Promise<{url: string, publicId: string}>}
 */
exports.uploadImage = async (buffer, folder, options = {}, retries = 3) => {
  let attempt = 0;
  const sanitizedOptions = { ...options };
  if (sanitizedOptions.public_id) {
    sanitizedOptions.public_id = sanitizePublicId(sanitizedOptions.public_id);
  }

  while (attempt < retries) {
    try {
      return await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'image',
            timeout: 60000,
            ...sanitizedOptions,
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
 * Uploads a video buffer to Cloudinary.
 * @param {Buffer} buffer     - File buffer from multer memoryStorage
 * @param {string} folder     - Cloudinary folder, e.g. 'mentara-labs/videos'
 * @param {object} [options]  - Extra Cloudinary upload options
 * @returns {Promise<{url: string, publicId: string}>}
 */
exports.uploadVideo = async (buffer, folder, options = {}, retries = 3) => {
  let attempt = 0;
  const sanitizedOptions = { ...options };
  if (sanitizedOptions.public_id) {
    sanitizedOptions.public_id = sanitizePublicId(sanitizedOptions.public_id);
  }

  while (attempt < retries) {
    try {
      return await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'video',
            timeout: 180000,
            ...sanitizedOptions,
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
      await new Promise((r) => setTimeout(r, attempt * 1000));
    }
  }
};

/**
 * Deletes an image or video from Cloudinary by its public_id.
 * Store the publicId returned from uploadImage if you need to delete later.
 */
exports.deleteImage = async (publicId, options = {}) => {
  const cleanId = sanitizePublicId(publicId) || publicId;
  return cloudinary.uploader.destroy(cleanId, options);
};