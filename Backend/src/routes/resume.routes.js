const express = require('express');
const resumeController = require('../controllers/resume.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Public test route for PDF generation (must be before auth middleware)
router.get('/test-pdf', async (req, res) => {
  try {
    console.log('Testing PDF generation...');
    
    // Create a simple test resume
    const testResume = {
      title: 'John Doe Resume',
      data: {
        name: 'John Doe',
        jobTitle: 'Software Developer',
        email: 'john.doe@example.com',
        phone: '(123) 456-7890',
        location: 'San Francisco, CA',
        summary: 'Experienced software developer with a passion for building user-friendly applications.',
        linkedin: 'https://linkedin.com/in/johndoe',
        website: 'https://johndoe.dev'
      },
      sections: {
        experience: [
          {
            id: 'exp1',
            company: 'Tech Solutions Inc.',
            title: 'Senior Developer',
            period: '2020 - Present',
            description: 'Led the development of web applications using React and Node.js.',
            itemType: 'experience'
          },
          {
            id: 'exp2',
            company: 'Web Development Corp',
            title: 'Junior Developer',
            period: '2018 - 2020',
            description: 'Participated in the development of e-commerce websites.',
            itemType: 'experience'
          }
        ],
        education: [
          {
            id: 'edu1',
            institution: 'University of Technology',
            degree: 'Bachelor of Computer Science',
            period: '2014 - 2018',
            description: 'Studied software development, algorithms, and data structures.',
            itemType: 'education'
          }
        ],
        projects: [
          {
            id: 'proj1',
            name: 'E-commerce Platform',
            role: 'Lead Developer',
            period: '2021',
            description: 'Built a scalable e-commerce platform with React and Node.js.',
            technologies: 'React, Node.js, MongoDB, Express',
            url: 'https://ecommerce-example.com',
            github: 'https://github.com/johndoe/ecommerce',
            itemType: 'projects'
          },
          {
            id: 'proj2',
            name: 'Mobile App',
            role: 'Frontend Developer',
            period: '2020',
            description: 'Developed a cross-platform mobile application using React Native.',
            technologies: 'React Native, Firebase, Redux',
            url: 'https://mobileapp-example.com',
            github: 'https://github.com/johndoe/mobile-app',
            itemType: 'projects'
          }
        ],
        certifications: [
          {
            id: 'cert1',
            name: 'AWS Certified Developer',
            issuer: 'Amazon Web Services',
            date: '2022',
            description: 'Professional certification for developing applications on AWS.',
            itemType: 'certifications'
          }
        ],
        skills: [
          { id: 'skill1', name: 'JavaScript' },
          { id: 'skill2', name: 'React' },
          { id: 'skill3', name: 'Node.js' }
        ]
      }
    };
    
    // Use the PDF service
    const pdfService = require('../services/pdf.service');
    
    // Default template data
    const templateData = {
      name: 'modern',
      html: '',  // We'll use the default HTML template from pdf.service.js
      css: ''    // We'll use the default CSS from pdf.service.js
    };
    
    // Generate PDF
    console.log('Generating test PDF...');
    const pdfBuffer = await pdfService.generatePDF(testResume, templateData);
    console.log(`Test PDF generated, size: ${pdfBuffer?.length || 0} bytes`);
    
    if (!pdfBuffer || pdfBuffer.length === 0) {
      return res.status(500).json({ message: 'Failed to generate test PDF' });
    }
    
    // Send PDF response
    const buffer = Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Content-Disposition', 'attachment; filename="test-resume.pdf"');
    res.setHeader('Cache-Control', 'no-cache');
    
    res.end(buffer);
  } catch (error) {
    console.error('Test PDF generation error:', error);
    res.status(500).json({ message: 'Failed to generate test PDF', error: error.message });
  }
});

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