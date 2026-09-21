const multer = require('multer');
const path = require('path');
const config = require('../config');
const ApiError = require('../utils/ApiError');

// Use memory storage for quick in-memory parsing without filesystem clutter
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isAllowedExt = config.upload.allowedExtensions.includes(ext);
  const isAllowedMime = config.upload.allowedMimeTypes.includes(file.mimetype) || file.mimetype === 'application/octet-stream';

  if (isAllowedExt || isAllowedMime) {
    cb(null, true);
  } else {
    cb(
      ApiError.badRequest(
        `Unsupported file type '${ext}'. Only .txt, .pdf, and .docx files are supported.`
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: config.upload.maxFileSize, // 10 MB
  },
  fileFilter,
});

module.exports = upload;
