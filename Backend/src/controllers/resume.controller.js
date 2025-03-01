const Resume = require('../models/resume.model');
const { generatePdf, generateDocx } = require('../services/document.service');

// Create a new resume
exports.createResume = async (req, res) => {
  try {
    const { title, template, data } = req.body;
    
    const resume = new Resume({
      user: req.userId,
      title,
      template,
      data
    });
    
    await resume.save();
    
    res.status(201).json(resume);
  } catch (error) {
    console.error('Create resume error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all resumes for a user
exports.getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.userId })
      .sort({ updatedAt: -1 });
    
    res.json(resumes);
  } catch (error) {
    console.error('Get resumes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a resume by ID
exports.getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.userId
    });
    
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    res.json(resume);
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a resume
exports.updateResume = async (req, res) => {
  try {
    const { title, template, data } = req.body;
    
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.userId
    });
    
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    resume.title = title || resume.title;
    resume.template = template || resume.template;
    resume.data = data || resume.data;
    resume.updatedAt = Date.now();
    
    await resume.save();
    
    res.json(resume);
  } catch (error) {
    console.error('Update resume error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a resume
exports.deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });
    
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Download a resume as PDF or DOCX
exports.downloadResume = async (req, res) => {
  try {
    const { id, format } = req.params;
    
    const resume = await Resume.findOne({
      _id: id,
      user: req.userId
    });
    
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    let fileBuffer;
    let fileName;
    let contentType;
    
    if (format === 'pdf') {
      fileBuffer = await generatePdf(resume);
      fileName = `${resume.title.replace(/\s+/g, '_')}.pdf`;
      contentType = 'application/pdf';
    } else if (format === 'docx') {
      fileBuffer = await generateDocx(resume);
      fileName = `${resume.title.replace(/\s+/g, '_')}.docx`;
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else {
      return res.status(400).json({ message: 'Invalid format' });
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.send(fileBuffer);
  } catch (error) {
    console.error('Download resume error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
