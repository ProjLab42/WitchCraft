const { extractTextFromPdf, extractTextFromDocx } = require('./extractors/text.extractor');
const { extractPersonalInfo, extractAllLinks } = require('./extractors/personal-info.extractor');
const { extractExperiences } = require('./extractors/experience.extractor');
const { extractEducation } = require('./extractors/education.extractor');
const { extractSkills } = require('./extractors/skills.extractor');
const { extractProjects } = require('./extractors/projects.extractor');
const { extractCertifications } = require('./extractors/certifications.extractor');
const { formatParsedData } = require('./formatters/data.formatter');
const { splitIntoSections } = require('./utils/helpers');

/**
 * Parse resume from uploaded file
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileType - MIME type of the file
 * @returns {Promise<Object>} - Parsed resume data
 */
async function parseResume(fileBuffer, fileType) {
  try {
    let extractedText = '';
    
    if (fileType === 'application/pdf') {
      extractedText = await extractTextFromPdf(fileBuffer);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      extractedText = await extractTextFromDocx(fileBuffer);
    } else {
      throw new Error('Unsupported file type');
    }
    
    // Parse the extracted text to identify resume sections
    const parsedData = parseResumeText(extractedText);
    
    // Format the data according to the frontend's expected structure
    return formatParsedData(parsedData);
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw error;
  }
}

/**
 * Parse resume text into structured data
 * @param {string} text - Extracted text from resume
 * @returns {Object} - Structured resume data
 */
function parseResumeText(text) {
  // Initialize resume data structure
  const resumeData = {
    name: '',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
    links: {
      linkedin: '',
      portfolio: '',
      additionalLinks: []
    },
    summary: '',
    experiences: [],
    education: [],
    skills: [],
    languages: '',
    certificates: '',
    projects: [],
    certifications: []
  };

  // Extract sections
  const sections = splitIntoSections(text);
  
  // Process each section
  for (const [title, content] of Object.entries(sections)) {
    const normalizedTitle = title.toLowerCase().trim();
    
    if (normalizedTitle.includes('summary') || normalizedTitle.includes('objective') || normalizedTitle.includes('profile')) {
      resumeData.summary = content.trim();
    } 
    else if (normalizedTitle.includes('experience') || normalizedTitle.includes('employment') || normalizedTitle.includes('work history')) {
      resumeData.experiences = extractExperiences(content);
    } 
    else if (normalizedTitle.includes('education') || normalizedTitle.includes('academic')) {
      resumeData.education = extractEducation(content);
    } 
    else if (normalizedTitle.includes('skill')) {
      resumeData.skills = extractSkills(content);
    } 
    else if (normalizedTitle.includes('language')) {
      resumeData.languages = content.trim();
    } 
    else if (normalizedTitle.includes('certification') || normalizedTitle.includes('certificate')) {
      resumeData.certifications = extractCertifications(content);
    }
    else if (normalizedTitle.includes('project')) {
      resumeData.projects = extractProjects(content.trim());
    }
  }
  
  // Extract personal information after processing sections
  // This allows us to use the extracted experiences for job title guessing
  const personalInfo = extractPersonalInfo(text, resumeData);
  
  // Update resume data with personal information
  resumeData.name = personalInfo.name;
  resumeData.email = personalInfo.email;
  resumeData.phone = personalInfo.phone;
  resumeData.linkedin = personalInfo.linkedin;
  resumeData.website = personalInfo.website;
  resumeData.location = personalInfo.location;
  resumeData.jobTitle = personalInfo.jobTitle;
  resumeData.links = personalInfo.links;
  
  return resumeData;
}

module.exports = {
  parseResume,
  parseResumeText,
  extractTextFromPdf,
  extractTextFromDocx
}; 