const multer = require('multer');
const config = require('../config/env');

// Memory storage (file stored in memory as Buffer)
const storage = multer.memoryStorage();

// File filter to validate file types and sizes
const fileFilter = (req, file, cb) => {
  // Check file type
  if (!config.FILE_UPLOAD.ALLOWED_TYPES.includes(file.mimetype)) {
    return cb(new Error(`File type ${file.mimetype} not allowed. Allowed types: ${config.FILE_UPLOAD.ALLOWED_TYPES.join(', ')}`), false);
  }

  // Check file size
  if (file.size > config.FILE_UPLOAD.MAX_SIZE) {
    return cb(new Error(`File size exceeds maximum limit of ${config.FILE_UPLOAD.MAX_SIZE / (1024 * 1024)}MB`), false);
  }

  cb(null, true);
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: config.FILE_UPLOAD.MAX_SIZE
  }
});

module.exports = {
  upload,
  fileFilter
};
