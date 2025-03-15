import { ParsedResume } from "@/types/resume-parser";
import { mockUser } from "@/data/mockUser";
import { toast } from "sonner";
import { cvAPI } from "./cv-api.service";

/**
 * Parse a resume file
 * @param file The resume file to parse
 * @returns Parsed resume data
 */
export const parseResumeFile = async (file: File): Promise<ParsedResume> => {
  try {
    // Try to use the API first
    const parsedData = await cvAPI.parseResume(file);
    return parsedData;
  } catch (error) {
    console.error('Error parsing resume with API, falling back to mock data:', error);
    toast.error('Could not connect to the resume parsing service. Using mock data instead.');
    
    // Fall back to mock data
    return generateParsedResumeFromMockUser(file.name);
  }
};

/**
 * Save parsed resume data to user profile
 * @param parsedData Selected data from parsed resume
 * @returns Promise that resolves when data is saved
 */
export const saveParsedResumeToProfile = async (parsedData: Partial<ParsedResume>): Promise<void> => {
  try {
    // Try to use the API first
    await cvAPI.saveResumeData(parsedData);
  } catch (error) {
    console.error('Error saving parsed resume with API, falling back to mock implementation:', error);
    
    // Fall back to mock implementation
    await mockSaveParsedResumeToProfile(parsedData);
  }
};

/**
 * Test the resume parser connection
 * @returns Promise that resolves with a boolean indicating if the connection is working
 */
export const testResumeParserConnection = async (): Promise<boolean> => {
  return await cvAPI.testConnection();
};

/**
 * Mock implementation of saveParsedResumeToProfile for fallback
 */
const mockSaveParsedResumeToProfile = async (parsedData: Partial<ParsedResume>): Promise<void> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Log the data being saved
  console.log('Mock: Saving parsed resume data to profile:', parsedData);
  
  // Convert parsed resume data to profile format
  const profileData = {
    // Personal info
    personalInfo: parsedData.personalInfo ? {
      name: parsedData.personalInfo.name,
      email: parsedData.personalInfo.email,
      phone: parsedData.personalInfo.phone,
      title: parsedData.personalInfo.title,
      location: parsedData.personalInfo.location,
      bio: parsedData.personalInfo.bio
    } : undefined,
    
    // Sections
    sections: {
      // Experience
      experience: parsedData.experience?.map(exp => ({
        id: exp.id,
        company: exp.company,
        title: exp.title,
        // Parse period into start/end dates
        startDate: exp.period.split(' - ')[0],
        endDate: exp.period.includes(' - ') ? exp.period.split(' - ')[1] : 'Present',
        current: exp.period.includes('Present'),
        description: exp.description,
        bullets: exp.bulletPoints?.map(bp => bp.text) || []
      })) || [],
      
      // Education
      education: parsedData.education?.map(edu => ({
        id: edu.id,
        institution: edu.institution,
        degree: edu.degree,
        field: edu.degree.split(' in ').length > 1 ? edu.degree.split(' in ')[1] : '',
        // Extract location if available in description
        location: '',
        // Parse year into start/end dates
        startDate: edu.year.split(' - ')[0],
        endDate: edu.year.includes(' - ') ? edu.year.split(' - ')[1] : edu.year,
        current: edu.year.includes('Present'),
        gpa: '',
        bullets: edu.bulletPoints?.map(bp => bp.text) || []
      })) || [],
      
      // Skills
      skills: parsedData.skills?.map(skill => ({
        id: skill.id,
        name: skill.name,
        level: 'Intermediate' // Default level
      })) || [],
      
      // Projects
      projects: parsedData.projects?.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        link: project.link,
        bullets: project.bulletPoints?.map(bp => bp.text) || []
      })) || [],
      
      // Certifications
      certifications: parsedData.certifications?.map(cert => ({
        id: cert.id,
        name: cert.name,
        issuer: cert.issuer,
        date: cert.date,
        expirationDate: cert.expirationDate,
        credentialID: cert.credentialId,
        bullets: cert.bulletPoints?.map(bp => bp.text) || []
      })) || []
    }
  };
  
  // Log the converted profile data
  console.log('Mock: Converted to profile format:', profileData);
  
  toast.success('Resume data saved to your profile! (Mock)');
};

/**
 * Generate a unique ID with a prefix
 * @param prefix The prefix for the ID
 * @returns A unique ID
 */
const generateUniqueId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};

/**
 * Generate parsed resume data from mockUser
 * @param fileName The name of the uploaded file (used for randomization)
 * @returns Parsed resume data
 */
const generateParsedResumeFromMockUser = (fileName: string): ParsedResume => {
  // Use the mockUser data as a base
  // Add confidence scores and selected flags to simulate AI parsing
  
  // Create a hash from the filename to ensure different users get different confidence scores
  const fileHash = hashString(fileName);
  
  // Parse personal info
  const personalInfo = {
    name: mockUser.name,
    email: mockUser.email,
    phone: mockUser.phone,
    title: mockUser.title,
    location: mockUser.location,
    bio: mockUser.bio,
    links: {
      linkedin: mockUser.links.linkedin,
      portfolio: mockUser.links.portfolio,
      additionalLinks: mockUser.links.additionalLinks
    },
    confidence: getRandomConfidence(0.85, 0.98, fileHash, 'personal'),
    selected: true
  };
  
  // Parse experience
  const experience = mockUser.sections.experience.map((exp, index) => ({
    id: exp.id || generateUniqueId('exp'),
    title: exp.title,
    company: exp.company,
    period: exp.period,
    description: exp.description,
    bulletPoints: exp.bulletPoints || [],
    confidence: getRandomConfidence(0.75, 0.95, fileHash, `exp_${index}`),
    selected: true
  }));
  
  // Parse education
  const education = mockUser.sections.education.map((edu, index) => ({
    id: edu.id || generateUniqueId('edu'),
    degree: edu.degree,
    institution: edu.institution,
    year: edu.year,
    description: edu.description,
    bulletPoints: edu.bulletPoints || [],
    confidence: getRandomConfidence(0.8, 0.97, fileHash, `edu_${index}`),
    selected: true
  }));
  
  // Parse skills
  const skills = mockUser.sections.skills.map((skill, index) => ({
    id: skill.id || generateUniqueId('skill'),
    name: skill.name,
    confidence: getRandomConfidence(0.7, 0.99, fileHash, `skill_${index}`),
    selected: true
  }));
  
  // Parse projects
  const projects = mockUser.sections.projects.map((project, index) => ({
    id: project.id || generateUniqueId('proj'),
    name: project.name,
    description: project.description,
    link: project.link,
    bulletPoints: project.bulletPoints || [],
    confidence: getRandomConfidence(0.65, 0.9, fileHash, `proj_${index}`),
    selected: true
  }));
  
  // Parse certifications
  const certifications = mockUser.sections.certifications.map((cert, index) => ({
    id: cert.id || generateUniqueId('cert'),
    name: cert.name,
    issuer: cert.issuer,
    date: cert.date,
    expirationDate: cert.expirationDate,
    credentialId: cert.credentialId,
    bulletPoints: cert.bulletPoints || [],
    confidence: getRandomConfidence(0.75, 0.95, fileHash, `cert_${index}`),
    selected: true
  }));
  
  // Simulate some parsing errors or lower confidence for some items
  // This makes the demo more realistic
  simulateParsingImperfections(skills, projects, experience);
  
  return {
    personalInfo,
    experience,
    education,
    skills,
    projects,
    certifications
  };
};

/**
 * Generate a random confidence score within a range
 * @param min Minimum confidence value
 * @param max Maximum confidence value
 * @param seed Seed for randomization
 * @param salt Additional salt for randomization
 * @returns A random confidence score
 */
const getRandomConfidence = (min: number, max: number, seed: number, salt: string): number => {
  // Create a deterministic but seemingly random value based on the seed and salt
  const hash = hashString(`${seed}_${salt}`);
  const randomValue = (hash % 1000) / 1000; // Value between 0 and 1
  
  // Scale to the desired range
  return min + randomValue * (max - min);
};

/**
 * Simple string hashing function
 * @param str String to hash
 * @returns A numeric hash
 */
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

/**
 * Simulate imperfections in the parsing to make the demo more realistic
 * @param skills Skills array to modify
 * @param projects Projects array to modify
 * @param experience Experience array to modify
 */
const simulateParsingImperfections = (
  skills: ParsedResume['skills'],
  projects: ParsedResume['projects'],
  experience: ParsedResume['experience']
): void => {
  // Lower confidence for some skills
  if (skills.length > 3) {
    skills[2].confidence = 0.68; // Lower confidence
  }
  
  // Add a skill with typo and low confidence
  skills.push({
    id: generateUniqueId('skill'),
    name: "Docekr", // Intentional typo
    confidence: 0.55,
    selected: false
  });
  
  // Add a skill with very low confidence
  skills.push({
    id: generateUniqueId('skill'),
    name: "Kubernetes",
    confidence: 0.45,
    selected: false
  });
  
  // Lower confidence for a project
  if (projects.length > 0) {
    projects[0].confidence = 0.72;
  }
  
  // Add a project with low confidence
  projects.push({
    id: generateUniqueId('proj'),
    name: "Personal Website",
    description: "Developed a personal portfolio website using React and Tailwind CSS.",
    link: "https://github.com/janedoe/personal-site",
    bulletPoints: [],
    confidence: 0.58,
    selected: false
  });
  
  // Lower confidence for an experience item
  if (experience.length > 1) {
    experience[1].confidence = 0.76;
  }
}; 