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