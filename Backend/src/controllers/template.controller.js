const Template = require('../models/template.model');

// Get all active templates
exports.getAllTemplates = async (req, res) => {
  try {
    const templates = await Template.find({ isActive: true })
      .select('id name imageSrc');
    
    res.json(templates);
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a template by ID
exports.getTemplateById = async (req, res) => {
  try {
    const template = await Template.findOne({
      id: req.params.id,
      isActive: true
    });
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    res.json(template);
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
