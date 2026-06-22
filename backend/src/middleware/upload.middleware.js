const multer = require('multer');

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const MAX_FILE_SIZE_MB = {
  note:       20,   // PDFs / notes → Cloudinary (resource_type: raw)
  image:       5,   // Avatars, thumbnails → Cloudinary
  examPhoto:  10,   // Photos of handwritten exam answers → Cloudinary (phone camera shots run larger than avatars)
  video:     500,   // Videos → Mux direct upload (held in memory briefly then streamed)
};

const ALLOWED_MIME = {
  note:      ['application/pdf'],
  image:     ['image/jpeg', 'image/png', 'image/webp'],
  examPhoto: ['image/jpeg', 'image/png', 'image/webp'],
  video:     ['video/mp4', 'video/quicktime', 'video/x-matroska', 'video/webm'],
};

// ─── FACTORY ──────────────────────────────────────────────────────────────────

const upload = (type = 'image') => {
  const allowedMimes = ALLOWED_MIME[type] ?? ALLOWED_MIME.image;
  const maxSizeMB    = MAX_FILE_SIZE_MB[type] ?? 5;

  const storage = multer.memoryStorage();

  const fileFilter = (req, file, cb) => {
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new multer.MulterError(
          'LIMIT_UNEXPECTED_FILE',
          `Only ${allowedMimes.join(', ')} allowed for ${type} uploads`
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
      LIMIT_UNEXPECTED_FILE: err.field,
    };
    return res.status(400).json({
      success: false,
      message: messages[err.code] ?? err.message,
    });
  }
  next(err);
};

module.exports = { upload, handleUploadError };