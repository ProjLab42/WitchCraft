const User = require('../models/user.model');
const Resume = require('../models/resume.model');
const geminiService = require('../services/gemini.service');

/**
 * Generate a resume using the user's profile and the provided job description
 */
exports.generateResumeFromProfile = async (req, res) => {
  try {
    const { jobDescription } = req.body;
    
    if (!jobDescription) {
      return res.status(400).json({ error: 'Job description is required' });
    }
    
    // Get user profile
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Find the user's resume to get sections
    const resume = await Resume.findOne({ user: req.userId });
    
    // Convert user to a plain object so we can add sections
    const userProfile = user.toObject();
    
    // Add resume sections to the profile if available
    if (resume) {
      // Convert customSections from Map to plain object
      const resumeSections = { ...resume.sections };
      
      if (resumeSections.customSections instanceof Map) {
        console.log('Converting customSections from Map to object');
        const customSectionsObj = {};
        resumeSections.customSections.forEach((value, key) => {
          customSectionsObj[key] = value;
        });
        resumeSections.customSections = customSectionsObj;
      }
      
      userProfile.sections = resumeSections;
      console.log('SECTIONS FROM USER PROFILE: Available sections:', Object.keys(resumeSections));
      
      // Log the length of each section array
      Object.keys(resumeSections).forEach(section => {
        if (section !== 'sectionMeta' && section !== 'customSections') {
          console.log(`SECTION ${section} length:`, Array.isArray(resumeSections[section]) ? resumeSections[section].length : 'not an array');
        }
      });
      
      // Log custom sections if any
      if (resumeSections.customSections) {
        console.log('CUSTOM SECTIONS: Available custom sections:', 
          typeof resumeSections.customSections === 'object' ? Object.keys(resumeSections.customSections) : 'none or invalid format');
      }
    } else {
      // Create default empty sections structure
      userProfile.sections = {
        sectionMeta: {
          "experience": { name: "Experience", deletable: true, renamable: true },
          "education": { name: "Education", deletable: true, renamable: true },
          "skills": { name: "Skills", deletable: true, renamable: true },
          "projects": { name: "Projects", deletable: true, renamable: true },
          "certifications": { name: "Certifications", deletable: true, renamable: true }
        },
        experience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
        customSections: {}
      };
    }
    
    // Create the prompt for Gemini
    const prompt = `
    I need to create a professional resume based on my profile information,
    tailored specifically for this job description: "${jobDescription}".
    
    Here's my profile information:
    ${JSON.stringify(userProfile, null, 2)}
    
    Please create a professional resume that highlights my relevant skills and experiences
    for this specific job. You MUST include ALL sections that exist in my profile, including:
    - experience
    - education
    - skills
    - projects
    - certifications
    - Any custom sections that may be present
    
    IMPORTANT EMPHASIS:
    - Do NOT omit any section from my profile
    - Make sure to include PROJECTS section with proper array format
    - Make sure to include CERTIFICATIONS section with proper array format
    - Check for and preserve any CUSTOM SECTIONS from my profile
    - We are limited to a one page resume, so only select the important and relevant information to include
    
    The response must be in a valid JSON format with the following structure that EXACTLY matches my profile structure:
    {
      "summary": "A tailored professional summary highlighting key qualifications relevant to the job",
      "sections": {
        "experience": [
          {
            "company": "Company Name",
            "title": "Job Title",
            "period": "Start Date - End Date or 'Present'",
            "description": "Job description with achievements quantified when possible"
          }
        ],
        "education": [
          {
            "institution": "University Name",
            "degree": "Degree",
            "period": "Start Date - End Date",
            "description": "Description of studies and achievements"
          }
        ],
        "skills": [
          {
            "name": "Skill 1"
          },
          {
            "name": "Skill 2"
          }
        ],
        "projects": [
          {
            "name": "Project Name",
            "description": "Brief description",
            "technologies": "Tech 1, Tech 2, Tech 3",
            "period": "Duration or Date"
          }
        ],
        "certifications": [
          {
            "name": "Certification Name",
            "issuer": "Issuing Organization",
            "date": "Date Obtained"
          }
        ],
        "customSections": {
          // Include any custom sections from my profile with the same structure
        }
      }
    }
    
    The response MUST include ALL of these sections, even if they are empty arrays. For example, if there are no projects, include:
    "projects": []
    
    If there are no custom sections, include:
    "customSections": {}
    
    DOUBLE CHECK your response to make sure it includes ALL sections before returning.
    `;
    
    // Process the prompt using Gemini service
    let aiResponse;
    try {
      aiResponse = await geminiService.processPrompt(prompt);
    } catch (geminiError) {
      console.error('Gemini API error:', geminiError);
      
      // More specific error message for Gemini issues
      throw new Error(`AI service error: ${geminiError.message}. Please try again with a different job description.`);
    }
    
    // Log the AI response for debugging
    console.log('AI response structure:', Object.keys(aiResponse));
    console.log('AI response sections:', aiResponse.sections ? Object.keys(aiResponse.sections) : 'No sections');
    
    // Log projects and custom sections specifically
    if (aiResponse.sections) {
      console.log('PROJECTS in AI response:', 
        Array.isArray(aiResponse.sections.projects) ? 
        `${aiResponse.sections.projects.length} projects found` : 
        'No projects array found');
        
      console.log('CUSTOM SECTIONS in AI response:',
        aiResponse.sections.customSections ? 
        `Found with keys: ${Object.keys(aiResponse.sections.customSections).join(', ') || 'empty object'}` : 
        'No customSections object found');
    }
    
    // Transform AI response to match the frontend's expected format
    let transformedResponse;
    
    // Check if AI returned the correct structure with sections
    if (aiResponse.sections) {
      // AI returned the correct structure, use it directly
      transformedResponse = {
        resumeData: {
          summary: aiResponse.summary || "",
          sections: aiResponse.sections
        }
      };
    } else {
      // AI returned old structure, transform it
      transformedResponse = {
        resumeData: {
          summary: aiResponse.summary || "",
          sections: {
            experience: Array.isArray(aiResponse.workExperience) 
              ? aiResponse.workExperience.map(exp => ({
                  company: exp.company || "",
                  title: exp.title || "",
                  period: exp.period || "",
                  description: exp.description || ""
                }))
              : [],
            education: Array.isArray(aiResponse.education) 
              ? aiResponse.education.map(edu => ({
                  institution: edu.institution || "",
                  degree: edu.degree || "",
                  period: edu.period || "",
                  description: edu.description || ""
                }))
              : [],
            skills: Array.isArray(aiResponse.skills) 
              ? aiResponse.skills.map(skill => ({
                  name: typeof skill === 'string' ? skill : (skill.name || "")
                }))
              : [],
            projects: Array.isArray(aiResponse.projects) 
              ? aiResponse.projects.map(proj => ({
                  name: proj.name || "",
                  description: proj.description || "",
                  technologies: proj.technologies || "",
                  period: proj.period || ""
                }))
              : [],
            certifications: Array.isArray(aiResponse.certifications) 
              ? aiResponse.certifications.map(cert => ({
                  name: cert.name || "",
                  issuer: cert.issuer || "",
                  date: cert.date || ""
                }))
              : [],
            customSections: aiResponse.customSections || {}
          }
        }
      };
      
      // Ensure all sections from user profile are included (even if empty)
      if (userProfile.sections) {
        Object.keys(userProfile.sections).forEach(section => {
          // Skip sectionMeta
          if (section === 'sectionMeta') return;
          
          // If this section doesn't exist in our transformed response, add an empty array
          if (!transformedResponse.resumeData.sections[section] && 
              section !== 'customSections') {
            transformedResponse.resumeData.sections[section] = [];
          }
        });
      }
    }
    
    console.log('Transformed response:', JSON.stringify(transformedResponse, null, 2));
    
    // Return the transformed response
    console.log('FINAL RESPONSE: Sections in transformed response:', 
      Object.keys(transformedResponse.resumeData.sections));
    
    // Log the length of each section array in the final response
    Object.keys(transformedResponse.resumeData.sections).forEach(section => {
      if (section !== 'customSections') {
        console.log(`FINAL ${section} length:`, 
          Array.isArray(transformedResponse.resumeData.sections[section]) ? 
          transformedResponse.resumeData.sections[section].length : 
          'not an array');
      }
    });
    
    // Log custom sections in final response
    if (transformedResponse.resumeData.sections.customSections) {
      console.log('FINAL CUSTOM SECTIONS:', 
        Object.keys(transformedResponse.resumeData.sections.customSections).length > 0 ? 
        Object.keys(transformedResponse.resumeData.sections.customSections).join(', ') : 
        'empty object');
    }
    
    return res.status(200).json(transformedResponse);
    
  } catch (error) {
    console.error('Error generating resume from profile:', error);
    
    // Create a response with the same structure even in case of error
    const errorResponse = {
      error: error.message || 'Unknown error occurred',
      resumeData: {
        summary: "Failed to generate resume. Please try again.",
        sections: {
          experience: [],
          education: [],
          skills: [],
          projects: [],
          certifications: [],
          customSections: {}
        }
      }
    };
    
    // No need to try to add sections from userProfile here since it might not be defined
    // in the error case and was causing the crash
    
    return res.status(500).json(errorResponse);
  }
};

/**
 * Test connection to Gemini API
 */
exports.testGeminiConnection = async (req, res) => {
  try {
    const prompt = `Create a sample JSON object with the following structure:
      {
        "message": "Connection test successful",
        "timestamp": current date and time,
        "success": true
      }`;
    
    const result = await geminiService.processPrompt(prompt);
    
    return res.status(200).json({
      connectionSuccessful: true,
      modelName: process.env.GEMINI_MODEL_NAME || "gemini-1.5-pro",
      testResponse: result
    });
  } catch (error) {
    console.error('Error testing Gemini connection:', error);
    return res.status(500).json({ 
      connectionSuccessful: false,
      error: error.message 
    });
  }
}; 