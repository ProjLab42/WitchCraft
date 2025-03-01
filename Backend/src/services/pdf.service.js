const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const puppeteer = require('puppeteer');

// Get HTML template and compile with CV data
const generateHTML = async (cv, template) => {
  try {
    // Compile template with handlebars
    const compiledTemplate = handlebars.compile(template.html);
    
    // Prepare data object
    const data = {
      cv: {
        personalInfo: cv.personalInfo,
        education: cv.education,
        experience: cv.experience,
        skills: cv.skills,
        languages: cv.languages,
        projects: cv.projects,
        certifications: cv.certifications,
        customSections: cv.customSections
      },
      styles: template.css
    };
    
    // Generate HTML
    const html = compiledTemplate(data);
    return html;
  } catch (error) {
    console.error('HTML generation error:', error);
    throw new Error('Failed to generate HTML');
  }
};

// Generate PDF from CV data
exports.generatePDF = async (cv, template) => {
  try {
    const html = await generateHTML(cv, template);
    
    // Launch puppeteer
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1cm',
        right: '1cm',
        bottom: '1cm',
        left: '1cm'
      }
    });
    
    await browser.close();
    return pdfBuffer;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF');
  }
};
