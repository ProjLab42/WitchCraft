const crypto = require('crypto');

/**
 * Generate a unique ID with a prefix
 * @param {string} prefix - Prefix for the ID
 * @returns {string} - Generated unique ID
 */
const generateId = (prefix) => {
  return `${prefix}-${crypto.randomBytes(4).toString('hex')}`;
};

/**
 * Extract bullet points from text
 * @param {string} text - Text to extract bullet points from
 * @returns {Array} - Array of bullet point objects
 */
const extractBulletPoints = (text) => {
  if (!text) return [];
  
  // Split by common bullet point markers
  const bulletRegex = /(?:^|\n)[\s•\-\*\⁃\◦\▪\■\●\○\➢\➤\➥\➔]+(.*?)(?=(?:\n[\s•\-\*\⁃\◦\▪\■\●\○\➢\➤\➥\➔]+|\n\n|$))/g;
  const matches = [...text.matchAll(bulletRegex)];
  
  return matches.map((match, index) => ({
    id: `bullet-${index}`,
    text: match[1].trim()
  }));
};

/**
 * Generate a confidence score (simulating AI confidence)
 * @returns {number} - Confidence score between 70-99
 */
const generateConfidence = () => Math.floor(Math.random() * 30) + 70; // 70-99%

/**
 * Format a date range
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {string} - Formatted date range
 */
const formatDateRange = (startDate, endDate) => {
  if (!startDate) return '';
  if (!endDate) return startDate;
  return `${startDate} - ${endDate}`;
};

/**
 * Split text into sections
 * @param {string} text - Text to split into sections
 * @returns {Object} - Object with section titles as keys and content as values
 */
const splitIntoSections = (text) => {
  const sections = {};
  const lines = text.split('\n');
  
  let currentSection = 'Header';
  let currentContent = [];
  
  // Common section headers in resumes
  const sectionHeaders = [
    'summary', 'objective', 'profile',
    'experience', 'employment', 'work history',
    'education', 'academic',
    'skills', 'abilities', 'competencies',
    'languages',
    'certifications', 'certificates', 'certification', 'certificate', 'credentials', 'credential', 'qualifications',
    'projects',
    'references',
    'courses', 'workshops', 'training'
  ];
  
  // Process each line
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (trimmedLine.length === 0) continue;
    
    // Check if this line is a section header
    const isHeader = sectionHeaders.some(header => 
      trimmedLine.toLowerCase().includes(header) && 
      (
        trimmedLine.toUpperCase() === trimmedLine || 
        /^[A-Z]/.test(trimmedLine) ||
        trimmedLine.toLowerCase() === header ||
        new RegExp(`^${header}s?:?$`, 'i').test(trimmedLine)
      )
    );
    
    if (isHeader) {
      // Save the previous section
      if (currentContent.length > 0) {
        sections[currentSection] = currentContent.join('\n');
      }
      
      // Start a new section
      currentSection = trimmedLine;
      currentContent = [];
      
      // Special case: If we find a line that's just "Certifications" or similar,
      // and the next few lines look like certifications, include them
      if (
        trimmedLine.toLowerCase().includes('certif') || 
        trimmedLine.toLowerCase().includes('credential')
      ) {
        console.log(`Found certification section header: "${trimmedLine}"`);
      }
    } else {
      // Add to current section
      currentContent.push(trimmedLine);
    }
  }
  
  // Save the last section
  if (currentContent.length > 0) {
    sections[currentSection] = currentContent.join('\n');
  }
  
  // If we don't have a certifications section but have certification-like content in other sections,
  // extract it into a certifications section
  if (!Object.keys(sections).some(key => key.toLowerCase().includes('certif'))) {
    console.log("No explicit certifications section found, looking for certification content...");
    
    // Look for certification-like content in other sections
    const certificationLines = [];
    const certKeywords = ['certified', 'certificate', 'certification', 'credential', 'CCNA', 'CompTIA'];
    
    for (const [section, content] of Object.entries(sections)) {
      if (section.toLowerCase().includes('certif')) continue; // Skip if already a cert section
      
      const contentLines = content.split('\n');
      for (const line of contentLines) {
        if (certKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
          certificationLines.push(line);
        }
      }
    }
    
    if (certificationLines.length > 0) {
      console.log(`Found ${certificationLines.length} certification-like lines in other sections`);
      sections['Certifications'] = certificationLines.join('\n');
    }
  }
  
  return sections;
};

module.exports = {
  generateId,
  extractBulletPoints,
  generateConfidence,
  formatDateRange,
  splitIntoSections
}; 