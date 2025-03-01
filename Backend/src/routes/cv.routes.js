const express = require('express');
const cvController = require('../controllers/cv.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Apply auth middleware to all CV routes
router.use(authMiddleware);

// Create new CV
router.post('/', cvController.createCV);

// Get all user's CVs
router.get('/', cvController.getUserCVs);

// Get CV by ID
router.get('/:id', cvController.getCVById);

// Update CV
router.put('/:id', cvController.updateCV);

// Delete CV
router.delete('/:id', cvController.deleteCV);

// Generate PDF from CV
router.get('/:id/export/pdf', cvController.exportPDF);

// Generate DOCX from CV
router.get('/:id/export/docx', cvController.exportDOCX);

// Share CV via link
router.post('/:id/share', cvController.shareCV);

// Get shared CV (no auth required)
router.get('/shared/:shareId', cvController.getSharedCV);

module.exports = router;
