import axios from 'axios';

// Create an axios instance with default config
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';

console.log('API URL configured as:', API_URL);

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include credentials for cross-origin requests
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    console.log('Request interceptor triggered for:', config.url);
    console.log('Request headers before token:', config.headers);
    
    // Get token from cookies instead of localStorage
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('authToken='))
      ?.split('=')[1];
      
    console.log('Current cookies:', document.cookie);
    console.log('Found auth token:', token ? `${token.substring(0, 10)}...` : 'No token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Added Authorization header:', config.headers.Authorization);
    } else {
      console.log('No auth token found in cookies');
    }
    
    // Log the full request configuration
    console.log('Final request config:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      headers: config.headers,
      withCredentials: config.withCredentials,
      data: config.data
    });
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to log responses
api.interceptors.response.use(
  (response) => {
    console.log(`API Response Success (${response.status}):`, {
      url: response.config.url,
      method: response.config.method,
      headers: response.headers,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      headers: error.response?.headers,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  }
};

// User profile API calls
export const profileAPI = {
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },
  
  updateProfile: async (profileData: any) => {
    console.log('Updating profile with data:', profileData);
    try {
      const response = await api.put('/user/profile', profileData);
      console.log('Profile update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  },
  
  uploadProfilePicture: async (formData: FormData) => {
    const response = await api.post('/user/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

// --- Define Resume API Types --- 

// Basic info for listing resumes
export interface ResumeStub {
  _id: string;
  title: string;
  updatedAt: string;
}

// Structure matching backend resume.model.js for GET/POST/PUT
// (Moved from Editor.tsx and refined)
export interface ApiResumeData {
  _id: string;
  title: string;
  template: string;
  data: { 
    name?: string;
    jobTitle?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    website?: string; // Corresponds to PersonalInfo.links.portfolio
    location?: string;
    summary?: string;
  };
  sections: { 
    experience?: any[]; // TODO: Define specific item types later if needed
    education?: any[];
    skills?: { name: string }[]; // Expecting only name from backend
    projects?: any[];
    certifications?: any[];
    customSections?: Record<string, any>;
  };
  createdAt?: string;
  updatedAt?: string;
  // sectionOrder?: string[]; // Add if backend supports saving/loading order
}

// Structure for data sent when creating/updating
export interface ResumeSaveData {
  title: string;
  template: string;
  data: { 
    name?: string;
    jobTitle?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    website?: string; // Frontend PersonalInfo.links.portfolio maps to this
    location?: string;
    summary?: string;
  };
  sections: { 
    experience?: any[];
    education?: any[];
    skills?: { name: string }[]; // Send only name
    projects?: any[];
    certifications?: any[];
    // customSections?: Record<string, any>;
  };
  // sectionOrder?: string[]; // Add if needed
}

// --- End Resume API Types ---

// Resume API calls
export const resumeAPI = {
  // Returns a list of basic resume info
  getResumes: async (): Promise<ResumeStub[]> => {
    const response = await api.get<ResumeStub[]>('/resume/get');
    return response.data;
  },
  
  // Returns the full data for a specific resume
  getResumeById: async (id: string): Promise<ApiResumeData> => {
    const response = await api.get<ApiResumeData>(`/resume/get/${id}`);
    return response.data;
  },
  
  // Creates a new resume, returns the full created object
  createResume: async (resumeData: ResumeSaveData): Promise<ApiResumeData> => {
    const response = await api.post<ApiResumeData>('/resume/create', resumeData);
    return response.data;
  },
  
  // Updates an existing resume, returns the updated object
  updateResume: async (id: string, resumeData: ResumeSaveData): Promise<ApiResumeData> => {
    const response = await api.put<ApiResumeData>(`/resume/update/${id}`, resumeData);
    return response.data;
  },
  
  // Deletes a resume, likely returns a success message or status
  deleteResume: async (id: string): Promise<any> => { // Return type might be different (e.g., { message: string })
    const response = await api.delete(`/resume/delete/${id}`);
    return response.data;
  },
  
  // Server-side PDF/DOCX download
  downloadResume: async (id: string, format: 'pdf' | 'docx', template?: string) => {
    try {
      console.log(`Requesting download format=${format}, template=${template}, resumeId=${id}`);
      
      // Create URL with query params if template is provided
      const url = template 
        ? `/resume/download/${id}/${format}?template=${template}` 
        : `/resume/download/${id}/${format}`;
      
      // Make request with responseType blob to handle binary data
      const response = await api.get(url, {
        responseType: 'blob'
      });
      
      // Check if we received a valid blob (PDF/DOCX)
      if (!response.data || response.data.size === 0) {
        console.error('Empty response received from server');
        return false;
      }
      
      // Log response details for debugging
      console.log('Download response received:', { 
        contentType: response.data.type,
        size: response.data.size,
        statusCode: response.status
      });
      
      // Verify content type
      const contentType = response.headers['content-type'] || 
        (format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      
      // Create file name
      const fileName = `resume.${format}`;
      
      // Create blob URL and trigger download (using a more robust approach)
      const blob = new Blob([response.data], { type: contentType });
      const downloadUrl = window.URL.createObjectURL(blob);
      
      // Create and trigger download link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      }, 100);
      
      return true;
    } catch (error) {
      console.error('Error downloading resume:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        response: error.response?.data
      });
      return false;
    }
  },
  
  // Section-specific API calls
  addSectionItem: async (resumeId: string, sectionType: string, itemData: any) => {
    const response = await api.post(`/resume/create/${resumeId}/sections/${sectionType}`, itemData);
    return response.data;
  },
  
  updateSectionItem: async (resumeId: string, sectionType: string, itemId: string, itemData: any) => {
    const response = await api.put(`/resume/update/${resumeId}/sections/${sectionType}/${itemId}`, itemData);
    return response.data;
  },
  
  deleteSectionItem: async (resumeId: string, sectionType: string, itemId: string) => {
    const response = await api.delete(`/resume/delete/${resumeId}/sections/${sectionType}/${itemId}`);
    return response.data;
  },
  
  addCustomSection: async (resumeId: string, sectionKey: string, sectionData: any) => {
    const response = await api.post(`/resume/create/${resumeId}/custom-section`, { sectionKey, sectionData });
    return response.data;
  }
};

// Export the api instance as default
export default api; 