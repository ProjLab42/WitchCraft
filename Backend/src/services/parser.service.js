const mammoth = require('mammoth');
const { PDFDocument } = require('pdf-lib');
const pdfParse = require('pdf-parse');

// Parse resume from uploaded file
exports.parseResume = async (fileBuffer, fileType) => {
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
    return parseResumeText(extractedText);
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw error;
  }
};

// Extract text from PDF
async function extractTextFromPdf(buffer) {
  try {
    // Using pdf-parse for text extraction
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
}

// Extract text from DOCX
async function extractTextFromDocx(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw error;
  }
}

// Parse resume text into structured data
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
    summary: '',
    experiences: [],
    education: [],
    skills: '',
    languages: '',
    certificates: ''
  };

  // Extract contact information
  resumeData.email = extractEmail(text);
  resumeData.phone = extractPhone(text);
  resumeData.linkedin = extractLinkedIn(text);
  
  // Extract name (usually at the beginning of the resume)
  resumeData.name = extractName(text);
  
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
      resumeData.skills = content.trim();
    } 
    else if (normalizedTitle.includes('language')) {
      resumeData.languages = content.trim();
    } 
    else if (normalizedTitle.includes('certification') || normalizedTitle.includes('certificate')) {
      resumeData.certificates = content.trim();
    }
  }
  
  // Try to extract job title if not found
  if (!resumeData.jobTitle) {
    resumeData.jobTitle = guessJobTitle(text, resumeData.experiences);
  }
  
  return resumeData;
}

// Helper function to extract email
function extractEmail(text) {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const match = text.match(emailRegex);
  return match ? match[0] : '';
}

// Helper function to extract phone number
function extractPhone(text) {
  // This regex handles various phone formats
  const phoneRegex = /(\+\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;
  const match = text.match(phoneRegex);
  return match ? match[0] : '';
}

// Helper function to extract LinkedIn URL
function extractLinkedIn(text) {
  const linkedinRegex = /linkedin\.com\/in\/[a-zA-Z0-9_-]+/;
  const match = text.match(linkedinRegex);
  return match ? match[0] : '';
}

// Helper function to extract name
function extractName(text) {
  // Assume the name is at the beginning of the resume
  // This is a simplistic approach and might need refinement
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  // Look at the first few lines for a potential name
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    
    // Check if this line looks like a name (no special characters, not too long)
    if (line.length > 0 && line.length < 50 && /^[A-Za-z\s.'-]+$/.test(line)) {
      return line;
    }
  }
  
  return '';
}

// Helper function to split text into sections
function splitIntoSections(text) {
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
    'certifications', 'certificates',
    'projects',
    'references'
  ];
  
  // Process each line
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (trimmedLine.length === 0) continue;
    
    // Check if this line is a section header
    const isHeader = sectionHeaders.some(header => 
      trimmedLine.toLowerCase().includes(header) && 
      (trimmedLine.toUpperCase() === trimmedLine || /^[A-Z]/.test(trimmedLine))
    );
    
    if (isHeader) {
      // Save the previous section
      if (currentContent.length > 0) {
        sections[currentSection] = currentContent.join('\n');
      }
      
      // Start a new section
      currentSection = trimmedLine;
      currentContent = [];
    } else {
      // Add to current section
      currentContent.push(trimmedLine);
    }
  }
  
  // Save the last section
  if (currentContent.length > 0) {
    sections[currentSection] = currentContent.join('\n');
  }
  
  return sections;
}

// Helper function to extract work experiences
function extractExperiences(text) {
  const experiences = [];
  const experienceBlocks = text.split(/(?=\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})/i);
  
  for (const block of experienceBlocks) {
    if (block.trim().length === 0) continue;
    
    const experience = {
      id: experiences.length + 1,
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: ''
    };
    
    // Extract dates
    const dateRegex = /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})\s*(?:-|to|–|until)\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}|Present|Current)/i;
    const dateMatch = block.match(dateRegex);
    
    if (dateMatch) {
      experience.startDate = dateMatch[1];
      experience.endDate = dateMatch[2];
    }
    
    // Extract company and position
    const lines = block.split('\n').filter(line => line.trim().length > 0);
    
    if (lines.length > 0) {
      // First non-empty line after the date is likely the company or position
      let companyLine = '';
      let positionLine = '';
      
      for (let i = 0; i < lines.length; i++) {
        if (!lines[i].match(dateRegex)) {
          companyLine = lines[i];
          if (i + 1 < lines.length) {
            positionLine = lines[i + 1];
          }
          break;
        }
      }
      
      // Determine which is company and which is position
      if (companyLine.includes('Inc') || companyLine.includes('LLC') || companyLine.includes('Ltd')) {
        experience.company = companyLine;
        experience.position = positionLine;
      } else {
        experience.position = companyLine;
        experience.company = positionLine;
      }
      
      // Extract description (everything else)
      const descStart = block.indexOf(positionLine) + positionLine.length;
      experience.description = block.substring(descStart).trim();
    }
    
    experiences.push(experience);
  }
  
  return experiences;
}

// Helper function to extract education
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

// Helper function to guess job title
function guessJobTitle(text, experiences) {
  // If we have experiences, use the most recent position
  if (experiences && experiences.length > 0) {
    return experiences[0].position;
  }
  
  // Otherwise try to find common job titles in the text
  const commonTitles = [
    'Software Engineer', 'Software Developer', 'Web Developer',
    'Product Manager', 'Project Manager', 'Program Manager',
    'Data Scientist', 'Data Analyst', 'Business Analyst',
    'Marketing Manager', 'Sales Manager', 'Account Executive',
    'UX Designer', 'UI Designer', 'Graphic Designer',
    'Content Writer', 'Technical Writer'
  ];
  
  for (const title of commonTitles) {
    if (text.includes(title)) {
      return title;
    }
  }
  
  return '';
}

module.exports = {
  extractTextFromPdf,
  extractTextFromDocx,
  parseResumeText
};