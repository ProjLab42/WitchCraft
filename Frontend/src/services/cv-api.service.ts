import axios from 'axios';
import { ParsedResume } from '@/types/resume-parser';
import { toast } from 'sonner';

// Create an axios instance with default config
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include credentials for cross-origin requests
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Get token from cookies
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('authToken='))
      ?.split('=')[1];
      
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// CV API calls
export const cvAPI = {
  /**
   * Parse a resume file
   * @param file The resume file to parse
   * @returns Parsed resume data
   */
  parseResume: async (file: File): Promise<ParsedResume> => {
    try {
      // Validate file type
      if (!file.type.includes('pdf') && !file.type.includes('word')) {
        throw new Error('Invalid file type. Please upload a PDF or DOCX file.');
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      // Call the API
      const response = await api.post('/upload/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Log the response for debugging
      console.log('Resume parsing response:', response.data);
      
      return response.data.data;
    } catch (error) {
      console.error('Error parsing resume:', error);
      
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Failed to parse resume';
        toast.error(errorMessage);
      } else {
        toast.error(error instanceof Error ? error.message : 'Failed to parse resume. Please try again.');
      }
      
      throw error;
    }
  },
  
  /**
   * Save parsed resume data to user profile
   * @param parsedData Selected data from parsed resume
   * @returns Promise that resolves when data is saved
   */
  saveResumeData: async (parsedData: Partial<ParsedResume>): Promise<void> => {
    try {
      // Call the API to save the data
      const response = await api.post('/user/profile/resume-data', parsedData);
      
      toast.success('Resume data saved to your profile!');
      return response.data;
    } catch (error) {
      console.error('Error saving parsed resume to profile:', error);
      
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Failed to save resume data';
        toast.error(errorMessage);
      } else {
        toast.error(error instanceof Error ? error.message : 'Failed to save resume data to your profile');
      }
      
      throw error;
    }
  },
  
  /**
   * Test the resume parser connection
   * @returns Promise that resolves with a boolean indicating if the connection is working
   */
  testConnection: async (): Promise<boolean> => {
    try {
      await api.get('/health');
      return true;
    } catch (error) {
      console.error('Error testing connection:', error);
      return false;
    }
  }
};

export default cvAPI; 