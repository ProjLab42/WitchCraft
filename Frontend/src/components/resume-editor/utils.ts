import * as docx from 'docx';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import { ResumeContent, SkillItem } from './ResumeContext';

// Get page dimensions based on format
export const getPageDimensions = (format: string) => {
  switch (format) {
    case 'A4':
      return { width: 210, height: 297 }; // mm
    case 'Letter':
      return { width: 215.9, height: 279.4 }; // mm
    case 'Legal':
      return { width: 215.9, height: 355.6 }; // mm
    default:
      return { width: 210, height: 297 }; // A4 default
  }
};

// Generate a unique ID
export const generateId = (prefix: string) => {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};

// Export resume as PDF
export const exportAsPDF = async (
  resumeRef: React.RefObject<HTMLDivElement>,
  pageFormat: string
) => {
  if (!resumeRef.current) return;
  
  try {
    const dimensions = getPageDimensions(pageFormat);
    const scale = 2; // Higher scale for better quality
    
    // Create a clone of the resume element to avoid modifying the original
    const resumeClone = resumeRef.current.cloneNode(true) as HTMLElement;
    
    // Set the clone's style to ensure proper rendering
    resumeClone.style.transform = 'scale(1)';
    resumeClone.style.width = `${dimensions.width}mm`;
    resumeClone.style.height = 'auto';
    resumeClone.style.position = 'absolute';
    resumeClone.style.top = '0';
    resumeClone.style.left = '0';
    resumeClone.style.zIndex = '-9999';
    
    // Append to body temporarily
    document.body.appendChild(resumeClone);
    
    // Capture as canvas
    const canvas = await html2canvas(resumeClone, {
      scale: scale,
      useCORS: true,
      allowTaint: true,
      scrollX: 0,
      scrollY: 0,
    });
    
    // Remove the clone
    document.body.removeChild(resumeClone);
    
    // Calculate PDF dimensions
    const imgWidth = dimensions.width;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
      unit: 'mm',
      format: pageFormat,
    });
    
    // Add image to PDF
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    
    // Save PDF
    pdf.save('resume.pdf');
    
    return true;
  } catch (error) {
    console.error('Error exporting PDF:', error);
    return false;
  }
};

// Export resume as DOCX
export const exportAsDOCX = async (
  resumeContent: ResumeContent,
  pageFormat: string
) => {
  try {
    // Get page dimensions
    const dimensions = getPageDimensions(pageFormat);
    
    // Create sections array for the document
    const docSections: docx.Paragraph[] = [];
    
    // Add personal info section
    const { personalInfo } = resumeContent;
    
    // Name
    docSections.push(
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: personalInfo.name,
            bold: true,
            size: 36,
            font: "Inter",
          }),
        ],
        alignment: docx.AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
    
    // Title
    docSections.push(
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: personalInfo.title,
            size: 28,
            font: "Inter",
          }),
        ],
        alignment: docx.AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
    
    // Contact info
    const contactInfo = [];
    if (personalInfo.email) contactInfo.push(personalInfo.email);
    if (personalInfo.location) contactInfo.push(personalInfo.location);
    
    docSections.push(
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: contactInfo.join(' | '),
            size: 24,
            font: "Inter",
          }),
        ],
        alignment: docx.AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    );
    
    // Links
    if (personalInfo.links) {
      const links = [];
      if (personalInfo.links.linkedin) links.push(personalInfo.links.linkedin);
      if (personalInfo.links.portfolio) links.push(personalInfo.links.portfolio);
      
      if (personalInfo.links.additionalLinks) {
        personalInfo.links.additionalLinks.forEach(link => {
          links.push(link.url);
        });
      }
      
      if (links.length > 0) {
        docSections.push(
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: links.join(' | '),
                size: 24,
                font: "Inter",
              }),
            ],
            alignment: docx.AlignmentType.CENTER,
            spacing: { after: 400 },
          })
        );
      }
    }
    
    // Calculate content density to adjust spacing
    const contentDensity = Math.min(10, Math.max(1, 
      (resumeContent.sections.length + (resumeContent.selectedSkills.length > 0 ? 1 : 0)) / 3));
    
    // Add each section
    const sectionSpacing = 400;
    const itemSpacing = 200;
    
    // Get ordered sections
    const orderedSections = resumeContent.sectionOrder.length > 0 
      ? resumeContent.sectionOrder 
      : ['experience', 'education', 'skills', 'projects', 'certifications'];
    
    // Group sections by type
    const groupedSections = resumeContent.sections.reduce((acc, section) => {
      if (!acc[section.itemType]) {
        acc[section.itemType] = [];
      }
      acc[section.itemType].push(section);
      return acc;
    }, {} as Record<string, any[]>);
    
    // Process sections in order
    orderedSections.forEach((sectionType, sectionIndex) => {
      const isLastSection = sectionIndex === orderedSections.length - 1;
      
      // Handle skills section
      if (sectionType === 'skills' && resumeContent.selectedSkills.length > 0) {
        // Skills section title
        docSections.push(
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: "Skills",
                bold: true,
                size: 28,
                font: "Inter",
              }),
            ],
            spacing: { before: sectionSpacing, after: 200 },
          })
        );
        
        // Skills list
        const skillsText = resumeContent.selectedSkills
          .map(skill => skill.name)
          .join(' • ');
        
        docSections.push(
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: skillsText,
                size: 24,
                font: "Inter",
              }),
            ],
            spacing: { after: isLastSection ? sectionSpacing * 2 : sectionSpacing },
          })
        );
      } 
      // Handle other sections
      else if (groupedSections[sectionType] && groupedSections[sectionType].length > 0) {
        const sectionItems = groupedSections[sectionType];
        const sectionTitle = sectionType.charAt(0).toUpperCase() + sectionType.slice(1);
        
        // Section title
        docSections.push(
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: sectionTitle,
                bold: true,
                size: 28,
                font: "Inter",
              }),
            ],
            spacing: { before: sectionSpacing, after: 200 },
          })
        );
        
        // Calculate item spacing based on content density
        const itemCount = sectionItems.length;
        const adjustedItemSpacing = Math.max(
          itemSpacing / 2,
          (dimensions.height - 
            (sectionSpacing * 2) / Math.max(1, itemCount)));
        
        sectionItems.forEach((item, itemIndex) => {
          const isLastItem = itemIndex === sectionItems.length - 1;
          const afterSpacing = isLastItem && isLastSection 
            ? sectionSpacing * 2  // Extra space after last item in last section
            : isLastItem 
              ? sectionSpacing    // Space after last item in a section
              : itemSpacing;      // Space between items
          
          // Item font sizes - larger for less content
          const itemTitleSize = Math.max(16, Math.min(24, 28 - contentDensity * 2));
          const itemSubtitleSize = Math.max(14, Math.min(20, 24 - contentDensity * 2));
          const itemTextSize = Math.max(12, Math.min(16, 20 - contentDensity * 2));
          
          if (sectionType === 'experience') {
            // Company and period
            docSections.push(
              new docx.Paragraph({
                children: [
                  new docx.TextRun({
                    text: item.company,
                    bold: true,
                    size: itemTitleSize,
                    font: "Inter",
                  }),
                  new docx.TextRun({
                    text: `  ${item.period}`,
                    size: itemTextSize,
                    font: "Inter",
                  }),
                ],
                spacing: { before: itemSpacing / 2 },
              })
            );
            
            // Job title
            docSections.push(
              new docx.Paragraph({
                children: [
                  new docx.TextRun({
                    text: item.title,
                    italics: true,
                    size: itemSubtitleSize,
                    font: "Inter",
                  }),
                ],
                spacing: { before: 100 },
              })
            );
            
            // Description
            docSections.push(
              new docx.Paragraph({
                children: [
                  new docx.TextRun({
                    text: item.description,
                    size: itemTextSize,
                    font: "Inter",
                  }),
                ],
                spacing: { before: 100, after: afterSpacing },
              })
            );
          } else if (sectionType === 'education') {
            // Institution and period
            docSections.push(
              new docx.Paragraph({
                children: [
                  new docx.TextRun({
                    text: item.institution,
                    bold: true,
                    size: itemTitleSize,
                    font: "Inter",
                  }),
                  new docx.TextRun({
                    text: `  ${item.period}`,
                    size: itemTextSize,
                    font: "Inter",
                  }),
                ],
                spacing: { before: itemSpacing / 2 },
              })
            );
            
            // Degree
            docSections.push(
              new docx.Paragraph({
                children: [
                  new docx.TextRun({
                    text: item.degree,
                    italics: true,
                    size: itemSubtitleSize,
                    font: "Inter",
                  }),
                ],
                spacing: { before: 100 },
              })
            );
            
            // Description
            docSections.push(
              new docx.Paragraph({
                children: [
                  new docx.TextRun({
                    text: item.description,
                    size: itemTextSize,
                    font: "Inter",
                  }),
                ],
                spacing: { before: 100, after: afterSpacing },
              })
            );
          } else if (sectionType === 'projects') {
            // Project name and period
            docSections.push(
              new docx.Paragraph({
                children: [
                  new docx.TextRun({
                    text: item.name,
                    bold: true,
                    size: itemTitleSize,
                    font: "Inter",
                  }),
                  new docx.TextRun({
                    text: `  ${item.period}`,
                    size: itemTextSize,
                    font: "Inter",
                  }),
                ],
                spacing: { before: itemSpacing / 2 },
              })
            );
            
            // Role
            docSections.push(
              new docx.Paragraph({
                children: [
                  new docx.TextRun({
                    text: item.role,
                    italics: true,
                    size: itemSubtitleSize,
                    font: "Inter",
                  }),
                ],
                spacing: { before: 100 },
              })
            );
            
            // Description
            docSections.push(
              new docx.Paragraph({
                children: [
                  new docx.TextRun({
                    text: item.description,
                    size: itemTextSize,
                    font: "Inter",
                  }),
                ],
                spacing: { before: 100, after: afterSpacing },
              })
            );
          } else if (sectionType === 'certifications') {
            // Certification name and date
            docSections.push(
              new docx.Paragraph({
                children: [
                  new docx.TextRun({
                    text: item.name,
                    bold: true,
                    size: itemTitleSize,
                    font: "Inter",
                  }),
                  new docx.TextRun({
                    text: `  ${item.date}`,
                    size: itemTextSize,
                    font: "Inter",
                  }),
                ],
                spacing: { before: itemSpacing / 2 },
              })
            );
            
            // Issuer
            docSections.push(
              new docx.Paragraph({
                children: [
                  new docx.TextRun({
                    text: item.issuer,
                    italics: true,
                    size: itemSubtitleSize,
                    font: "Inter",
                  }),
                ],
                spacing: { before: 100 },
              })
            );
            
            // Description
            docSections.push(
              new docx.Paragraph({
                children: [
                  new docx.TextRun({
                    text: item.description,
                    size: itemTextSize,
                    font: "Inter",
                  }),
                ],
                spacing: { before: 100, after: afterSpacing },
              })
            );
          }
        });
      }
    });
    
    // Create document
    const doc = new docx.Document({
      sections: [
        {
          properties: {
            page: {
              size: {
                width: docx.convertMillimetersToTwip(dimensions.width),
                height: docx.convertMillimetersToTwip(dimensions.height),
              },
              margin: {
                top: docx.convertMillimetersToTwip(20),
                right: docx.convertMillimetersToTwip(20),
                bottom: docx.convertMillimetersToTwip(20),
                left: docx.convertMillimetersToTwip(20),
              },
            },
          },
          children: docSections,
        },
      ],
    });
    
    // Generate and save document
    docx.Packer.toBlob(doc).then(blob => {
      saveAs(blob, 'resume.docx');
    });
    
    return true;
  } catch (error) {
    console.error('Error exporting DOCX:', error);
    return false;
  }
}; 