const express = require('express');
const multer = require('multer');
const uploadController = require('../controllers/upload.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only PDF and DOCX files
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'));
    }
  },
});

// Apply auth middleware
router.use(authMiddleware);

// Upload and parse resume
router.post('/resume', upload.single('file'), uploadController.uploadResume);

module.exports = router;
