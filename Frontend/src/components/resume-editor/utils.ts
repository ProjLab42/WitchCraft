import * as docx from 'docx';
import { saveAs } from 'file-saver';
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
  pageFormat: string,
  filename = 'resume'
) => {
  if (!resumeRef.current) return false;
  
  try {
    // Get or set an ID for the resume element
    let elementId = resumeRef.current.id;
    const needsTempId = !elementId;
    
    if (needsTempId) {
      elementId = 'temp-resume-export-id';
      resumeRef.current.id = elementId;
    }
    
    // Use the exportToPDF function which has better handling of the PDF generation
    const success = await exportToPDF(
      elementId,
      `${filename}.pdf`,
      pageFormat.toLowerCase()
    );
    
    // Clean up temporary ID if we created one
    if (needsTempId) {
      resumeRef.current.removeAttribute('id');
    }
    
    return success;
  } catch (error) {
    console.error('Error exporting PDF:', error);
    return false;
  }
};

// Export resume as DOCX
export const exportAsDOCX = async (
  resumeContent: ResumeContent,
  pageFormat: string,
  filename = 'resume'
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
      if (sectionType === 'skills' && resumeContent.skillsParagraph) {
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
        
        // Use the pre-generated skills paragraph
        docSections.push(
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: resumeContent.skillsParagraph,
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
      saveAs(blob, `${filename}.docx`);
    });
    
    return true;
  } catch (error) {
    console.error('Error exporting DOCX:', error);
    return false;
  }
};

/**
 * Detects overflow in the resume container and automatically scales content to fit
 * This handles the case when content exceeds the resume canvas dimensions
 * @param resumeRef - Reference to the resume container element
 * @param currentScale - Current scale/zoom level of the resume
 * @returns The adjusted scale factor to fit all content
 */
export const autoScaleResume = (resumeRef: React.RefObject<HTMLDivElement>, currentScale: number): number => {
  if (!resumeRef.current) return currentScale;
  
  const container = resumeRef.current;
  const containerHeight = 29.7 * 96 / 2.54; // A4 height in pixels (29.7cm)
  
  // Get the actual rendered content height (scrollHeight gets the total content height regardless of container size)
  const contentHeight = container.scrollHeight / currentScale;
  
  // If content exceeds container height, calculate scaling adjustment
  if (contentHeight > containerHeight) {
    // Calculate the ratio needed to fit content
    const scaleFactor = containerHeight / contentHeight;
    
    // Apply scale adjustment (limit to reasonable bounds - min 70% of current scale)
    const newScale = Math.max(currentScale * scaleFactor, currentScale * 0.7);
    
    console.log('Auto-scaling resume content:', {
      contentHeight,
      containerHeight,
      currentScale,
      scaleFactor,
      newScale
    });
    
    return newScale;
  }
  
  // No overflow, return the current scale
  return currentScale;
};

// Check if content is overflowing
export const isResumeOverflowing = (resumeRef: React.RefObject<HTMLDivElement>, currentScale: number): boolean => {
  if (!resumeRef.current) return false;
  
  const container = resumeRef.current;
  const containerHeight = 29.7 * 96 / 2.54; // A4 height in pixels (29.7cm)
  const contentHeight = container.scrollHeight / currentScale;
  
  return contentHeight > containerHeight;
};

// Apply font size adjustments to fit content
export const applyContentScaling = (
  container: HTMLElement,
  scalingFactor: number
): void => {
  if (!container || scalingFactor >= 1) return;

  // Apply scaling to all text elements
  const elements = container.querySelectorAll('*');
  
  // First pass - collect information about current sizes
  const fontSizes: {[key: string]: number} = {};
  const headingElements: HTMLElement[] = [];
  const nameElements: HTMLElement[] = [];
  
  elements.forEach(el => {
    const element = el as HTMLElement;
    const computedStyle = window.getComputedStyle(element);
    const fontSize = parseFloat(computedStyle.fontSize);
    
    // Save original font size for reference
    if (!isNaN(fontSize)) {
      const id = element.id || Math.random().toString(36).substring(2, 9);
      fontSizes[id] = fontSize;
      
      // Track special elements
      if (element.tagName.match(/^H[1-6]$/) || 
          element.classList.contains('font-semibold') || 
          element.classList.contains('font-bold')) {
        headingElements.push(element);
      }
      
      // Track name elements
      if (element.classList.contains('resume-name')) {
        nameElements.push(element);
      }
    }
  });
  
  // Prepare different scaling factors for different element types
  // Use a more gradual approach to prevent excessive scaling
  const headingScalingFactor = Math.min(1, scalingFactor + 0.1); // Less scaling for headings
  const nameScalingFactor = Math.min(1, scalingFactor + 0.15); // Even less scaling for names
  const subtitleScalingFactor = Math.min(1, scalingFactor + 0.05); // Slightly less scaling for subtitles
  const textScalingFactor = scalingFactor; // Full scaling for regular text

  // Second pass - scale elements while respecting minimums
  elements.forEach(el => {
    const element = el as HTMLElement;
    const computedStyle = window.getComputedStyle(element);
    
    // Special handling for headings and important elements
    const isHeading = element.tagName.match(/^H[1-6]$/) || 
                     element.classList.contains('resume-section-heading') ||
                     element.classList.contains('font-semibold') || 
                     element.classList.contains('font-bold');
                     
    const isName = element.classList.contains('resume-name');
    
    // Handle all section item titles
    const isItemTitle = element.classList.contains('project-name') || 
                       element.classList.contains('certification-name') ||
                       element.classList.contains('experience-company') ||
                       element.classList.contains('education-institution') ||
                       (element.classList.contains('font-medium') && 
                        (element.parentElement?.closest('.project') ||
                         element.parentElement?.closest('.certification') ||
                         element.parentElement?.closest('.experience') ||
                         element.parentElement?.closest('.education')));
    
    // Handle subtitle elements
    const isSubtitle = element.classList.contains('project-role') ||
                      element.classList.contains('certification-issuer') ||
                      element.classList.contains('experience-title') ||
                      element.classList.contains('education-degree') ||
                      element.classList.contains('italic');
                      
    // Handle skill items
    const isSkillItem = element.classList.contains('skill-item');
    
    // Choose the appropriate scaling factor based on element type
    let elementScalingFactor = textScalingFactor;
    if (isName) {
      elementScalingFactor = nameScalingFactor;
    } else if (isHeading || isItemTitle) {
      elementScalingFactor = headingScalingFactor;
    } else if (isSubtitle || isSkillItem) {
      elementScalingFactor = subtitleScalingFactor;
    }
                          
    // Scale font size with minimum thresholds
    const fontSize = parseFloat(computedStyle.fontSize);
    if (!isNaN(fontSize)) {
      let newSize = fontSize * elementScalingFactor;
      
      // Apply minimum sizes based on element type
      if (isName) {
        newSize = Math.max(newSize, 20); // Increased from 18px
      } else if (isHeading) {
        newSize = Math.max(newSize, 16); // Increased from 14px
      } else if (isItemTitle) {
        newSize = Math.max(newSize, 15); // Increased from 14px
      } else if (isSubtitle) {
        newSize = Math.max(newSize, 13); // Increased from 12px
      } else if (isSkillItem) {
        newSize = Math.max(newSize, 12); // Increased from 11px
      } else {
        newSize = Math.max(newSize, 11); // Increased from 9px
      }
      
      element.style.fontSize = `${newSize}px`;
    }

    // Adjust line height to maintain readability
    const lineHeight = parseFloat(computedStyle.lineHeight);
    if (!isNaN(lineHeight)) {
      // Keep line height proportionally the same or slightly increased for readability
      const lineHeightRatio = lineHeight / fontSize;
      // Ensure line height ratio doesn't drop below 1.2 for readability
      const adjustedRatio = Math.max(lineHeightRatio, 1.2);
      element.style.lineHeight = `${adjustedRatio}`;
    }

    // Scale margins - being careful with margins near content boundaries
    const marginBottom = parseFloat(computedStyle.marginBottom);
    if (!isNaN(marginBottom) && marginBottom > 0) {
      // Apply smaller scaling factor to margins to better preserve spacing
      // Use a progressive scale that's less aggressive than before
      const marginScaleFactor = marginBottom > 24 
        ? Math.min(0.95, scalingFactor * 0.95)  // Large margins scale less
        : Math.min(0.98, scalingFactor * 0.98); // Small margins barely scale
      
      const newMarginBottom = Math.max(marginBottom * marginScaleFactor, 3); // Increased minimum from 1px
      element.style.marginBottom = `${newMarginBottom}px`;
    }
    
    const marginTop = parseFloat(computedStyle.marginTop);
    if (!isNaN(marginTop) && marginTop > 0) {
      const marginScaleFactor = marginTop > 24 
        ? Math.min(0.95, scalingFactor * 0.95)
        : Math.min(0.98, scalingFactor * 0.98);
      
      const newMarginTop = Math.max(marginTop * marginScaleFactor, 3); // Increased minimum from 1px
      element.style.marginTop = `${newMarginTop}px`;
    }

    // Scale padding - minimal scaling to preserve whitespace
    const paddingBottom = parseFloat(computedStyle.paddingBottom);
    if (!isNaN(paddingBottom) && paddingBottom > 0) {
      // Padding scales even less to maintain spacing
      const paddingScaleFactor = Math.min(1, scalingFactor * 0.98);
      const newPaddingBottom = Math.max(paddingBottom * paddingScaleFactor, 3); // Increased minimum
      element.style.paddingBottom = `${newPaddingBottom}px`;
    }
    
    const paddingTop = parseFloat(computedStyle.paddingTop);
    if (!isNaN(paddingTop) && paddingTop > 0) {
      const paddingScaleFactor = Math.min(1, scalingFactor * 0.98);
      const newPaddingTop = Math.max(paddingTop * paddingScaleFactor, 3); // Increased minimum
      element.style.paddingTop = `${newPaddingTop}px`;
    }
  });

  // Handle specific elements that might need additional adjustments
  const headers = container.querySelectorAll('h1, h2, h3, h4, h5, h6, .resume-section-heading');
  headers.forEach(header => {
    const element = header as HTMLElement;
    
    // Ensure headers maintain their impact even when scaled
    const currentMarginBottom = parseFloat(window.getComputedStyle(element).marginBottom);
    // Preserve some minimal spacing for headers
    element.style.marginBottom = `${Math.max(currentMarginBottom, 8 * scalingFactor)}px`;
  });
  
  // Enforce consistent heading hierarchy
  // This ensures headings maintain proper size relationships
  const headingsByLevel: {[key: string]: HTMLElement[]} = {
    'h1': [],
    'h2': [],
    'h3': [],
    'h4': [],
    'h5': [],
    'h6': [],
    'other': []
  };
  
  headingElements.forEach(el => {
    const tagName = el.tagName.toLowerCase();
    if (headingsByLevel[tagName]) {
      headingsByLevel[tagName].push(el);
    } else {
      headingsByLevel['other'].push(el);
    }
  });
  
  // Apply minimum sizes for all section titles and item headings
  container.querySelectorAll(
    '.project-name, .certification-name, .experience-company, .education-institution, ' +
    '.font-medium, h4, .resume-section-heading'
  ).forEach(el => {
    const element = el as HTMLElement;
    const fontSize = parseFloat(window.getComputedStyle(element).fontSize);
    if (fontSize < 16) { // Increased from 14px
      element.style.fontSize = '16px';
    }
  });
  
  // Ensure subtitles have readable size
  container.querySelectorAll(
    '.project-role, .certification-issuer, .experience-title, .education-degree, .italic'
  ).forEach(el => {
    const element = el as HTMLElement;
    const fontSize = parseFloat(window.getComputedStyle(element).fontSize);
    if (fontSize < 13) { // Increased from 12px
      element.style.fontSize = '13px';
    }
  });
  
  // Ensure skill items have readable size
  container.querySelectorAll('.skill-item').forEach(el => {
    const element = el as HTMLElement;
    const fontSize = parseFloat(window.getComputedStyle(element).fontSize);
    if (fontSize < 12) { // Increased from 11px
      element.style.fontSize = '12px';
    }
  });

  // Adjust section spacing
  const sections = container.querySelectorAll('.resume-section');
  sections.forEach(section => {
    const element = section as HTMLElement;
    
    // Preserve some minimal spacing between sections
    element.style.marginBottom = `${Math.max(16 * scalingFactor, 10)}px`;
  });
};

// Import jsPDF and additional plugins
import 'jspdf/dist/polyfills.es.js';
// You may need to add this to your package.json: "jspdf": "^2.5.1"

/**
 * Exports an HTML element to a PDF with selectable text and preserved styling
 * @param elementId ID of the HTML element to convert
 * @param filename Name of the PDF file to download
 * @param format PDF page format (e.g., 'a4', 'letter')
 * @param templateStyles Optional template styles to apply
 * @returns Promise<boolean> indicating success or failure
 */
export const exportToPDF = async (
  elementId: string,
  filename = 'resume.pdf',
  format = 'a4',
  templateStyles: any = null
): Promise<boolean> => {
  try {
    // Get the HTML element to convert
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with ID "${elementId}" not found`);
      return false;
    }

    // --- START: HTML Manipulation for Skills Section ---
    console.log('[PDF Export] Starting HTML manipulation for skills...');
    const clonedElement = element.cloneNode(true) as HTMLElement;
    const skillsSection = clonedElement.querySelector('.skills-section');
    console.log('[PDF Export] Skills section found:', !!skillsSection);
    
    if (skillsSection) {
      // Find the container holding the individual skill items/boxes
      const skillsContainer = skillsSection.querySelector('.flex.flex-wrap');
      console.log('[PDF Export] Skills container (.flex.flex-wrap) found:', !!skillsContainer);

      if (skillsContainer) {
        // Try selecting direct DIV children of the container
        const skillElements = skillsContainer.querySelectorAll<HTMLDivElement>(':scope > div'); 
        console.log(`[PDF Export] Found ${skillElements.length} direct div children in skills container`);
        let skills: string[] = [];
        
        skillElements.forEach((skillEl, index) => {
          if (skillEl.textContent) {
            skills.push(skillEl.textContent.trim());
            console.log(`[PDF Export] Extracted skill ${index + 1}:`, skillEl.textContent.trim());
          }
        });

        if (skills.length > 0) {
          console.log('[PDF Export] Skills extracted:', skills);
          const headingElement = skillsSection.querySelector('.resume-section-heading');
          const headingHTML = headingElement ? headingElement.outerHTML : '<h3 class="resume-section-heading">Skills</h3>'; // Fallback heading
          
          // Create the new paragraph with styles
          const skillsParagraph = document.createElement('p');
          skillsParagraph.textContent = skills.join(', ');
          
          // Apply styles matching item description, prioritizing template values
          if (templateStyles?.bodyTextSize) {
            skillsParagraph.style.fontSize = templateStyles.bodyTextSize;
          } else {
            // Don't set font size if not in template, allow inheritance
            skillsParagraph.style.removeProperty('font-size'); 
          }
          skillsParagraph.style.fontFamily = templateStyles?.fontFamily || 'Arial, sans-serif';
          skillsParagraph.style.marginTop = '4px'; 
          skillsParagraph.style.lineHeight = '1.45'; 

          const paragraphHTML = skillsParagraph.outerHTML;

          // Completely overwrite the skills section innerHTML in the clone
          skillsSection.innerHTML = headingHTML + paragraphHTML;
          console.log('[PDF Export] Overwrote skills section innerHTML. New innerHTML:', skillsSection.innerHTML);
        } else {
            console.warn('[PDF Export] No skill text extracted from direct div children.');
        }
      } else {
        console.warn('[PDF Export] Skills container (.flex.flex-wrap) not found inside .skills-section');
      }
    } else {
        console.warn('[PDF Export] Skills section (.skills-section) not found.');
    }
    // --- END: HTML Manipulation for Skills Section ---

    // Create a new jsPDF instance with the specified format
    const orientation = 'portrait';
    const unit = 'mm';
    const doc = new jsPDF({
      orientation,
      unit,
      format,
    });

    // Set reasonable margins (in mm)
    const margin = 0;

    // Calculate available width and height with margins
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Calculate proper scaling factor
    // We'll use the ratio of page width to element width to maintain proportions
    const elementWidth = element.offsetWidth;
    const elementHeight = element.offsetHeight;
    
    // Calculate the content width and height with margins
    const contentWidth = pageWidth - (margin * 2);
    
    // Calculate scaling - this is key to fixing the size issue
    // We want to scale down to fit within the page width
    const scale = contentWidth / elementWidth;
    
    // Wait for any pending renders/images to be ready
    await new Promise(resolve => setTimeout(resolve, 500));

    // Use the html method to convert the MODIFIED CLONED element to PDF
    await doc.html(clonedElement, {
      callback: function(pdf) {
        pdf.save(filename);
      },
      x: margin,
      y: margin,
      width: contentWidth, 
      windowWidth: elementWidth, 
      autoPaging: true,
      margin: [margin, margin, margin, margin],
      html2canvas: {
        scale: scale * 0.95, 
        useCORS: true,
        logging: true, // Turn logging on for html2canvas
        letterRendering: true,
        allowTaint: true, 
        foreignObjectRendering: false,
        // --- Add ignoreElements --- 
        ignoreElements: (element) => {
          // Ignore the original skills container if it's still somehow present
          if (element.matches && element.matches('.skills-section .flex.flex-wrap')) {
            console.log('[html2canvas] Ignoring element:', element);
            return true;
          }
          return false;
        }
        // --- End ignoreElements --- 
      },
    });

    return true;
  } catch (error) {
    console.error('PDF export error:', error);
    return false;
  }
};