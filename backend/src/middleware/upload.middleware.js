const multer = require('multer');

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const MAX_FILE_SIZE_MB = {
  note:       20,   // PDFs / notes → Cloudinary (resource_type: raw)
  image:      25,   // Avatars, question photos, camera shots → Cloudinary
  examPhoto:  25,   // Photos of handwritten exam answers → Cloudinary
  audio:      50,   // Question audio passages → Cloudinary
  video:     500,   // Videos → Mux direct upload
};

const ALLOWED_MIME = {
  note:      ['application/pdf'],
  image:     [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
    'image/svg+xml', 'image/avif', 'image/jfif', 'image/pjpeg', 'image/bmp', 'image/tiff'
  ],
  examPhoto: [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
    'image/svg+xml', 'image/avif', 'image/jfif', 'image/pjpeg', 'image/bmp', 'image/tiff'
  ],
  audio:     ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/wave', 'audio/ogg', 'audio/m4a', 'audio/x-m4a', 'audio/aac', 'audio/mp4', 'audio/webm'],
  video:     ['video/mp4', 'video/quicktime', 'video/x-matroska', 'video/webm'],
};

const IMAGE_EXT_REGEX = /\.(jpe?g|png|webp|gif|svg|avif|jfif|bmp|tiff)$/i;

// ─── FACTORY ──────────────────────────────────────────────────────────────────

const upload = (type = 'image') => {
  const allowedMimes = ALLOWED_MIME[type] ?? ALLOWED_MIME.image;
  const maxSizeMB    = MAX_FILE_SIZE_MB[type] ?? 25;

  const storage = multer.memoryStorage();

  const fileFilter = (req, file, cb) => {
    const isMimeAllowed = allowedMimes.includes(file.mimetype);
    const isImageExtAllowed = (type === 'image' || type === 'examPhoto') && IMAGE_EXT_REGEX.test(file.originalname || '');

    if (isMimeAllowed || isImageExtAllowed) {
      cb(null, true);
    } else {
      cb(
        new multer.MulterError(
          'LIMIT_UNEXPECTED_FILE',
          `Only ${allowedMimes.join(', ')} allowed for ${type} uploads (received: ${file.mimetype || 'unknown'})`
        ),
        false
      );
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
  });
};

// ─── ERROR HANDLER ────────────────────────────────────────────────────────────

const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const messages = {
      LIMIT_FILE_SIZE:       'File too large. Maximum allowed size exceeded.',
      LIMIT_FILE_COUNT:      'Too many files uploaded in a single batch.',
      LIMIT_UNEXPECTED_FILE: err.message || err.field || 'Unexpected file uploaded.',
    };
    return res.status(400).json({
      success: false,
      message: messages[err.code] ?? err.message ?? 'File upload error',
    });
  }
  next(err);
};

module.exports = { upload, handleUploadError };