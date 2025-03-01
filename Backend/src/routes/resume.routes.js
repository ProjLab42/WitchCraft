const express = require('express');
const resumeController = require('../controllers/resume.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Apply auth middleware to all resume routes
router.use(authMiddleware);

// Routes
router.post('/', resumeController.createResume);
router.get('/', resumeController.getResumes);
router.get('/:id', resumeController.getResumeById);
router.put('/:id', resumeController.updateResume);
router.delete('/:id', resumeController.deleteResume);
router.get('/:id/download/:format', resumeController.downloadResume);

module.exports = router;
