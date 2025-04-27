const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

// Register Handlebars helpers
handlebars.registerHelper('formatDate', function(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short'
  });
});

handlebars.registerHelper('join', function(array, separator) {
  if (!array || !Array.isArray(array)) return '';
  return array.join(separator || ', ');
});

handlebars.registerHelper('eq', function(a, b) {
  return a === b;
});

// Add helper to safely output HTML
handlebars.registerHelper('safe', function(text) {
  return new handlebars.SafeString(text || '');
});

// Add a helper to check if a value is an array
handlebars.registerHelper('isArray', function(value, options) {
  if (Array.isArray(value)) {
    return options.fn(this);
  }
  return options.inverse(this);
});

// Add a helper to get keys of an object
handlebars.registerHelper('keys', function(obj) {
  if (typeof obj !== 'object' || obj === null) return [];
  return Object.keys(obj);
});

// Add a helper to get value from an object by key
handlebars.registerHelper('lookup', function(obj, key) {
  if (typeof obj !== 'object' || obj === null) return undefined;
  return obj[key];
});

// Add a helper for debugging values in templates
handlebars.registerHelper('debug', function(value) {
  console.log('Template debug -', value);
  return JSON.stringify(value, null, 2);
});

// Generate HTML from CV data and template
const generateHTML = async (cv, template) => {
  try {
    // Use a default template if provided template doesn't have HTML
    const templateHtml = template?.html || defaultTemplate;
    
    // Compile the template
    const compiledTemplate = handlebars.compile(templateHtml);
    
    // Map MongoDB schema to template-friendly structure
    const personalInfo = {
      name: cv.data?.name || '',
      title: cv.data?.jobTitle || '',
      email: cv.data?.email || '',
      phone: cv.data?.phone || '',
      location: cv.data?.location || '',
      linkedin: cv.data?.linkedin || '',
      website: cv.data?.website || ''
    };
    
    // Create data object for template
    const data = {
      personalInfo,
      sections: cv.sections || {},
      title: cv.title
    };
    
    // Log what data we're using
    console.log('Template data prepared:', {
      personalInfoKeys: Object.keys(personalInfo),
      sectionKeys: Object.keys(data.sections || {})
    });
    
    // Add CSS with the template
    const css = template?.css || defaultCss;
    
    // Generate HTML from template and data
    const content = compiledTemplate({ cv: data });
    
    // Return complete HTML document
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${cv.title || 'Resume'}</title>
  <style>
    ${css}
    
    /* Modern resume styling */
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0 30px;
      font-size: 12px;
    }
    
    .resume-container {
      max-width: 800px;
      margin: 30px auto;
    }
    
    h1 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 8px;
      text-align: center;
    }
    
    .job-title {
      font-size: 16px;
      color: #555;
      text-align: center;
      margin-bottom: 12px;
    }
    
    .contact-info {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 24px;
      text-align: center;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 8px;
      margin-top: 24px;
      border-bottom: 1px solid transparent;
      padding-bottom: 8px;
    }
    
    .experience-item, .education-item {
      margin-bottom: 16px;
    }
    
    .company-school {
      display: flex;
      justify-content: space-between;
      font-weight: 600;
      margin-bottom: 4px;
    }
    
    .position-degree {
      font-style: italic;
      color: #555;
      margin-bottom: 4px;
    }
    
    .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }
    
    .skill-item {
      background-color: white;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 11px;
      border: 1px solid transparent;
    }
    
    .summary {
      margin-bottom: 24px;
      text-align: justify;
    }
    
    a {
      color: #2a7ae2;
      text-decoration: none;
    }
    
    /* Override any blue borders that might appear */
    .section-title, 
    .experience-item, 
    .education-item, 
    .skills-list, 
    .skill-item,
    div[style*="border"],
    div {
      border-color: transparent !important;
      outline: none !important;
      box-shadow: none !important;
    }
  </style>
</head>
<body>
  <div class="resume-container">
    <!-- Header -->
    <h1>${personalInfo.name}</h1>
    ${personalInfo.title ? `<div class="job-title">${personalInfo.title}</div>` : ''}
    
    <!-- Contact Information -->
    <div class="contact-info">
      ${personalInfo.email ? `<div>${personalInfo.email}</div>` : ''}
      ${personalInfo.phone ? `<div>${personalInfo.phone}</div>` : ''}
      ${personalInfo.location ? `<div>${personalInfo.location}</div>` : ''}
    </div>
    
    <!-- Links -->
    ${personalInfo.linkedin || personalInfo.website ? 
      `<div class="contact-info">
        ${personalInfo.linkedin ? `<div>LinkedIn: ${personalInfo.linkedin}</div>` : ''}
        ${personalInfo.website ? `<div>Portfolio: ${personalInfo.website}</div>` : ''}
      </div>` : ''}
    
    <!-- Summary -->
    ${cv.data?.summary ? 
      `<div class="summary">${cv.data.summary}</div>` : ''}
    
    <!-- Experience -->
    ${cv.sections?.experience && cv.sections.experience.length > 0 ? 
      `<div class="section-title" style="border: none;">Experience</div>
      ${cv.sections.experience.map(exp => `
        <div class="experience-item">
          <div class="company-school">
            <div>${exp.company || ''}</div>
            <div>${exp.period || ''}</div>
          </div>
          <div class="position-degree">${exp.title || ''}</div>
          <div class="description">${new handlebars.SafeString(exp.description || '')}</div>
        </div>
      `).join('')}` : ''}
    
    <!-- Education -->
    ${cv.sections?.education && cv.sections.education.length > 0 ? 
      `<div class="section-title" style="border: none;">Education</div>
      ${cv.sections.education.map(edu => `
        <div class="experience-item">
          <div class="company-school">
            <div>${edu.institution || ''}</div>
            <div>${edu.period || ''}</div>
          </div>
          <div class="position-degree">${edu.degree || ''}</div>
          <div class="description">${new handlebars.SafeString(edu.description || '')}</div>
        </div>
      `).join('')}` : ''}
    
    <!-- Skills -->
    ${cv.sections?.skills && cv.sections.skills.length > 0 ? 
      `<div class="section-title" style="border: none;">Skills</div>
      <div class="skills-list">
        ${cv.sections.skills.map(skill => `
          <div class="skill-item" style="border: none; background-color: transparent;">${skill.name || ''}</div>
        `).join('')}
      </div>` : ''}
      
    <!-- Projects -->
    ${cv.sections?.projects && cv.sections.projects.length > 0 ? 
      `<div class="section-title" style="border: none;">Projects</div>
      ${cv.sections.projects.map(project => `
        <div class="experience-item">
          <div class="company-school">
            <div class="project-name">${project.name || ''}</div>
            <div>${project.period || ''}</div>
          </div>
          ${project.role ? `<div class="project-role">${project.role}</div>` : ''}
          ${project.description ? `<div class="project-details">${new handlebars.SafeString(project.description)}</div>` : ''}
          ${project.technologies ? `<div class="project-details"><strong>Technologies:</strong> ${project.technologies}</div>` : ''}
          ${project.url ? `<div class="project-details"><strong>URL:</strong> <a href="${project.url}" target="_blank">${project.url}</a></div>` : ''}
          ${project.github ? `<div class="project-details"><strong>GitHub:</strong> <a href="${project.github}" target="_blank">${project.github}</a></div>` : ''}
        </div>
      `).join('')}` : ''}
      
    <!-- Certifications -->
    ${cv.sections?.certifications && cv.sections.certifications.length > 0 ? 
      `<div class="section-title" style="border: none;">Certifications</div>
      ${cv.sections.certifications.map(cert => `
        <div class="experience-item">
          <div class="company-school">
            <div>${cert.name || ''}</div>
            <div>${cert.date || ''}</div>
          </div>
          <div class="position-degree">${cert.issuer || ''}</div>
          <div class="description">${new handlebars.SafeString(cert.description || '')}</div>
        </div>
      `).join('')}` : ''}
  </div>
</body>
</html>`;
  } catch (error) {
    console.error('HTML generation error:', error);
    throw new Error(`Failed to generate HTML: ${error.message}`);
  }
};

// Generate PDF from CV data
exports.generatePDF = async (cv, template) => {
  try {
    // Log what we're getting from the database to help debug
    console.log('Generating PDF for resume:', {
      title: cv.title,
      templateName: template.name,
      dataKeys: Object.keys(cv.data || {}),
      sectionKeys: Object.keys(cv.sections || {})
    });
    
    // Generate HTML from our template
    const html = await generateHTML(cv, template);
    console.log('HTML generated, size:', html.length, 'bytes');
    
    try {
      // First try to use puppeteer for best rendering
      console.log('Launching Puppeteer browser with minimal configuration...');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
      
      console.log('Browser launched successfully');
    
    const page = await browser.newPage();
      console.log('Page created');
      
      // Set HTML directly
    await page.setContent(html, { waitUntil: 'networkidle0' });
      console.log('Content set, generating PDF...');
    
      // Generate PDF with minimal settings to ensure it works
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      });
      
      console.log(`PDF generated successfully, size: ${pdfBuffer.length} bytes`);
    
    await browser.close();
      console.log('Browser closed');
      
    return pdfBuffer;
    } catch (puppeteerError) {
      // If puppeteer fails, log the error and fall back to pdf-lib
      console.error('Puppeteer PDF generation error:', puppeteerError);
      console.log('Falling back to basic PDF generation with pdf-lib...');
      
      // Create a minimal PDF directly using pdf-lib
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]); // A4 size in points
      const { width, height } = page.getSize();
      
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontSize = 12;
      const titleSize = 24;
      const headerSize = 18;
      const textWidth = width - 100; // Leave 50pt margin on each side
      
      let yPosition = height - 50; // Start 50pt from top
      
      // Don't include "Resume:" in the title (just use the name directly)
      page.drawText(cv.data?.name || cv.title || 'Resume', {
        x: 50,
        y: yPosition,
        size: titleSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= titleSize * 1.5;
      
      // Add personal info
      if (cv.data && cv.data.jobTitle) {
        page.drawText(cv.data.jobTitle, {
          x: 50,
          y: yPosition,
          size: fontSize + 2,
          font,
          color: rgb(0.3, 0.3, 0.3),
        });
        yPosition -= (fontSize + 2) * 1.5;
      }
      
      if (cv.data && cv.data.email) {
        page.drawText(cv.data.email, {
          x: 50,
          y: yPosition,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
        yPosition -= fontSize * 1.2;
      }
      
      if (cv.data && cv.data.phone) {
        page.drawText(cv.data.phone, {
          x: 50,
          y: yPosition,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
        yPosition -= fontSize * 1.2;
      }
      
      if (cv.data && cv.data.location) {
        page.drawText(cv.data.location, {
          x: 50,
          y: yPosition,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
        yPosition -= fontSize * 1.5;
      }
      
      // Add Experience section if exists
      if (cv.sections && cv.sections.experience && cv.sections.experience.length > 0) {
        yPosition -= fontSize * 1.5; // Add some spacing
        
        page.drawText('Experience', {
          x: 50,
          y: yPosition,
          size: headerSize,
          font: boldFont,
          color: rgb(0, 0, 0),
        });
        yPosition -= headerSize * 1.2;
        
        // Draw a line under the section title
        page.drawLine({
          start: { x: 50, y: yPosition + 5 },
          end: { x: width - 50, y: yPosition + 5 },
          thickness: 0, // Zero thickness makes it invisible
          color: rgb(1, 1, 1),
        });
        yPosition -= fontSize;
        
        for (const exp of cv.sections.experience) {
          if (yPosition < 100) {
            // Not enough space, add a new page
            page = pdfDoc.addPage([595, 842]);
            yPosition = height - 50;
          }
          
          page.drawText(`${exp.company || ''}`, {
            x: 50,
            y: yPosition,
            size: fontSize,
            font: boldFont,
            color: rgb(0, 0, 0),
          });
          yPosition -= fontSize * 1.2;
          
          page.drawText(`${exp.title || ''} (${exp.period || ''})`, {
            x: 60,
            y: yPosition,
            size: fontSize - 1,
            font,
            color: rgb(0.3, 0.3, 0.3),
          });
          yPosition -= fontSize * 1.2;
          
          if (exp.description) {
            const descLines = splitTextIntoLines(exp.description, textWidth - 20, fontSize - 1, font);
            for (const line of descLines) {
              page.drawText(line, {
                x: 70,
                y: yPosition,
                size: fontSize - 1,
                font,
                color: rgb(0, 0, 0),
              });
              yPosition -= (fontSize - 1) * 1.2;
            }
          }
          
          yPosition -= fontSize; // Add some space between items
        }
      }
      
      // Save the PDF to a buffer
      const pdfBytes = await pdfDoc.save();
      console.log('PDF generated with pdf-lib, size:', pdfBytes.length);
      
      return Buffer.from(pdfBytes);
    }
  } catch (error) {
    console.error('PDF generation error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};

// Helper function to split text into lines based on width
function splitTextIntoLines(text, maxWidth, fontSize, font) {
  if (!text) return [];
  
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  
  for (const word of words) {
    const potentialLine = currentLine ? currentLine + ' ' + word : word;
    const lineWidth = font.widthOfTextAtSize(potentialLine, fontSize);
    
    if (lineWidth <= maxWidth || currentLine === '') {
      currentLine = potentialLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

// Default template
const defaultTemplate = `
<div class="resume">
  <header>
    <h1>{{cv.personalInfo.name}}</h1>
    {{#if cv.personalInfo.title}}
      <p class="job-title">{{cv.personalInfo.title}}</p>
    {{/if}}
    
    <div class="contact-info">
      {{#if cv.personalInfo.email}}
        <div>{{cv.personalInfo.email}}</div>
      {{/if}}
      {{#if cv.personalInfo.phone}}
        <div>{{cv.personalInfo.phone}}</div>
      {{/if}}
      {{#if cv.personalInfo.location}}
        <div>{{cv.personalInfo.location}}</div>
      {{/if}}
    </div>
    
    {{#if cv.personalInfo.linkedin}}
      <div class="contact-info">
        <div>LinkedIn: {{cv.personalInfo.linkedin}}</div>
        {{#if cv.personalInfo.website}}
          <div>Portfolio: {{cv.personalInfo.website}}</div>
        {{/if}}
      </div>
    {{else if cv.personalInfo.website}}
      <div class="contact-info">
        <div>Portfolio: {{cv.personalInfo.website}}</div>
      </div>
    {{/if}}
  </header>
  
  {{#if cv.personalInfo.summary}}
    <section class="summary">
      <p>{{cv.personalInfo.summary}}</p>
    </section>
  {{/if}}
  
  {{#if cv.sections.experience}}
    <section>
      <h2 class="section-title">Experience</h2>
      {{#each cv.sections.experience}}
        <div class="item">
          <div class="item-header">
            <div class="item-title">{{this.company}}</div>
            <div class="item-date">{{this.period}}</div>
          </div>
          <div class="item-subtitle">{{this.title}}</div>
          <div class="item-content">{{{this.description}}}</div>
        </div>
      {{/each}}
    </section>
  {{/if}}
  
  {{#if cv.sections.education}}
    <section>
      <h2 class="section-title">Education</h2>
      {{#each cv.sections.education}}
        <div class="item">
          <div class="item-header">
            <div class="item-title">{{this.institution}}</div>
            <div class="item-date">{{this.period}}</div>
          </div>
          <div class="item-subtitle">{{this.degree}}</div>
          <div class="item-content">{{{this.description}}}</div>
        </div>
      {{/each}}
    </section>
  {{/if}}
  
  {{#if cv.sections.projects}}
    <section>
      <h2 class="section-title">Projects</h2>
      {{#each cv.sections.projects}}
        <div class="experience-item">
          <div class="company-school">
            <div class="project-name">{{this.name}}</div>
            <div class="item-date">{{this.period}}</div>
          </div>
          {{#if this.role}}
            <div class="project-role">{{this.role}}</div>
          {{/if}}
          {{#if this.description}}
            <div class="project-details">{{{this.description}}}</div>
          {{/if}}
          {{#if this.technologies}}
            <div class="project-details"><strong>Technologies:</strong> {{this.technologies}}</div>
          {{/if}}
          {{#if this.url}}
            <div class="project-details"><strong>URL:</strong> <a href="{{this.url}}" target="_blank">{{this.url}}</a></div>
          {{/if}}
          {{#if this.github}}
            <div class="project-details"><strong>GitHub:</strong> <a href="{{this.github}}" target="_blank">{{this.github}}</a></div>
          {{/if}}
        </div>
      {{/each}}
    </section>
  {{/if}}
  
  {{#if cv.sections.certifications}}
    <section>
      <h2 class="section-title">Certifications</h2>
      {{#each cv.sections.certifications}}
        <div class="item">
          <div class="item-header">
            <div class="item-title">{{this.name}}</div>
            <div class="item-date">{{this.date}}</div>
          </div>
          <div class="item-subtitle">{{this.issuer}}</div>
          <div class="item-content">{{{this.description}}}</div>
        </div>
      {{/each}}
    </section>
  {{/if}}
  
  {{#if cv.sections.skills}}
    <section>
      <h2 class="section-title">Skills</h2>
      <div class="skills-list">
        {{#each cv.sections.skills}}
          <div class="skill-item">{{this.name}}</div>
        {{/each}}
      </div>
    </section>
  {{/if}}
</div>
`;

// Default CSS
const defaultCss = `
body {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  margin: 0;
  padding: 0;
}

.resume {
  max-width: 800px;
  margin: 0 auto;
  padding: 30px;
  border: none !important;
}

header {
  text-align: center;
  margin-bottom: 30px;
  border: none !important;
}

h1 {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 10px 0;
  color: #000;
}

.job-title {
  font-size: 18px;
  color: #555;
  margin: 0 0 15px 0;
}

.contact-info {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 8px;
  font-size: 14px;
  border: none !important;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 30px 0 15px;
  border: none !important;
  padding-bottom: 8px;
  color: #000;
}

section {
  border: none !important;
}

.item {
  margin-bottom: 20px;
  border: none !important;
}

.item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  border: none !important;
}

.item-title {
  font-weight: 600;
  font-size: 16px;
  border: none !important;
}

.item-date {
  color: #555;
  border: none !important;
}

.item-subtitle {
  font-style: italic;
  color: #555;
  margin-bottom: 5px;
  font-size: 14px;
  border: none !important;
}

.item-content {
  font-size: 14px;
  border: none !important;
  margin-bottom: 4px;
}

/* Project-specific styles */
.project-role {
  font-weight: 500 !important;
  font-style: italic;
  color: #444;
  margin: 4px 0;
}

.project-details {
  margin-top: 5px;
  margin-bottom: 5px;
}

.project-name {
  font-weight: bold;
}

.summary {
  margin-bottom: 30px;
  text-align: justify;
  font-size: 14px;
  border: none !important;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  border: none !important;
}

.skill-item {
  background-color: transparent;
  padding: 5px 12px;
  border-radius: 16px;
  font-size: 13px;
  border: none !important;
}
`;
