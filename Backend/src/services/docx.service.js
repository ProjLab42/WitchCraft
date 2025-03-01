const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, BorderStyle } = require('docx');

// Generate DOCX from CV data
exports.generateDOCX = async (cv) => {
  try {
    // Create document
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Header with name and job title
          new Paragraph({
            text: cv.personalInfo.fullName,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER
          }),
          
          new Paragraph({
            text: cv.personalInfo.jobTitle || '',
            heading: HeadingLevel.HEADING_3,
            alignment: AlignmentType.CENTER
          }),
          
          // Contact info
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `${cv.personalInfo.email || ''} | ${cv.personalInfo.phone || ''} | ${cv.personalInfo.address || ''}`,
                size: 20
              })
            ]
          }),
          
          // Summary
          ...(cv.personalInfo.summary ? [
            new Paragraph({ text: '' }),
            new Paragraph({
              text: 'SUMMARY',
              heading: HeadingLevel.HEADING_2
            }),
            new Paragraph({
              text: cv.personalInfo.summary
            })
          ] : []),
          
          // Experience
          ...(cv.experience && cv.experience.length > 0 ? [
            new Paragraph({ text: '' }),
            new Paragraph({
              text: 'EXPERIENCE',
              heading: HeadingLevel.HEADING_2
            }),
            ...cv.experience.flatMap(exp => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: exp.position,
                    bold: true
                  }),
                  new TextRun({
                    text: ` at ${exp.company}`,
                    bold: true
                  })
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${formatDate(exp.startDate)} - ${exp.current ? 'Present' : formatDate(exp.endDate)}`
                  }),
                  exp.location ? new TextRun({
                    text: ` | ${exp.location}`
                  }) : new TextRun('')
                ]
              }),
              new Paragraph({
                text: exp.description || ''
              }),
              new Paragraph({ text: '' })
            ])
          ] : []),
          
          // Education
          ...(cv.education && cv.education.length > 0 ? [
            new Paragraph({ text: '' }),
            new Paragraph({
              text: 'EDUCATION',
              heading: HeadingLevel.HEADING_2
            }),
            ...cv.education.flatMap(edu => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: edu.degree,
                    bold: true
                  }),
                  edu.field ? new TextRun({
                    text: ` in ${edu.field}`,
                    bold: true
                  }) : new TextRun('')
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: edu.institution
                  }),
                  new TextRun({
                    text: ` | ${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}`
                  })
                ]
              }),
              new Paragraph({
                text: edu.description || ''
              }),
              new Paragraph({ text: '' })
            ])
          ] : []),
          
          // Skills
          ...(cv.skills && cv.skills.length > 0 ? [
            new Paragraph({ text: '' }),
            new Paragraph({
              text: 'SKILLS',
              heading: HeadingLevel.HEADING_2
            }),
            new Paragraph({
              text: cv.skills.map(s => s.name).join(' • ')
            })
          ] : [])
          
          // Additional sections would be added here
        ]
      }]
    });
    
    // Generate buffer
    const buffer = await Packer.toBuffer(doc);
    return buffer;
  } catch (error) {
    console.error('DOCX generation error:', error);
    throw new Error('Failed to generate DOCX');
  }
};

// Format date helper
function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'short' };
  return date.toLocaleDateString('en-US', options);
}
