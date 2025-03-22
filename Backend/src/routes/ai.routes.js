const express = require('express');
const aiController = require('../controllers/ai.controller');
const authMiddleware = require('../middleware/auth.middleware');
const router = express.Router();

// Test the connection to Gemini API
router.get('/test-connection', aiController.testGeminiConnection);

// Generate a resume from user profile and job description (requires authentication)
router.post('/generate-resume', authMiddleware, aiController.generateResumeFromProfile);

module.exports = router; 