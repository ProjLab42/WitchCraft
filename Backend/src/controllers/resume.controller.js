const Resume = require('../models/resume.model');
const { generatePdf, generateDocx } = require('../services/document.service');

// Create a new resume
exports.createResume = async (req, res) => {
  try {
    const { title, template, data, sections } = req.body;
    
    const resume = new Resume({
      user: req.userId, // Note: this must match the property name set in auth middleware
      title,
      template,
      data,
      sections
    });
    
    await resume.save();
    
    res.status(201).json(resume);
  } catch (error) {
    console.error('Create resume error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all resumes for a user
exports.getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.userId })
      .select('_id title template updatedAt') // Only return essential fields for listing
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
    const { title, template, data, sections } = req.body;
    
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.userId
    });
    
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    // Update only the fields that are provided
    if (title) resume.title = title;
    if (template) resume.template = template;
    if (data) resume.data = data;
    
    // Handle sections update with more granularity
    if (sections) {
      // Update section metadata if provided
      if (sections.sectionMeta) {
        resume.sections.sectionMeta = sections.sectionMeta;
      }
      
      // Update individual section arrays if provided
      const sectionTypes = ['experience', 'education', 'skills', 'projects', 'certifications'];
      sectionTypes.forEach(sectionType => {
        if (sections[sectionType]) {
          resume.sections[sectionType] = sections[sectionType];
        }
      });
      
      // Handle custom sections if provided
      if (sections.customSections) {
        resume.sections.customSections = sections.customSections;
      }
    }
    
    resume.updatedAt = Date.now();
    await resume.save();
    
    res.json(resume);
  } catch (error) {
    console.error('Update resume error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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

// Add a section item (experience, education, etc)
exports.addSectionItem = async (req, res) => {
  try {
    const { resumeId, sectionType } = req.params;
    const itemData = req.body;
    
    // Validate section type
    const validSections = ['experience', 'education', 'skills', 'projects', 'certifications'];
    if (!validSections.includes(sectionType)) {
      return res.status(400).json({ message: 'Invalid section type' });
    }
    
    const resume = await Resume.findOne({
      _id: resumeId,
      user: req.userId
    });
    
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    // Add the new item to the specified section
    resume.sections[sectionType].push(itemData);
    await resume.save();
    
    res.status(201).json(resume);
  } catch (error) {
    console.error(`Add ${req.params.sectionType} error:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a section item
exports.updateSectionItem = async (req, res) => {
  try {
    const { resumeId, sectionType, itemId } = req.params;
    const itemData = req.body;
    
    // Validate section type
    const validSections = ['experience', 'education', 'skills', 'projects', 'certifications'];
    if (!validSections.includes(sectionType)) {
      return res.status(400).json({ message: 'Invalid section type' });
    }
    
    const resume = await Resume.findOne({
      _id: resumeId,
      user: req.userId
    });
    
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    // Find and update the specific item
    const itemIndex = resume.sections[sectionType].findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Update the item with new data while preserving the ID
    const updatedItem = {
      ...itemData,
      id: resume.sections[sectionType][itemIndex].id // Keep the original ID
    };
    
    resume.sections[sectionType][itemIndex] = updatedItem;
    await resume.save();
    
    res.json(resume);
  } catch (error) {
    console.error(`Update ${req.params.sectionType} item error:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a section item
exports.deleteSectionItem = async (req, res) => {
  try {
    const { resumeId, sectionType, itemId } = req.params;
    
    // Validate section type
    const validSections = ['experience', 'education', 'skills', 'projects', 'certifications'];
    if (!validSections.includes(sectionType)) {
      return res.status(400).json({ message: 'Invalid section type' });
    }
    
    const resume = await Resume.findOne({
      _id: resumeId,
      user: req.userId
    });
    
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    // Remove the item from the section
    resume.sections[sectionType] = resume.sections[sectionType].filter(
      item => item.id !== itemId
    );
    
    await resume.save();
    
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error(`Delete ${req.params.sectionType} item error:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a custom section
exports.addCustomSection = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { sectionKey, sectionData } = req.body;
    
    if (!sectionKey || !sectionData || !sectionData.title) {
      return res.status(400).json({ message: 'Section key and title are required' });
    }
    
    const resume = await Resume.findOne({
      _id: resumeId,
      user: req.userId
    });
    
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    // Add the custom section
    if (!resume.sections.customSections) {
      resume.sections.customSections = {};
    }
    
    resume.sections.customSections[sectionKey] = sectionData;
    
    // Add to section metadata
    if (!resume.sections.sectionMeta) {
      resume.sections.sectionMeta = {};
    }
    
    resume.sections.sectionMeta[sectionKey] = {
      name: sectionData.title,
      deletable: true,
      renamable: true
    };
    
    await resume.save();
    
    res.status(201).json(resume);
  } catch (error) {
    console.error('Add custom section error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};