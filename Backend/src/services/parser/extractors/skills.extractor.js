/**
 * Extract skills from skills text
 * @param {string} skillsText - Text containing skills
 * @returns {Array} - Array of skill strings
 */
function extractSkills(skillsText) {
  if (!skillsText) return [];
  
  // Split by common separators
  const skillSeparators = /[,•\n\t|;]/;
  const skills = skillsText.split(skillSeparators)
    .map(skill => skill.trim())
    .filter(skill => skill.length > 0 && skill.length < 50); // Filter out empty or too long strings
  
  // Remove duplicates
  return [...new Set(skills)];
}

module.exports = {
  extractSkills
}; 