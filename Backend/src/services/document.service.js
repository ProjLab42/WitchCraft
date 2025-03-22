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
    // Log what we're generating
    console.log('Generating basic PDF for resume using pdf-lib:', {
      title: resume.title,
      dataKeys: Object.keys(resume.data || {})
    });
    
    // Simple PDF generation for now
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    let yPosition = height - 50;
    const leftMargin = 50;
    const rightMargin = width - 50;
    const lineHeight = 20;
    
    // Add title
    page.drawText(`${resume.title}`, {
      x: leftMargin,
      y: yPosition,
      size: 24,
      font: boldFont
    });
    
    yPosition -= lineHeight * 2;
    
    // Add personal information
    if (resume.data && resume.data.name) {
      page.drawText(`Name: ${resume.data.name}`, {
        x: leftMargin,
        y: yPosition,
        size: 12,
        font
      });
      yPosition -= lineHeight;
    }
    
    if (resume.data && resume.data.jobTitle) {
      page.drawText(`Title: ${resume.data.jobTitle}`, {
        x: leftMargin,
        y: yPosition,
        size: 12,
        font
      });
      yPosition -= lineHeight;
    }
    
    if (resume.data && resume.data.email) {
      page.drawText(`Email: ${resume.data.email}`, {
        x: leftMargin,
        y: yPosition,
        size: 12,
        font
      });
      yPosition -= lineHeight;
    }
    
    if (resume.data && resume.data.phone) {
      page.drawText(`Phone: ${resume.data.phone}`, {
        x: leftMargin,
        y: yPosition,
        size: 12,
        font
      });
      yPosition -= lineHeight;
    }
    
    if (resume.data && resume.data.location) {
      page.drawText(`Location: ${resume.data.location}`, {
        x: leftMargin,
        y: yPosition,
        size: 12,
        font
      });
      yPosition -= lineHeight;
    }
    
    yPosition -= lineHeight;
    
    // Add experience section
    if (resume.sections && resume.sections.experience && resume.sections.experience.length > 0) {
      page.drawText('Experience', {
        x: leftMargin,
        y: yPosition,
        size: 16,
        font: boldFont
      });
      yPosition -= lineHeight;
      
      for (const exp of resume.sections.experience) {
        if (yPosition < 100) {
          // Add a new page if we're running out of space
          page = pdfDoc.addPage();
          yPosition = height - 50;
        }
        
        page.drawText(`${exp.company} - ${exp.title}`, {
          x: leftMargin,
          y: yPosition,
          size: 12,
          font: boldFont
        });
        yPosition -= lineHeight;
        
        page.drawText(`${exp.period}`, {
          x: leftMargin,
          y: yPosition,
          size: 10,
          font
        });
        yPosition -= lineHeight;
        
        // Split description into lines to avoid text overflow
        const maxCharsPerLine = 80;
        let description = exp.description || '';
        while (description.length > 0 && yPosition > 100) {
          const lineText = description.substring(0, maxCharsPerLine);
          page.drawText(lineText, {
            x: leftMargin,
            y: yPosition,
            size: 10,
            font
          });
          description = description.substring(Math.min(lineText.length, description.length));
          yPosition -= lineHeight;
        }
        
        yPosition -= lineHeight;
      }
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
    // Log what we're generating
    console.log('Generating DOCX for resume:', {
      title: resume.title,
      dataKeys: Object.keys(resume.data || {})
    });
    
    // Create sections array
    const sections = [];
    
    // Add title
    sections.push(
      new Paragraph({
        text: resume.title || 'Resume',
        heading: HeadingLevel.HEADING_1
      })
    );
    
    // Add personal information
    if (resume.data) {
      // Name
      if (resume.data.name) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Name: ${resume.data.name}`,
                bold: true
              })
            ]
          })
        );
      }
      
      // Job Title
      if (resume.data.jobTitle) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Title: ${resume.data.jobTitle}`
              })
            ]
          })
        );
      }
      
      // Email
      if (resume.data.email) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Email: ${resume.data.email}`
              })
            ]
          })
        );
      }
      
      // Phone
      if (resume.data.phone) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Phone: ${resume.data.phone}`
              })
            ]
          })
        );
      }
      
      // Location
      if (resume.data.location) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Location: ${resume.data.location}`
              })
            ]
          })
        );
      }
      
      // Add a spacer
      sections.push(new Paragraph({}));
    }
    
    // Add experience section
    if (resume.sections && resume.sections.experience && resume.sections.experience.length > 0) {
      sections.push(
        new Paragraph({
          text: 'Experience',
          heading: HeadingLevel.HEADING_2
        })
      );
      
      for (const exp of resume.sections.experience) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${exp.company} - ${exp.title}`,
                bold: true
              })
            ]
          })
        );
        
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: exp.period || '',
                italics: true
              })
            ]
          })
        );
        
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: exp.description || ''
              })
            ]
          })
        );
        
        // Add a spacer
        sections.push(new Paragraph({}));
      }
    }
    
    // Create document
    const doc = new Document({
      sections: [{
        properties: {},
        children: sections
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
