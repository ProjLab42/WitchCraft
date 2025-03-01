const express = require('express');
const resumeController = require('../controllers/resume.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Apply auth middleware to all resume routes
router.use(authMiddleware);

// Basic resume CRUD routes
router.post('/create', resumeController.createResume);
router.get('/get', resumeController.getResumes);
router.get('/get/:id', resumeController.getResumeById);
router.put('/update/:id', resumeController.updateResume);
router.delete('/delete/:id', resumeController.deleteResume);
router.get('/download/:id/:format', resumeController.downloadResume);

// New section-specific routes
router.post('/create/:resumeId/sections/:sectionType', resumeController.addSectionItem);
router.put('/update/:resumeId/sections/:sectionType/:itemId', resumeController.updateSectionItem);
router.delete('/delete/:resumeId/sections/:sectionType/:itemId', resumeController.deleteSectionItem);

// Custom sections
router.post('/create/:resumeId/custom-section', resumeController.addCustomSection);

module.exports = router;