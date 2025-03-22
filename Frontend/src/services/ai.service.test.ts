import { aiAPI, GenerateResumeResponse } from './ai.service';
import { api } from './api.service';
import axios from 'axios';

// Mock the api service
jest.mock('./api.service', () => ({
  api: {
    post: jest.fn()
  }
}));

// Setup console.log spy for testing logs
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

describe('AI Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('generateResumeFromProfile', () => {
    it('should process a complete response with all sections correctly', async () => {
      // Define a complete mock response with all sections
      const mockResponse = {
        data: {
          resumeData: {
            summary: 'Test summary',
            sections: {
              experience: [
                { company: 'Test Company', title: 'Developer', period: '2020-Present', description: 'Test job' }
              ],
              education: [
                { institution: 'Test University', degree: 'CS', period: '2016-2020', description: 'Test education' }
              ],
              skills: [
                { name: 'JavaScript' }, { name: 'React' }
              ],
              projects: [
                { name: 'Test Project', description: 'A test project', technologies: 'React', period: '2020' }
              ],
              certifications: [
                { name: 'AWS', issuer: 'Amazon', date: '2022' }
              ],
              customSections: {
                'Publications': [
                  { name: 'Test Paper', description: 'A research paper' }
                ]
              }
            }
          }
        }
      };
      
      // Mock the API response
      (api.post as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the service
      const result = await aiAPI.generateResumeFromProfile('Test job description');
      
      // Verify the API was called with correct parameters
      expect(api.post).toHaveBeenCalledWith('/ai/generate-resume', { 
        jobDescription: 'Test job description' 
      });
      
      // Verify the result contains all expected sections
      expect(result).toHaveProperty('resumeData');
      expect(result.resumeData).toHaveProperty('summary', 'Test summary');
      expect(result.resumeData).toHaveProperty('sections');
      
      const sections = result.resumeData.sections;
      
      // Check all required sections exist and have correct data
      expect(sections).toHaveProperty('experience');
      expect(sections.experience).toHaveLength(1);
      expect(sections.experience[0]).toHaveProperty('company', 'Test Company');
      
      expect(sections).toHaveProperty('education');
      expect(sections.education).toHaveLength(1);
      
      expect(sections).toHaveProperty('skills');
      expect(sections.skills).toHaveLength(2);
      
      expect(sections).toHaveProperty('projects');
      expect(sections.projects).toHaveLength(1);
      expect(sections.projects[0]).toHaveProperty('name', 'Test Project');
      
      expect(sections).toHaveProperty('certifications');
      expect(sections.certifications).toHaveLength(1);
      
      expect(sections).toHaveProperty('customSections');
      expect(sections.customSections).toHaveProperty('Publications');
      expect(sections.customSections.Publications).toHaveLength(1);
    });
    
    it('should handle error responses with resumeData structure', async () => {
      // Define a mock error response with resumeData
      const mockErrorResponse = {
        response: {
          data: {
            error: 'Test error message',
            resumeData: {
              summary: 'Failed to generate resume',
              sections: {
                experience: [],
                education: [],
                skills: [],
                projects: [],
                certifications: [],
                customSections: {}
              }
            }
          }
        }
      };
      
      // Mock the API to reject with the error
      (api.post as jest.Mock).mockRejectedValue(mockErrorResponse);
      
      // Call the service
      const result = await aiAPI.generateResumeFromProfile('Test job description');
      
      // Verify API was called
      expect(api.post).toHaveBeenCalledWith('/ai/generate-resume', { 
        jobDescription: 'Test job description' 
      });
      
      // Verify the error was logged
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      // Verify the result contains the error and empty sections
      expect(result).toHaveProperty('error', 'Test error message');
      expect(result).toHaveProperty('resumeData');
      expect(result.resumeData).toHaveProperty('summary', 'Failed to generate resume');
      expect(result.resumeData).toHaveProperty('sections');
      
      // Check all sections exist but are empty
      const sections = result.resumeData.sections;
      expect(sections).toHaveProperty('experience');
      expect(sections.experience).toHaveLength(0);
      expect(sections).toHaveProperty('projects');
      expect(sections.projects).toHaveLength(0);
    });
    
    it('should throw an error for network issues', async () => {
      // Define a network error
      const networkError = new Error('Network Error');
      
      // Mock the API to reject with a network error
      (api.post as jest.Mock).mockRejectedValue(networkError);
      
      // Call the service and expect it to throw
      await expect(aiAPI.generateResumeFromProfile('Test job description'))
        .rejects.toThrow('Network Error');
      
      // Verify API was called
      expect(api.post).toHaveBeenCalledWith('/ai/generate-resume', { 
        jobDescription: 'Test job description' 
      });
      
      // Verify the error was logged
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
    
    it('should throw an error for invalid response structure', async () => {
      // Define an invalid response
      const invalidResponse = {
        data: {
          // Missing resumeData
          message: 'Some message'
        }
      };
      
      // Mock the API to return invalid response
      (api.post as jest.Mock).mockResolvedValue(invalidResponse);
      
      // Call the service and expect it to throw
      await expect(aiAPI.generateResumeFromProfile('Test job description'))
        .rejects.toThrow('Invalid response format from AI service');
      
      // Verify API was called
      expect(api.post).toHaveBeenCalledWith('/ai/generate-resume', { 
        jobDescription: 'Test job description' 
      });
      
      // Verify the error was logged
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
}); 