const express = require('express');
const templateController = require('../controllers/template.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.get('/', templateController.getTemplates);

// Protected routes
router.use(authMiddleware);
router.get('/:id', templateController.getTemplateById);

module.exports = router;
