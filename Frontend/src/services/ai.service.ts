import api from './api.service';

export interface GenerateResumeRequest {
  jobDescription: string;
}

export interface ResumeSection {
  name?: string;
  company?: string;
  title?: string;
  period?: string;
  description?: string;
  institution?: string;
  degree?: string;
  technologies?: string;
  issuer?: string;
  date?: string;
}

export interface GenerateResumeResponse {
  error?: string;
  resumeData: {
    summary: string;
    sections: {
      experience: ResumeSection[];
      education: ResumeSection[];
      skills: ResumeSection[];
      projects: ResumeSection[];
      certifications: ResumeSection[];
      customSections: Record<string, ResumeSection[]>;
    }
  }
}

// AI-related API calls
export const aiAPI = {
  /**
   * Tests the connection to the Gemini AI API
   */
  testConnection: async () => {
    try {
      const response = await api.get('/ai/test-connection');
      return response.data;
    } catch (error) {
      console.error('Error testing AI connection:', error);
      throw error;
    }
  },

  /**
   * Generates a resume based on the user's profile and the provided job description
   * @param {string} jobDescription The job description to tailor the resume to
   */
  async generateResumeFromProfile(jobDescription: string): Promise<GenerateResumeResponse> {
    try {
      console.log('[AI Service] Generating resume with job description:', jobDescription);
      
      const response = await api.post('/ai/generate-resume', { jobDescription });
      
      // Log the raw API response for debugging
      console.log('[AI Service] AI API response:', response.data);
      
      // Validate that the response has the expected structure
      if (!response.data.resumeData) {
        console.error('[AI Service] Invalid response structure - missing resumeData:', response.data);
        throw new Error('Invalid response format from AI service');
      }
      
      // Check if the response contains error message
      if (response.data.error) {
        console.error('[AI Service] Error in AI response:', response.data.error);
        return response.data; // Return the error response
      }
      
      // Log all sections received
      console.log('[AI Service] Received sections:', 
        Object.keys(response.data.resumeData.sections));
      
      // Log each section length for debugging
      Object.keys(response.data.resumeData.sections).forEach(section => {
        if (section !== 'customSections') {
          const sectionData = response.data.resumeData.sections[section];
          console.log(`[AI Service] ${section} section:`, 
            Array.isArray(sectionData) ? `${sectionData.length} items` : typeof sectionData);
        }
      });
      
      // Log custom sections if present
      if (response.data.resumeData.sections.customSections) {
        const customSections = response.data.resumeData.sections.customSections;
        console.log('[AI Service] Custom sections:', 
          Object.keys(customSections).length > 0 ? 
            Object.keys(customSections).join(', ') : 'empty');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('[AI Service] Error generating resume:', error);
      
      // Check if the error response contains data with resumeData (handled errors)
      if (error.response?.data?.resumeData) {
        console.log('[AI Service] Error response contains resumeData structure, returning it');
        return error.response.data;
      }
      throw error;
    }
  }
};

export default aiAPI; 