import axios from 'axios';
import { ParsedResume } from '@/types/resume-parser';
import { toast } from 'sonner';

// Create an axios instance with default config
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';

console.log('API URL configured as:', API_URL);

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
    
    // Log the request for debugging
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: config.data instanceof FormData ? 'FormData (not shown)' : config.data
    });
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to log responses
api.interceptors.response.use(
  (response) => {
    console.log(`API Response (${response.status}):`, {
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
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
      console.log('Starting resume parsing process for file:', {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024).toFixed(2)} KB`
      });
      
      // Validate file type
      if (!file.type.includes('pdf') && !file.type.includes('word')) {
        console.error('Invalid file type:', file.type);
        throw new Error('Invalid file type. Please upload a PDF or DOCX file.');
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      // Check if user is logged in by looking for auth token
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('authToken='))
        ?.split('=')[1];
      
      // Determine which endpoint to use based on authentication status
      const endpoint = token ? '/upload/resume' : '/upload/public/resume';
      
      console.log(`Sending resume to ${token ? 'private' : 'public'} API endpoint for parsing...`);
      
      // Call the API
      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 second timeout for large files
      });
      
      // Log the response for debugging
      console.log('Resume parsing response received:', {
        status: response.status,
        hasData: !!response.data,
        hasDataProperty: !!response.data?.data,
        endpoint: endpoint
      });
      
      if (!response.data || !response.data.data) {
        console.error('Invalid response format:', response.data);
        throw new Error('Invalid response format from server');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error parsing resume:', error);
      
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status;
        const errorMessage = error.response?.data?.message || 'Failed to parse resume';
        
        console.error('Axios error details:', {
          status: statusCode,
          message: errorMessage,
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        });
        
        toast.error(`${errorMessage} (${statusCode || 'Network Error'})`);
      } else {
        const errorMsg = error instanceof Error ? error.message : 'Failed to parse resume. Please try again.';
        console.error('Non-Axios error:', errorMsg);
        toast.error(errorMsg);
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
      console.log('Saving parsed resume data to profile...');
      console.log('API URL:', api.defaults.baseURL);
      console.log('Endpoint: /user/profile/resume-data');
      console.log('Data being sent:', JSON.stringify(parsedData, null, 2));
      
      // Get the auth token from cookies for logging
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('authToken='))
        ?.split('=')[1];
      
      console.log('Auth token present:', !!token);
      
      // Call the API to save the data
      const response = await api.post('/user/profile/resume-data', parsedData);
      
      console.log('Resume data saved successfully:', response.data);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      toast.success('Resume data saved to your profile!');
      return response.data;
    } catch (error) {
      console.error('Error saving parsed resume to profile:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:');
        console.error('- Status:', error.response?.status);
        console.error('- Status text:', error.response?.statusText);
        console.error('- Data:', error.response?.data);
        console.error('- Headers:', error.response?.headers);
        console.error('- Request URL:', error.config?.url);
        console.error('- Request method:', error.config?.method);
        console.error('- Request headers:', error.config?.headers);
        
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
      console.log('Testing connection to API...');
      const response = await api.get('/health');
      console.log('Connection test successful:', response.data);
      return true;
    } catch (error) {
      console.error('Error testing connection:', error);
      return false;
    }
  }
};

export default cvAPI; 