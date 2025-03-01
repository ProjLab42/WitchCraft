const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');

// Generate PDF from resume data
exports.generatePdf = async (resume) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const { width, height } = page.getSize();
  const margin = 50;
  let y = height - margin;
  const lineHeight = 15;
  
  // Helper function to add text
  const addText = (text, { isBold = false, fontSize = 12, indent = 0 } = {}) => {
    const currentFont = isBold ? boldFont : font;
    page.drawText(text, {
      x: margin + indent,
      y,
      font: currentFont,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    y -= lineHeight;
  };
  
  // Add header
  addText(resume.data.name, { isBold: true, fontSize: 18 });
  y -= 5;
  addText(resume.data.jobTitle, { fontSize: 14 });
  y -= 5;
  
  // Add contact info
  const contactInfo = [
    resume.data.email,
    resume.data.phone,
    resume.data.linkedin,
    resume.data.website
  ].filter(Boolean).join(' | ');
  
  addText(contactInfo, { fontSize: 10 });
  y -= 10;
  
  // Add summary
  if (resume.data.summary) {
    addText('SUMMARY', { isBold: true, fontSize: 14 });
    y -= 5;
    
    // Split summary into lines to fit page width
    const summaryLines = splitTextToLines(resume.data.summary, font, 10, width - 2 * margin);
    summaryLines.forEach(line => {
      addText(line, { fontSize: 10 });
    });
    y -= 10;
  }
  
  // Add experience
  if (resume.data.experiences && resume.data.experiences.length > 0) {
    addText('EXPERIENCE', { isBold: true, fontSize: 14 });
    y -= 5;
    
    resume.data.experiences.forEach(exp => {
      addText(exp.company, { isBold: true, fontSize: 12 });
      addText(`${exp.position} (${exp.startDate} - ${exp.endDate})`, { fontSize: 10 });
      
      // Split description into lines
      const descLines = splitTextToLines(exp.description, font, 10, width - 2 * margin - 10);
      descLines.forEach(line => {
        addText(line, { fontSize: 10, indent: 10 });
      });
      y -= 10;
    });
  }
  
  // Add education
  if (resume.data.education && resume.data.education.length > 0) {
    addText('EDUCATION', { isBold: true, fontSize: 14 });
    y -= 5;
    
    resume.data.education.forEach(edu => {
      addText(edu.school, { isBold: true, fontSize: 12 });
      addText(`${edu.degree} in ${edu.field} (${edu.startDate} - ${edu.endDate})`, { fontSize: 10 });
      y -= 10;
    });
  }
  
  // Add skills
  if (resume.data.skills) {
    addText('SKILLS', { isBold: true, fontSize: 14 });
    y -= 5;
    addText(resume.data.skills, { fontSize: 10 });
    y -= 10;
  }
  
  // Add languages
  if (resume.data.languages) {
    addText('LANGUAGES', { isBold: true, fontSize: 14 });
    y -= 5;
    addText(resume.data.languages, { fontSize: 10 });
  }
  
  return pdfDoc.save();
};

// Generate DOCX from resume data
exports.generateDocx = async (resume) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Name
        new Paragraph({
          text: resume.data.name,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        }),
        
        // Job Title
        new Paragraph({
          text: resume.data.jobTitle,
          alignment: AlignmentType.CENTER,
        }),
        
        // Contact Info
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: [
                resume.data.email,
                resume.data.phone,
                resume.data.linkedin,
                resume.data.website
              ].filter(Boolean).join(' | '),
              size: 20,
            }),
          ],
        }),
        
        // Summary
        ...(resume.data.summary ? [
          new Paragraph({}),
          new Paragraph({
            text: 'SUMMARY',
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: resume.data.summary,
          }),
        ] : []),
        
        // Experience
        ...(resume.data.experiences && resume.data.experiences.length > 0 ? [
          new Paragraph({}),
          new Paragraph({
            text: 'EXPERIENCE',
            heading: HeadingLevel.HEADING_2,
          }),
          ...resume.data.experiences.flatMap(exp => [
            new Paragraph({
              text: exp.company,
              heading: HeadingLevel.HEADING_3,
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `${exp.position} (${exp.startDate} - ${exp.endDate})`,
                  bold: true,
                }),
              ],
            }),
            new Paragraph({
              text: exp.description,
              indent: {
                left: 720, // 0.5 inches in twips
              },
            }),
            new Paragraph({}),
          ]),
        ] : []),
        
        // Education
        ...(resume.data.education && resume.data.education.length > 0 ? [
          new Paragraph({}),
          new Paragraph({
            text: 'EDUCATION',
            heading: HeadingLevel.HEADING_2,
          }),
          ...resume.data.education.flatMap(edu => [
            new Paragraph({
              text: edu.school,
              heading: HeadingLevel.HEADING_3,
            }),
            new Paragraph({
              text: `${edu.degree} in ${edu.field} (${edu.startDate} - ${edu.endDate})`,
            }),
            new Paragraph({}),
          ]),
        ] : []),
        
        // Skills
        ...(resume.data.skills ? [
          new Paragraph({}),
          new Paragraph({
            text: 'SKILLS',
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: resume.data.skills,
          }),
        ] : []),
        
        // Languages
        ...(resume.data.languages ? [
          new Paragraph({}),
          new Paragraph({
            text: 'LANGUAGES',
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: resume.data.languages,
          }),
        ] : []),
      ],
    }],
  });
  
  return doc.save();
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
