/**
 * Extract projects from parsed data
 * @param {Object} parsedData - Parsed resume data
 * @returns {Array} - Array of project objects
 */
function extractProjects(parsedData) {
  const projects = [];
  
  if (!parsedData.projects) return projects;
  
  // Split project text into blocks
  const projectBlocks = parsedData.projects.split(/\n{2,}/);
  
  for (const block of projectBlocks) {
    if (block.trim().length === 0) continue;
    
    const lines = block.split('\n');
    if (lines.length === 0) continue;
    
    // First line is likely the project name
    const name = lines[0].trim();
    
    // Extract link if present
    let link = '';
    const linkRegex = /https?:\/\/[^\s]+/;
    const linkMatch = block.match(linkRegex);
    if (linkMatch) {
      link = linkMatch[0];
    }
    
    // Rest is description
    const description = lines.slice(1).join('\n').trim();
    
    projects.push({
      name,
      description,
      link
    });
  }
  
  return projects;
}

module.exports = {
  extractProjects
}; 