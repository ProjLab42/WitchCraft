import axios from 'axios'; // Add this if you want to use axios directly
import api from './api.service';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  title?: string;
  bio?: string;
  location?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

/**
 * Auth service for handling authentication related API calls
 */
const AuthService = {
  /**
   * Register a new user
   */
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      console.log('Attempting registration with:', { ...userData, password: '[REDACTED]' });
      // Updated endpoint to match the api.service.ts format
      const response = await api.post<AuthResponse>('/auth/register', userData);
      
      if (response.data.token) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7);
        const cookieString = `authToken=${response.data.token}; expires=${expiryDate.toUTCString()}; path=/; SameSite=None; Secure`;
        document.cookie = cookieString;
        console.log('Set auth cookie:', cookieString);
        console.log('Current cookies after setting:', document.cookie);
        window.dispatchEvent(new Event('storage'));
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Registration failed with details:', error);
      throw error;
    }
  },
  
  /**
   * Login user
   */
  login: async (credentials: LoginData): Promise<AuthResponse> => {
    try {
      console.log('Attempting login with:', { email: credentials.email, password: '[REDACTED]' });
      
      // Updated endpoint to match the api.service.ts format
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      
      if (response.data.token) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7);
        const cookieString = `authToken=${response.data.token}; expires=${expiryDate.toUTCString()}; path=/; SameSite=None; Secure`;
        document.cookie = cookieString;
        console.log('Set auth cookie:', cookieString);
        console.log('Current cookies after setting:', document.cookie);
        window.dispatchEvent(new Event('storage'));
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Login failed with details:', error);
      throw error;
    }
  },
  
  /**
   * Logout user
   */
  logout: (): void => {
    document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.dispatchEvent(new Event('storage'));
  },
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!document.cookie
      .split('; ')
      .find(row => row.startsWith('authToken='));
  },
  
  /**
   * Get user profile
   */
  getProfile: async (): Promise<any> => {
    try {
      console.log('Fetching user profile...');
      const response = await api.get('/user/profile');
      console.log('Profile fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('API Error details:', {
          status: error.response?.status,
          message: error.response?.data?.message || 'Unknown error',
          data: error.response?.data,
          url: error.config?.url
        });
      }
      
      throw error;
    }
  },

  /**
   * Test connection to backend
   */
  testConnection: async (): Promise<boolean> => {
    try {
      console.log('Testing connection to backend...');
      // Option 1: Use the api instance (preferred)
      // The api instance already has /api in the baseURL, so we just need /health
      await api.get('/health');
      
      // Option 2: Use axios directly (make sure you imported axios above)
      // await axios.get('http://localhost:5001/api/health', { timeout: 5000 });
      
      console.log('Backend connection successful.');
      return true;
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return false;
    }
  },
};

export default AuthService;