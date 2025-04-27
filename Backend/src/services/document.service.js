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
        
        // Process description - check for bullet points (list items)
        let description = exp.description || '';
        
        // Check if description contains HTML bullet points
        if (description.includes('<li>')) {
          // Extract list items
          const listItemRegex = /<li>(.*?)<\/li>/g;
          const matches = [...description.matchAll(listItemRegex)];
          
          if (matches.length > 0) {
            for (const match of matches) {
              const listItemText = match[1].replace(/<[^>]*>/g, ''); // Remove any nested HTML
              
              // Draw bullet point
              page.drawText('•', {
                x: leftMargin + 10,
                y: yPosition,
                size: 10,
                font
              });
              
              // Draw list item text with indent
              const maxCharsPerLine = 75; // Slightly shorter for bullet points to account for indent
              const listLines = splitTextToLines(listItemText, maxCharsPerLine);
              for (let i = 0; i < listLines.length; i++) {
                const line = listLines[i];
                const xPos = i === 0 ? leftMargin + 25 : leftMargin + 25; // Indent for bullet points
                
                page.drawText(line, {
                  x: xPos,
                  y: yPosition,
                  size: 10,
                  font
                });
                yPosition -= lineHeight;
                
                if (yPosition < 100) {
                  page = pdfDoc.addPage();
                  yPosition = height - 50;
                }
              }
            }
            continue; // Skip the regular text processing
          }
        }
        
        // If no bullets detected, process as normal text
        // Split description into lines to avoid text overflow
        const maxCharsPerLine = 80;
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
        
        // Check if description contains bullet points
        const description = exp.description || '';
        if (description.includes('<li>')) {
          // Extract list items
          const listItemRegex = /<li>(.*?)<\/li>/g;
          const matches = [...description.matchAll(listItemRegex)];
          
          if (matches.length > 0) {
            for (const match of matches) {
              const listItemText = match[1].replace(/<[^>]*>/g, ''); // Remove any nested HTML
              
              sections.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: '• ' }),
                    new TextRun({ text: listItemText })
                  ],
                  indent: { left: 720 } // 0.5 inch indent (720 = 0.5 inch in twips)
                })
              );
            }
          }
        } else {
          // Regular description without bullet points
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: description
                })
              ]
            })
          );
        }
        
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
function splitTextToLines(text, maxChars) {
  if (!text) return [];
  
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    
    if (testLine.length <= maxChars || currentLine === '') {
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
