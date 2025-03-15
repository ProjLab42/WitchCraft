import axios from 'axios';

// Create an axios instance with default config
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    // Get token from cookies instead of localStorage
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
      data: config.data
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

// Resume API calls
export const resumeAPI = {
  getResumes: async () => {
    const response = await api.get('/resume/get');
    return response.data;
  },
  
  getResumeById: async (id: string) => {
    const response = await api.get(`/resume/get/${id}`);
    return response.data;
  },
  
  createResume: async (resumeData: any) => {
    const response = await api.post('/resume/create', resumeData);
    return response.data;
  },
  
  updateResume: async (id: string, resumeData: any) => {
    const response = await api.put(`/resume/update/${id}`, resumeData);
    return response.data;
  },
  
  deleteResume: async (id: string) => {
    const response = await api.delete(`/resume/delete/${id}`);
    return response.data;
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

export default api; 