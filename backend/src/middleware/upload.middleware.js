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
  image:     ['image/jpeg', 'image/png', 'image/webp'],
  examPhoto: ['image/jpeg', 'image/png', 'image/webp'],
  audio:     ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/wave', 'audio/ogg', 'audio/m4a', 'audio/x-m4a', 'audio/aac', 'audio/mp4', 'audio/webm'],
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