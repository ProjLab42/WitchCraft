const { generateId, extractBulletPoints, generateConfidence, formatDateRange } = require('../utils/helpers');

/**
 * Format parsed data according to frontend's expected structure
 * @param {Object} parsedData - Parsed resume data
 * @returns {Object} - Formatted data for frontend
 */
function formatParsedData(parsedData) {
  // Format personal info
  const personalInfo = {
    name: parsedData.name || '',
    email: parsedData.email || '',
    phone: parsedData.phone || '',
    title: parsedData.jobTitle || '',
    location: parsedData.location || '',
    bio: parsedData.summary || '',
    links: {
      linkedin: parsedData.links?.linkedin || parsedData.linkedin || '',
      portfolio: parsedData.links?.portfolio || parsedData.website || '',
      additionalLinks: parsedData.links?.additionalLinks || []
    },
    confidence: generateConfidence(),
    selected: true
  };
  
  // Format experiences
  const experiences = parsedData.experiences.map(exp => ({
    id: generateId('exp'),
    title: exp.position || '',
    company: exp.company || '',
    period: formatDateRange(exp.startDate, exp.endDate),
    description: exp.description || '',
    bulletPoints: exp.bulletPoints ? exp.bulletPoints.map((bullet, index) => ({
      id: `bullet-${index}`,
      text: bullet
    })) : [],
    confidence: generateConfidence(),
    selected: true
  }));
  
  // Format education
  const education = parsedData.education.map(edu => ({
    id: generateId('edu'),
    degree: edu.degree || '',
    institution: edu.school || '',
    year: formatDateRange(edu.startDate, edu.endDate),
    description: '',
    bulletPoints: [],
    confidence: generateConfidence(),
    selected: true
  }));
  
  // Format skills
  const skills = parsedData.skills.map(skill => ({
    id: generateId('skill'),
    name: skill,
    confidence: generateConfidence(),
    selected: true
  }));
  
  // Format projects
  const projects = parsedData.projects.map(project => ({
    id: generateId('proj'),
    name: project.name,
    description: project.description,
    link: project.link || '',
    bulletPoints: extractBulletPoints(project.description),
    confidence: generateConfidence(),
    selected: true
  }));
  
  // Format certifications
  const certifications = parsedData.certifications.map(cert => ({
    id: generateId('cert'),
    name: cert.name,
    issuer: cert.issuer,
    date: cert.date,
    expirationDate: cert.expirationDate || '',
    credentialId: cert.credentialId || '',
    bulletPoints: [],
    confidence: generateConfidence(),
    selected: true
  }));
  
  return {
    personalInfo,
    experience: experiences,
    education,
    skills,
    projects,
    certifications
  };
}

module.exports = {
  formatParsedData
}; 