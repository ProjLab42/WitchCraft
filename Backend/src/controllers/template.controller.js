const templateService = require('../services/template.service');

// Get all active templates
exports.getAllTemplates = async (req, res) => {
  try {
    const templates = await templateService.getAllTemplates();
    res.json(templates);
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a template by ID
exports.getTemplateById = async (req, res) => {
  try {
    const template = await templateService.getTemplateById(req.params.id);
    res.json(template);
  } catch (error) {
    if (error.message === 'Template not found') {
      return res.status(404).json({ message: 'Template not found' });
    }
    console.error('Get template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new template
exports.createTemplate = async (req, res) => {
  try {
    const template = await templateService.createTemplate(req.body);
    res.status(201).json(template);
  } catch (error) {
    console.error('Create template error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Update template
exports.updateTemplate = async (req, res) => {
  try {
    const template = await templateService.updateTemplate(req.params.id, req.body);
    res.json(template);
  } catch (error) {
    if (error.message === 'Template not found') {
      return res.status(404).json({ message: 'Template not found' });
    }
    console.error('Update template error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Delete template
exports.deleteTemplate = async (req, res) => {
  try {
    const result = await templateService.deleteTemplate(req.params.id);
    res.json(result);
  } catch (error) {
    if (error.message === 'Template not found') {
      return res.status(404).json({ message: 'Template not found' });
    }
    console.error('Delete template error:', error);
    res.status(500).json({ message: error.message });
  }
};
