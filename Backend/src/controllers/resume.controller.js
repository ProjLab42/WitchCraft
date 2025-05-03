const Resume = require('../models/resume.model');
const { generatePdf, generateDocx } = require('../services/document.service');

// Create a new resume
exports.createResume = async (req, res) => {
  try {
    const { title, template, data, sections, sectionOrder } = req.body;
    
    const resume = new Resume({
      user: req.userId, // Note: this must match the property name set in auth middleware
      title,
      template,
      data,
      sections,
      sectionOrder
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
    const { title, template, data, sections, sectionOrder } = req.body;
    
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
    if (sectionOrder) resume.sectionOrder = sectionOrder;
    
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
    const { template } = req.query; // Get template from query params
    
    console.log(`Download request: format=${format}, template=${template}, resumeId=${id}`);
    
    const resume = await Resume.findOne({
      _id: id,
      user: req.userId
    });
    
    if (!resume) {
      console.log(`Resume not found with ID: ${id}`);
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    console.log(`Resume found: ${resume.title} (${resume._id})`);
    console.log(`Resume data structure: data keys=${Object.keys(resume.data || {})}, sections keys=${Object.keys(resume.sections || {})}`);
    
    let fileBuffer;
    let fileName;
    let contentType;
    
    if (format === 'pdf') {
      // Use the PDF service if a template is specified, otherwise fallback to document service
      if (template) {
        console.log(`Using PDF service with template: ${template}`);
        // Get template data from database if needed
        const templateData = await getTemplateData(template);
        console.log(`Template loaded: ${templateData.name}, has HTML: ${!!templateData.html}, CSS length: ${templateData.css?.length || 0} chars`);
        
        // Use the PDF service that supports templates
        const pdfService = require('../services/pdf.service');
        console.log('Starting PDF generation with template...');
        fileBuffer = await pdfService.generatePDF(resume, templateData);
        console.log(`PDF generated with template, size: ${fileBuffer?.length || 0} bytes`);
      } else {
        console.log('Using basic document service for PDF generation');
        // Use the basic document service as fallback
        fileBuffer = await generatePdf(resume);
        console.log(`Basic PDF generated, size: ${fileBuffer?.length || 0} bytes`);
      }
      fileName = `${resume.title.replace(/\s+/g, '_')}.pdf`;
      contentType = 'application/pdf';
    } else if (format === 'docx') {
      console.log('Generating DOCX file');
      fileBuffer = await generateDocx(resume);
      console.log(`DOCX generated, size: ${fileBuffer?.length || 0} bytes`);
      fileName = `${resume.title.replace(/\s+/g, '_')}.docx`;
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else {
      console.log(`Invalid format: ${format}`);
      return res.status(400).json({ message: 'Invalid format' });
    }
    
    console.log(`Generated ${format} file: ${fileName} (${fileBuffer?.length || 0} bytes)`);
    
    if (!fileBuffer || fileBuffer.length === 0) {
      console.error('Generated file buffer is empty or null');
      return res.status(500).json({ message: 'Failed to generate file' });
    }
    
    // Use explicit Buffer conversion to ensure proper binary data handling
    const buffer = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer);
    
    // Set proper headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Send the buffer directly without any transformations
    res.end(buffer);
  } catch (error) {
    console.error('Download resume error:', error);
    // Log additional details about the error
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      params: req.params,
      query: req.query,
      userId: req.userId
    });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to get template data
async function getTemplateData(templateName) {
  try {
    console.log('Fetching template:', templateName);
    // You can implement this based on your template storage
    // This could query a database or read from a templates directory
    const Template = require('../models/template.model');
    
    // Try to find by name or ID
    const template = await Template.findOne({ 
      $or: [
        { name: templateName },
        { id: templateName }
      ]
    });
    
    console.log('Template found:', template ? template.name : 'None');
    
    if (!template) {
      console.log('Using default template instead');
      // Import the default template from pdf.service
      const pdfService = require('../services/pdf.service');
      
      // Return empty html/css to trigger using the defaults in pdf.service.js
      return {
        name: 'modern',
        html: '',  // Will trigger using defaultTemplate from pdf.service.js
        css: ''    // Will trigger using defaultCss from pdf.service.js
      };
    }
    
    // Transform template data to the format expected by PDF service
    // This generates HTML and CSS based on the template styles
    const html = generateTemplateHTML(template);
    const css = generateTemplateCSS(template);
    
    return {
      name: template.name,
      html: html,
      css: css
    };
  } catch (error) {
    console.error('Error getting template data:', error);
    // Import the default template from pdf.service
    const pdfService = require('../services/pdf.service');
    
    // Return empty html/css to trigger using the defaults in pdf.service.js
    return {
      name: 'modern',
      html: '',  // Will trigger using defaultTemplate from pdf.service.js
      css: ''    // Will trigger using defaultCss from pdf.service.js
    };
  }
}

// Generate HTML based on template
function generateTemplateHTML(template) {
  // This is a simple example. In a real application, you'd have more complex templates.
  return `
    <div class="resume">
      {{#with cv}}
        <!-- Personal Info Section -->
        <div class="header">
          <h1 class="name">{{personalInfo.name}}</h1>
          <p class="title">{{personalInfo.title}}</p>
          <div class="contact-info">
            {{#if personalInfo.email}}<span>{{personalInfo.email}}</span>{{/if}}
            {{#if personalInfo.phone}}<span>{{personalInfo.phone}}</span>{{/if}}
            {{#if personalInfo.location}}<span>{{personalInfo.location}}</span>{{/if}}
          </div>
          
          {{#if personalInfo.links}}
          <div class="links">
            {{#if personalInfo.links.linkedin}}<span>LinkedIn: {{personalInfo.links.linkedin}}</span>{{/if}}
            {{#if personalInfo.links.portfolio}}<span>Portfolio: {{personalInfo.links.portfolio}}</span>{{/if}}
          </div>
          {{/if}}
        </div>
        
        <!-- Experience Section -->
        {{#each sections.experience}}
        <div class="section">
          <h2 class="section-title">Experience</h2>
          <div class="section-content">
            <div class="item">
              <div class="item-header">
                <span class="item-title">{{this.company}}</span>
                <span class="item-period">{{this.period}}</span>
              </div>
              <div class="item-subtitle">{{this.title}}</div>
              <div class="item-description">{{this.description}}</div>
            </div>
          </div>
        </div>
        {{/each}}
        
        <!-- Education Section -->
        {{#each sections.education}}
        <div class="section">
          <h2 class="section-title">Education</h2>
          <div class="section-content">
            <div class="item">
              <div class="item-header">
                <span class="item-title">{{this.institution}}</span>
                <span class="item-period">{{this.period}}</span>
              </div>
              <div class="item-subtitle">{{this.degree}}</div>
              <div class="item-description">{{this.description}}</div>
            </div>
          </div>
        </div>
        {{/each}}
        
        <!-- Skills Section -->
        {{#if sections.skills}}
        <div class="section">
          <h2 class="section-title">Skills</h2>
          <div class="skills-content">
            {{#each sections.skills}}
              <span class="skill">{{this.name}}</span>
            {{/each}}
          </div>
        </div>
        {{/if}}
        
        <!-- Projects Section -->
        {{#each sections.projects}}
        <div class="section">
          <h2 class="section-title">Projects</h2>
          <div class="section-content">
            <div class="item">
              <div class="item-header">
                <span class="item-title">{{this.name}}</span>
                <span class="item-period">{{this.period}}</span>
              </div>
              <div class="item-subtitle">{{this.role}}</div>
              <div class="item-description">{{this.description}}</div>
            </div>
          </div>
        </div>
        {{/each}}
        
        <!-- Certifications Section -->
        {{#each sections.certifications}}
        <div class="section">
          <h2 class="section-title">Certifications</h2>
          <div class="section-content">
            <div class="item">
              <div class="item-header">
                <span class="item-title">{{this.name}}</span>
                <span class="item-period">{{this.date}}</span>
              </div>
              <div class="item-subtitle">{{this.issuer}}</div>
              <div class="item-description">{{this.description}}</div>
            </div>
          </div>
        </div>
        {{/each}}
      {{/with}}
    </div>
  `;
}

// Generate CSS based on template
function generateTemplateCSS(template) {
  const styles = template.styles || {};
  const fontFamily = styles.fontFamily || {};
  const fontSize = styles.fontSize || {};
  const layout = styles.layout || {};
  const colors = styles.colors || {};
  
  return `
    .resume {
      font-family: ${fontFamily.body || 'Arial, sans-serif'};
      color: ${colors.primary || '#333'};
      line-height: 1.5;
    }
    
    .header {
      margin-bottom: 20px;
      text-align: ${layout.headerAlignment || 'left'};
    }
    
    .name {
      font-size: ${fontSize.name || '24px'};
      font-weight: bold;
      margin-bottom: 5px;
      font-family: ${fontFamily.heading || 'Georgia, serif'};
      color: ${colors.primary || '#000000'};
    }
    
    .title {
      font-size: ${fontSize.sectionHeading || '18px'};
      margin-bottom: 10px;
      color: ${colors.secondary || '#444444'};
    }
    
    .contact-info span {
      margin: ${layout.headerAlignment === 'center' ? '0 10px' : '0 20px 0 0'};
    }
    
    .links span {
      display: block;
      margin: 5px 0;
    }
    
    .section {
      margin-bottom: 20px;
    }
    
    .section-title {
      font-size: ${fontSize.sectionHeading || '18px'};
      font-weight: bold;
      margin-bottom: 10px;
      font-family: ${fontFamily.heading || 'Georgia, serif'};
      color: ${colors.primary || '#000000'};
      ${layout.sectionStyle === 'underlined' ? 'border-bottom: 1px solid ' + colors.accent + ';' : ''}
      ${layout.sectionStyle === 'boxed' ? 'border: 1px solid ' + colors.accent + '; padding: 5px;' : ''}
      padding-bottom: 5px;
    }
    
    .item {
      margin-bottom: 15px;
    }
    
    .item-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
    }
    
    .item-title {
      font-weight: bold;
      color: ${colors.secondary || '#444444'};
    }
    
    .item-subtitle {
      font-style: italic;
      margin-bottom: 5px;
      color: ${colors.secondary || '#444444'};
    }
    
    .skills-content {
      display: flex;
      flex-wrap: wrap;
    }
    
    .skill {
      background: ${colors.accent ? colors.accent + '22' : '#f5f5f5'};
      padding: 5px 10px;
      border-radius: 3px;
      margin: 0 5px 5px 0;
    }
  `;
}

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