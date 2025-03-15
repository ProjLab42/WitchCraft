/**
 * Extract education information from text
 * @param {string} text - Text to extract education from
 * @returns {Array} - Array of education objects
 */
function extractEducation(text) {
  const education = [];
  const educationBlocks = text.split(/(?=\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}|\d{4}\s*-\s*\d{4}|\d{4})/i);
  
  for (const block of educationBlocks) {
    if (block.trim().length === 0) continue;
    
    const edu = {
      id: education.length + 1,
      school: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: ''
    };
    
    // Extract dates
    const dateRegex = /(\d{4})\s*(?:-|to|–|until)\s*(\d{4}|Present|Current)/i;
    const dateMatch = block.match(dateRegex);
    
    if (dateMatch) {
      edu.startDate = dateMatch[1];
      edu.endDate = dateMatch[2];
    }
    
    // Extract school and degree
    const lines = block.split('\n').filter(line => line.trim().length > 0);
    
    if (lines.length > 0) {
      // First line is likely the school
      edu.school = lines[0].replace(dateRegex, '').trim();
      
      // Look for degree information
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('Bachelor') || line.includes('Master') || 
            line.includes('PhD') || line.includes('Diploma') || 
            line.includes('Certificate') || line.includes('Degree')) {
          
          // Try to separate degree from field
          const degreeMatch = line.match(/(Bachelor|Master|PhD|Diploma|Certificate|Degree|B\.S\.|M\.S\.|B\.A\.|M\.A\.|M\.B\.A\.)(?:\s+(?:of|in|on))?\s+([^,]+)/i);
          
          if (degreeMatch) {
            edu.degree = degreeMatch[1];
            edu.field = degreeMatch[2];
          } else {
            edu.degree = line;
          }
          
          break;
        }
      }
    }
    
    education.push(edu);
  }
  
  return education;
}

module.exports = {
  extractEducation
}; 