const fs = require('fs');
const path = require('path');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');

// Helper function to load template
const getTemplate = (templateName) => {
  const templatesDir = path.join(__dirname, '../templates');
  // In a real app, you'd have HTML/CSS templates saved in the templates directory
  // For now, we'll use simple formatting based on the template name
  return templateName;
};

// Generate PDF from resume data
exports.generatePdf = async (resume) => {
  try {
    // Simple PDF generation for now
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Add some basic content
    page.drawText(`Resume: ${resume.title}`, {
      x: 50,
      y: height - 50,
      size: 24,
      font
    });
    
    // Add personal information
    if (resume.data && resume.data.name) {
      page.drawText(`Name: ${resume.data.name}`, {
        x: 50,
        y: height - 100,
        size: 12,
        font
      });
    }
    
    if (resume.data && resume.data.email) {
      page.drawText(`Email: ${resume.data.email}`, {
        x: 50,
        y: height - 120,
        size: 12,
        font
      });
    }
    
    // Generate PDF buffer
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF');
  }
};

// Generate DOCX from resume data
exports.generateDocx = async (resume) => {
  try {
    // Create document
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: resume.title,
            heading: HeadingLevel.HEADING_1
          }),
          
          // Add personal information
          ...(resume.data && resume.data.name ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: `Name: ${resume.data.name}`,
                  bold: true
                })
              ]
            })
          ] : []),
          
          ...(resume.data && resume.data.email ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: `Email: ${resume.data.email}`
                })
              ]
            })
          ] : [])
          
          // More content would be added based on resume structure
        ]
      }]
    });
    
    // Generate DOCX buffer
    return await Packer.toBuffer(doc);
  } catch (error) {
    console.error('DOCX generation error:', error);
    throw new Error('Failed to generate DOCX');
  }
};

// Helper function to split text into lines that fit within a given width
function splitTextToLines(text, font, fontSize, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, fontSize);
    
    if (width <= maxWidth) {
      currentLine = testLine;
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
