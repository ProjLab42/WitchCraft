const express = require('express');
const templateController = require('../controllers/template.controller');
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');

const router = express.Router();

// Get all templates (public route)
// router.get('/', templateController.getAllTemplates);
router.get('/', (req, res) => {
  return templateController.getAllTemplates(req, res);
});

// Get template by ID (public route)
// router.get('/:id', templateController.getTemplateById);
router.get('/:id', (req, res) => {
  return templateController.getTemplateById(req, res);
});

// Admin routes - require auth and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// Create new template
// router.post('/', templateController.createTemplate);
router.post('/', (req, res) => {
  return templateController.createTemplate(req, res);
});

// Update template
// router.put('/:id', templateController.updateTemplate);
router.put('/:id', (req, res) => {
  return templateController.updateTemplate(req, res);
});

// Delete template
// router.delete('/:id', templateController.deleteTemplate);
router.delete('/:id', (req, res) => {
  return templateController.deleteTemplate(req, res);
});

module.exports = router;
