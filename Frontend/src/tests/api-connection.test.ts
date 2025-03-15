import axios from 'axios';
import api from '../services/api.service';
import AuthService from '../services/auth.service';

// Test user credentials
const testUser = {
  email: 'test@example.com',
  password: 'password123'
};

/**
 * Test suite for API connection between frontend and backend
 * Run this test with: npm test -- --testPathPattern=api-connection
 */
describe('Frontend-Backend Connection Tests', () => {
  // Test environment variables
  describe('Environment Configuration', () => {
    it('should have valid API URL environment variables', () => {
      const backendUrl = import.meta.env.VITE_Backend_URL;
      const apiUrl = import.meta.env.VITE_API_URL;
      
      console.log('Backend URL:', backendUrl);
      console.log('API URL:', apiUrl);
      
      expect(backendUrl).toBeDefined();
      expect(apiUrl).toBeDefined();
      expect(backendUrl).toContain('localhost');
      expect(apiUrl).toContain('/api');
    });
  });

  // Test health endpoint
  describe('Health Check', () => {
    it('should connect to backend health endpoint', async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_Backend_URL}/health`);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('status', 'ok');
        console.log('Health check passed');
      } catch (error) {
        console.error('Health check failed:', error);
        throw error;
      }
    });

    it('should connect to API health endpoint', async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/health`);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('status', 'ok');
        console.log('API health check passed');
      } catch (error) {
        console.error('API health check failed:', error);
        throw error;
      }
    });

    it('should connect using the API service', async () => {
      try {
        const response = await api.get('/health');
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('status', 'ok');
        console.log('API service health check passed');
      } catch (error) {
        console.error('API service health check failed:', error);
        throw error;
      }
    });

    it('should connect using AuthService.testConnection()', async () => {
      try {
        const result = await AuthService.testConnection();
        expect(result).toBe(true);
        console.log('AuthService connection test passed');
      } catch (error) {
        console.error('AuthService connection test failed:', error);
        throw error;
      }
    });
  });

  // Test authentication
  describe('Authentication', () => {
    it('should login with test user credentials using direct axios', async () => {
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, testUser, {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        });
        
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('token');
        expect(response.data).toHaveProperty('user');
        expect(response.data.user).toHaveProperty('email', testUser.email);
        
        console.log('Direct login test passed');
      } catch (error) {
        console.error('Direct login test failed:', error);
        throw error;
      }
    });

    it('should login with test user credentials using AuthService', async () => {
      try {
        const response = await AuthService.login(testUser);
        
        expect(response).toHaveProperty('token');
        expect(response).toHaveProperty('user');
        expect(response.user).toHaveProperty('email', testUser.email);
        
        // Check if token was saved to cookies
        const hasToken = document.cookie
          .split('; ')
          .some(row => row.startsWith('authToken='));
        
        expect(hasToken).toBe(true);
        console.log('AuthService login test passed');
      } catch (error) {
        console.error('AuthService login test failed:', error);
        throw error;
      }
    });

    it('should verify authentication state after login', () => {
      const isAuthenticated = AuthService.isAuthenticated();
      expect(isAuthenticated).toBe(true);
      console.log('Authentication state check passed');
    });
  });

  // Test user profile
  describe('User Profile', () => {
    it('should fetch user profile using direct axios with auth token', async () => {
      try {
        // Get token from cookies
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('authToken='))
          ?.split('=')[1];
        
        if (!token) {
          console.log('Skipping test as no token found');
          return;
        }
        
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        });
        
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('email', testUser.email);
        console.log('Direct profile fetch test passed');
      } catch (error) {
        console.error('Direct profile fetch test failed:', error);
        throw error;
      }
    });

    it('should fetch user profile using AuthService', async () => {
      try {
        const profile = await AuthService.getProfile();
        
        expect(profile).toHaveProperty('email', testUser.email);
        console.log('AuthService profile fetch test passed');
      } catch (error) {
        console.error('AuthService profile fetch test failed:', error);
        throw error;
      }
    });
  });

  // Cleanup
  afterAll(() => {
    // Clear auth token cookie
    document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    console.log('Test cleanup completed');
  });
}); 