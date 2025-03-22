const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.modelName = process.env.GEMINI_MODEL_NAME || "gemini-1.5-pro";
    
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is required in .env file');
    }
    
    // Initialize the Google Generative AI with the API key
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    
    // Use the model specified in the environment variable or default to gemini-1.5-pro
    console.log(`Using Gemini model: ${this.modelName}`);
    this.model = this.genAI.getGenerativeModel({ model: this.modelName });
  }
  
  /**
   * Process a prompt with Gemini and return the JSON response
   * @param {string} prompt - The prompt to send to Gemini
   * @param {boolean} formatForJson - Whether to add JSON formatting instructions
   * @returns {Promise<Object>} - The parsed JSON response
   */
  async processPrompt(prompt, formatForJson = true) {
    try {
      // Add JSON formatting instructions if needed
      let formattedPrompt = prompt;
      
      if (formatForJson) {
        formattedPrompt = `${prompt}
        
        IMPORTANT: Your response MUST be in valid JSON format only. No explanatory text.
        Do not include any explanations, markdown formatting, code blocks, or text outside of the JSON structure. 
        The response should be directly parseable by JSON.parse() without any modifications.
        
        The response MUST include a "sections" object with all the sections from the user profile.
        
        Structure your response exactly as requested in the prompt, maintaining all the required fields and sections.`;
      }
      
      // Generate temperature settings for more predictable results
      // Lower temperature for more deterministic output
      const generationConfig = {
        temperature: 0.1,  // Even lower temperature for more consistency
        topP: 0.9,
        topK: 32,
        maxOutputTokens: 8192,
      };
      
      console.log('Sending prompt to Gemini with config:', generationConfig);
      
      // Send prompt to Gemini
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: formattedPrompt }] }],
        generationConfig,
      });
      
      const response = await result.response;
      const responseText = response.text();
      
      console.log('Raw response from Gemini (first 500 chars):', responseText.substring(0, 500) + '...');
      
      // Extract JSON from potential markdown code block
      let jsonText = responseText;
      
      // If response is wrapped in markdown code block, extract just the JSON part
      const markdownCodeBlockRegex = /```(?:json)?\s*\n([\s\S]*?)\n```/;
      const codeBlockMatch = responseText.match(markdownCodeBlockRegex);
      
      if (codeBlockMatch && codeBlockMatch[1]) {
        console.log('Extracted JSON from markdown code block');
        jsonText = codeBlockMatch[1].trim();
      }
      
      // Try to find and fix common JSON issues
      jsonText = this.sanitizeJsonString(jsonText);
      
      // Verify and parse JSON response
      try {
        // Try to parse the response as JSON
        const jsonResponse = JSON.parse(jsonText);
        
        // Log the structure of the response for debugging
        console.log('JSON structure:', Object.keys(jsonResponse));
        
        // Check and repair the response format if needed
        const repairedResponse = this.repairResponseFormat(jsonResponse);
        
        return repairedResponse;
      } catch (jsonError) {
        console.error('Error parsing Gemini response as JSON:', jsonError);
        console.error('Processed text for JSON parsing:', jsonText);
        throw new Error('Gemini response was not valid JSON');
      }
    } catch (error) {
      console.error('Error processing prompt with Gemini:', error);
      throw new Error(`Failed to process prompt: ${error.message}`);
    }
  }
  
  /**
   * Repair the response format to ensure it has the expected structure
   * @param {Object} response - The parsed JSON response
   * @returns {Object} - The repaired response
   */
  repairResponseFormat(response) {
    console.log('Starting response format repair...');
    
    // Case 1: Response has correct structure with summary and sections
    if (response.summary && response.sections) {
      console.log('Response has correct structure with summary and sections');
      
      // Log sections
      if (response.sections) {
        console.log('Sections found:', Object.keys(response.sections));
        
        // Make sure all required sections exist, even if empty
        const requiredSections = ['experience', 'education', 'skills', 'projects', 'certifications'];
        requiredSections.forEach(section => {
          if (!response.sections[section]) {
            console.log(`Adding missing ${section} section as empty array`);
            response.sections[section] = [];
          } else if (!Array.isArray(response.sections[section])) {
            console.log(`Converting ${section} to array`);
            response.sections[section] = Array.isArray(response.sections[section]) 
              ? response.sections[section] 
              : [];
          }
        });
        
        // Make sure customSections exists
        if (!response.sections.customSections) {
          console.log('Adding missing customSections as empty object');
          response.sections.customSections = {};
        }
      }
      
      return response;
    }
    
    // Case 2: Response has old format with workExperience, education, etc.
    console.log('Response has old format, transforming to new structure');
    const newResponse = {
      summary: response.summary || "",
      sections: {}
    };
    
    // Map fields from old to new format
    if (response.workExperience) {
      console.log('Transforming workExperience → sections.experience');
      newResponse.sections.experience = response.workExperience;
    } else if (response.experience) {
      console.log('Found sections.experience directly');
      newResponse.sections.experience = response.experience;
    } else {
      newResponse.sections.experience = [];
    }
    
    // Map education
    if (response.education) {
      newResponse.sections.education = response.education;
    } else {
      newResponse.sections.education = [];
    }
    
    // Map skills
    if (response.skills) {
      // Check if skills is array of objects or array of strings or object with arrays
      if (Array.isArray(response.skills)) {
        if (response.skills.length > 0 && typeof response.skills[0] === 'string') {
          // Convert array of strings to array of objects with name property
          newResponse.sections.skills = response.skills.map(skill => ({ name: skill }));
        } else {
          newResponse.sections.skills = response.skills;
        }
      } else if (response.skills.technical || response.skills.soft) {
        // Convert object with arrays to array of objects
        const technicalSkills = (response.skills.technical || []).map(skill => ({ name: skill }));
        const softSkills = (response.skills.soft || []).map(skill => ({ name: skill }));
        newResponse.sections.skills = [...technicalSkills, ...softSkills];
      } else {
        newResponse.sections.skills = [];
      }
    } else {
      newResponse.sections.skills = [];
    }
    
    // Map projects
    if (response.projects) {
      console.log('Found projects, mapping to sections.projects');
      newResponse.sections.projects = response.projects.map(proj => ({
        name: proj.name || "",
        description: proj.description || "",
        technologies: Array.isArray(proj.technologies) 
          ? proj.technologies.join(', ') 
          : (proj.technologies || ""),
        period: proj.period || proj.date || ""
      }));
    } else {
      console.log('No projects found, adding empty array');
      newResponse.sections.projects = [];
    }
    
    // Map certifications
    if (response.certifications) {
      console.log('Found certifications, mapping to sections.certifications');
      newResponse.sections.certifications = response.certifications;
    } else {
      console.log('No certifications found, adding empty array');
      newResponse.sections.certifications = [];
    }
    
    // Map custom sections if available
    if (response.customSections) {
      console.log('Found customSections, mapping directly');
      newResponse.sections.customSections = response.customSections;
    } else {
      console.log('No customSections found, checking for them in root');
      
      // Look for potential custom sections at the root level
      newResponse.sections.customSections = {};
      
      // List of known non-custom section keys to exclude
      const knownSections = [
        'summary', 'workExperience', 'experience', 'education', 
        'skills', 'projects', 'certifications', 'customSections',
        'personalInfo', 'sections'
      ];
      
      // Check for objects at root level that might be custom sections
      Object.keys(response).forEach(key => {
        if (!knownSections.includes(key) && Array.isArray(response[key])) {
          console.log(`Found potential custom section at root: ${key}`);
          newResponse.sections.customSections[key] = response[key];
        }
      });
    }
    
    console.log('Transformed response structure:', Object.keys(newResponse));
    console.log('Transformed sections:', Object.keys(newResponse.sections));
    console.log('Projects found:', Array.isArray(newResponse.sections.projects) ? newResponse.sections.projects.length : 0);
    
    return newResponse;
  }
  
  /**
   * Sanitize a JSON string to fix common issues
   * @param {string} jsonString - The potentially problematic JSON string
   * @returns {string} - The sanitized JSON string
   */
  sanitizeJsonString(jsonString) {
    // Remove any leading or trailing whitespace
    let sanitized = jsonString.trim();
    
    // Handle empty responses
    if (!sanitized) {
      console.error('Empty response from Gemini');
      return '{}';
    }
    
    try {
      // Try to parse it first - if it's already valid JSON, we're good
      JSON.parse(sanitized);
      return sanitized;
    } catch (e) {
      console.log('Initial JSON parsing failed, attempting to repair...');
      
      // Remove any trailing commas in arrays or objects (common issue)
      sanitized = sanitized.replace(/,\s*}/g, '}').replace(/,\s*\]/g, ']');
      
      // Fix unescaped quotes in JSON string values
      const fixQuoteRegex = /"([^"]*?)(?<!\\)"([^"]*?)"/g;
      while (fixQuoteRegex.test(sanitized)) {
        sanitized = sanitized.replace(fixQuoteRegex, '"$1\\"$2"');
      }
      
      // Check if the response appears to be an object but doesn't start with {
      if (!sanitized.startsWith('{') && sanitized.includes('{')) {
        const firstBrace = sanitized.indexOf('{');
        sanitized = sanitized.substring(firstBrace);
        console.log('Trimmed text before first brace');
      }
      
      // Check if the response doesn't end with } but has a closing brace
      if (!sanitized.endsWith('}') && sanitized.includes('}')) {
        const lastBrace = sanitized.lastIndexOf('}') + 1;
        sanitized = sanitized.substring(0, lastBrace);
        console.log('Trimmed text after last brace');
      }
      
      // If all else fails, return a fallback valid JSON
      try {
        JSON.parse(sanitized);
        return sanitized;
      } catch (finalError) {
        console.error('Failed to repair JSON, returning fallback structure');
        return JSON.stringify({
          summary: "The AI service encountered an error processing your resume.",
          sections: {
            experience: [],
            education: [],
            skills: [],
            projects: [],
            certifications: [],
            customSections: {}
          }
        });
      }
    }
  }
}

module.exports = new GeminiService(); 