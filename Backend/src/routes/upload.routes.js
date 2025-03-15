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
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('Received file upload:', file.originalname, file.mimetype);
    
    // Accept only PDF and DOCX files
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      cb(null, true);
    } else {
      console.error('File type rejected:', file.mimetype);
      cb(new Error('Only PDF and DOCX files are allowed'));
    }
  },
});

// Middleware to handle multer errors
const handleMulterErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err);
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  } else if (err) {
    console.error('Upload error:', err);
    return res.status(400).json({ message: err.message });
  }
  next();
};

// Apply auth middleware (make it optional for testing)
const conditionalAuth = (req, res, next) => {
  // Check if we're in development mode and auth is disabled for testing
  if (process.env.NODE_ENV === 'development' && process.env.DISABLE_AUTH === 'true') {
    console.log('Auth middleware bypassed for development');
    // Add a mock user for testing with a real user ID from the database
    const mockUserId = '67cc399c00509fe14d181f23';
    req.userId = mockUserId;
    req.user = { id: mockUserId, email: 'test@example.com' };
    console.log('Upload routes using mock user:', { userId: req.userId, user: req.user });
    return next();
  }
  
  // Otherwise, apply the auth middleware
  authMiddleware(req, res, next);
};

// Apply conditional auth middleware
router.use(conditionalAuth);

// Upload and parse resume
router.post('/resume', upload.single('file'), handleMulterErrors, (req, res, next) => {
  console.log('Resume upload endpoint hit');
  uploadController.uploadResume(req, res, next);
});

module.exports = router;
