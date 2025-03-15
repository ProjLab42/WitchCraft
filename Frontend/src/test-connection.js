// Simple script to test the connection from the frontend to the backend
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function testConnection() {
  try {
    console.log('Testing connection to backend...');
    
    // Test health endpoint
    const healthResponse = await axios.get(`${API_URL}/health`);
    console.log('Health endpoint response:', healthResponse.data);
    
    // Test login
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('Login response:', loginResponse.data);
    
    // Test user profile with token
    const token = loginResponse.data.token;
    const profileResponse = await axios.get(`${API_URL}/user/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Profile response:', profileResponse.data);
    
    console.log('All tests passed!');
  } catch (error) {
    console.error('Error testing connection:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testConnection(); 