const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const handlebars = require('handlebars');

// Register the same Handlebars helpers as in pdf.service.js
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

handlebars.registerHelper('isArray', function(value, options) {
  if (Array.isArray(value)) {
    return options.fn(this);
  }
  return options.inverse(this);
});

// Create a sample resume data object similar to what's stored in MongoDB
const sampleResume = {
  _id: 'test-resume-id',
  title: 'Sample Resume',
  template: 'Modern Professional',
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
    skills: [
      { id: 'skill1', name: 'JavaScript', level: 90 },
      { id: 'skill2', name: 'React', level: 85 },
      { id: 'skill3', name: 'Node.js', level: 80 }
    ]
  }
};

// Template object similar to what's used in pdf.service.js
const sampleTemplate = {
  name: 'Modern Professional',
  html: `
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
          
          {{#if personalInfo.summary}}
          <div class="summary">
            <p>{{personalInfo.summary}}</p>
          </div>
          {{/if}}
        </div>
        
        <!-- Sections -->
        {{#each sections}}
          {{#if (eq this.itemType "experience")}}
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
          {{/if}}
          
          {{#if (eq this.itemType "education")}}
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
          {{/if}}
        {{/each}}
        
        <!-- Skills Section -->
        {{#if selectedSkills}}
        <div class="section">
          <h2 class="section-title">Skills</h2>
          <div class="skills-content">
            {{#each selectedSkills}}
              <span class="skill">{{this.name}}</span>
            {{/each}}
          </div>
        </div>
        {{/if}}
      {{/with}}
    </div>
  `,
  css: `
    .resume {
      font-family: 'Inter', Arial, sans-serif;
      color: #333;
      line-height: 1.5;
    }
    
    .header {
      margin-bottom: 20px;
      text-align: center;
    }
    
    .name {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .title {
      font-size: 18px;
      margin-bottom: 10px;
    }
    
    .contact-info span {
      margin: 0 10px;
    }
    
    .links span {
      display: block;
      margin: 5px 0;
    }
    
    .summary {
      margin: 15px 0;
      text-align: left;
    }
    
    .section {
      margin-bottom: 20px;
    }
    
    .section-title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 10px;
      border-bottom: 1px solid #ddd;
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
    }
    
    .item-subtitle {
      font-style: italic;
      margin-bottom: 5px;
    }
    
    .skills-content {
      display: flex;
      flex-wrap: wrap;
    }
    
    .skill {
      background: #f5f5f5;
      padding: 5px 10px;
      border-radius: 3px;
      margin: 0 5px 5px 0;
    }
  `
};

// Compile resume data for template
async function prepareResumeData(resume) {
  // Map data from MongoDB schema to template-friendly structure
  const personalInfo = {
    name: resume.data?.name || '',
    title: resume.data?.jobTitle || '',
    email: resume.data?.email || '',
    phone: resume.data?.phone || '',
    location: resume.data?.location || '',
    summary: resume.data?.summary || '',
    links: {
      linkedin: resume.data?.linkedin || '',
      portfolio: resume.data?.website || ''
    }
  };
  
  // Process sections to match expected format
  const processedSections = [];
  
  if (resume.sections) {
    if (resume.sections.experience && Array.isArray(resume.sections.experience)) {
      processedSections.push(...resume.sections.experience.map(item => ({
        ...item,
        itemType: 'experience'
      })));
    }
    
    if (resume.sections.education && Array.isArray(resume.sections.education)) {
      processedSections.push(...resume.sections.education.map(item => ({
        ...item,
        itemType: 'education'
      })));
    }
  }
  
  // Ensure skills are properly formatted
  const skills = Array.isArray(resume.sections.skills) ? resume.sections.skills : [];
  
  return {
    cv: {
      personalInfo,
      sections: processedSections,
      selectedSkills: skills,
      title: resume.title || 'Resume'
    },
    styles: sampleTemplate.css
  };
}

// Generate HTML from resume data and template
async function generateHTML(resumeData, template) {
  // Compile template
  const compiledTemplate = handlebars.compile(template.html);
  
  // Generate HTML
  const html = compiledTemplate(resumeData);
  
  // Wrap with complete HTML document
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${resumeData.cv.title}</title>
      <style>
        ${resumeData.styles}
        body {
          font-family: 'Inter', Arial, sans-serif;
          line-height: 1.5;
          color: #000;
          margin: 0;
          padding: 0;
        }
        .resume-container {
          padding: 20mm;
          margin: 0 auto;
        }
        * {
          -webkit-user-select: text;
          user-select: text;
        }
        .resume-container * {
          background-image: none !important;
        }
      </style>
    </head>
    <body>
      <div class="resume-container">
        ${html}
      </div>
    </body>
    </html>
  `;
}

// Main function to generate a test PDF
async function generateTestResumePDF() {
  console.log('Starting test resume PDF generation...');
  
  let browser;
  
  try {
    // Prepare resume data
    const resumeData = await prepareResumeData(sampleResume);
    console.log('Resume data prepared:', JSON.stringify(resumeData, null, 2).substring(0, 300) + '...');
    
    // Generate HTML
    const html = await generateHTML(resumeData, sampleTemplate);
    console.log('HTML generated, size:', html.length, 'bytes');
    
    // Save HTML to file for inspection
    const htmlPath = path.join(__dirname, 'test-resume.html');
    fs.writeFileSync(htmlPath, html);
    console.log(`HTML saved to: ${htmlPath}`);
    
    // Launch browser with similar config to pdf.service.js
    console.log('Launching browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--font-render-hinting=none'
      ],
      timeout: 30000
    });
    
    const page = await browser.newPage();
    
    // Set viewport to match A4
    await page.setViewport({
      width: 794,
      height: 1123,
      deviceScaleFactor: 2
    });
    
    console.log('Setting HTML content...');
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Generate PDF
    console.log('Generating PDF...');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      preferCSSPageSize: true,
      tagged: true
    });
    
    // Save the PDF to file
    const outputPath = path.join(__dirname, 'test-resume.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);
    
    console.log(`PDF generated successfully: ${outputPath}`);
    console.log(`PDF size: ${pdfBuffer.length} bytes`);
    
    return { success: true, path: outputPath, size: pdfBuffer.length };
  } catch (error) {
    console.error('Error generating test resume PDF:', error);
    return { success: false, error: error.message };
  } finally {
    // Close the browser
    if (browser) {
      console.log('Closing browser...');
      await browser.close();
    }
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  generateTestResumePDF()
    .then(result => {
      if (result.success) {
        console.log('Test completed successfully');
      } else {
        console.error('Test failed:', result.error);
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('Unexpected error:', err);
      process.exit(1);
    });
} else {
  // Export the functions for use in other tests
  module.exports = {
    generateTestResumePDF,
    prepareResumeData,
    generateHTML
  };
} 