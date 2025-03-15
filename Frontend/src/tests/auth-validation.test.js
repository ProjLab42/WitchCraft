/**
 * Frontend Authentication Validation Test
 * 
 * This test script validates the frontend authentication flow, checking for consistency
 * in environment variables, API calls, and token handling.
 */

import axios from 'axios';
import Cookies from 'js-cookie';

// Test configuration
const testUser = {
  email: 'test@example.com',
  password: 'password123'
};

// Store tokens and user data for tests
let authToken = null;

// Validate environment variables
function validateEnvironmentVariables() {
  console.log('\n--- Frontend Environment Variables Validation ---');
  
  // Required environment variables
  const requiredVars = [
    'VITE_Backend_URL',
    'VITE_API_URL'
  ];
  
  let missingVars = [];
  
  for (const varName of requiredVars) {
    if (!import.meta.env[varName]) {
      missingVars.push(varName);
      console.error(`❌ Missing ${varName} environment variable`);
    } else {
      console.log(`✅ ${varName} is set: ${import.meta.env[varName]}`);
    }
  }
  
  if (missingVars.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
    throw new Error('Missing required environment variables');
  }
  
  // Validate URL formats
  try {
    new URL(import.meta.env.VITE_Backend_URL);
    console.log('✅ VITE_Backend_URL is a valid URL');
  } catch (error) {
    console.error('❌ VITE_Backend_URL is not a valid URL');
    throw new Error('Invalid VITE_Backend_URL');
  }
  
  try {
    new URL(import.meta.env.VITE_API_URL);
    console.log('✅ VITE_API_URL is a valid URL');
  } catch (error) {
    console.error('❌ VITE_API_URL is not a valid URL');
    throw new Error('Invalid VITE_API_URL');
  }
  
  // Check if API URL is consistent with Backend URL
  if (!import.meta.env.VITE_API_URL.startsWith(import.meta.env.VITE_Backend_URL)) {
    console.warn('⚠️ VITE_API_URL does not start with VITE_Backend_URL, which might indicate inconsistency');
  } else {
    console.log('✅ VITE_API_URL is consistent with VITE_Backend_URL');
  }
  
  console.log('✅ All required environment variables are set and valid');
}

// Test backend health
async function testBackendHealth() {
  console.log('\n--- Backend Health Test ---');
  
  try {
    // Root health endpoint
    const rootResponse = await axios.get(`${import.meta.env.VITE_Backend_URL}/health`);
    console.log('✅ Backend root health endpoint is working');
    console.log(`✅ Status: ${rootResponse.status}`);
    console.log(`✅ Data:`, rootResponse.data);
    
    // API health endpoint
    const apiResponse = await axios.get(`${import.meta.env.VITE_API_URL}/health`);
    console.log('✅ Backend API health endpoint is working');
    console.log(`✅ Status: ${apiResponse.status}`);
    console.log(`✅ Data:`, apiResponse.data);
    
    return true;
  } catch (error) {
    console.error('❌ Backend health test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received. This might indicate a CORS or network issue.');
    }
    return false;
  }
}

// Test CORS configuration
async function testCorsConfiguration() {
  console.log('\n--- CORS Configuration Test ---');
  
  try {
    // Test with preflight request
    const response = await axios.options(`${import.meta.env.VITE_API_URL}/auth/login`, {
      headers: {
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    });
    
    console.log('✅ CORS preflight request succeeded');
    console.log(`✅ Status: ${response.status}`);
    
    // Check CORS headers
    const corsHeaders = [
      'access-control-allow-origin',
      'access-control-allow-methods',
      'access-control-allow-headers',
      'access-control-allow-credentials'
    ];
    
    for (const header of corsHeaders) {
      if (response.headers[header]) {
        console.log(`✅ ${header}: ${response.headers[header]}`);
      } else {
        console.warn(`⚠️ Missing ${header} in response`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ CORS configuration test failed:', error.message);
    if (error.response) {
      console.error('Response headers:', error.response.headers);
    }
    return false;
  }
}

// Test direct API login
async function testDirectApiLogin() {
  console.log('\n--- Direct API Login Test ---');
  
  try {
    // Clear any existing auth tokens
    Cookies.remove('authToken');
    
    console.log(`🔍 Attempting login with email: ${testUser.email}`);
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, testUser, {
      withCredentials: true
    });
    
    console.log('✅ Direct API login successful');
    console.log(`✅ Status: ${response.status}`);
    console.log('✅ Response contains token:', !!response.data.token);
    console.log('✅ Response contains user data:', !!response.data.user);
    
    // Save token for subsequent tests
    authToken = response.data.token;
    
    // Check if token is properly structured (JWT)
    const tokenParts = authToken.split('.');
    if (tokenParts.length === 3) {
      console.log('✅ Token has valid JWT structure (header.payload.signature)');
      
      // Decode token payload
      try {
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('✅ Token payload successfully decoded');
        console.log('✅ Token contains userId:', !!payload.userId);
        console.log('✅ Token contains expiration:', !!payload.exp);
        
        // Check token expiration
        const expirationDate = new Date(payload.exp * 1000);
        const now = new Date();
        if (expirationDate > now) {
          console.log(`✅ Token is not expired. Expires on: ${expirationDate.toISOString()}`);
        } else {
          console.error(`❌ Token is already expired. Expired on: ${expirationDate.toISOString()}`);
        }
      } catch (error) {
        console.error('❌ Failed to decode token payload:', error.message);
      }
    } else {
      console.error('❌ Token does not have valid JWT structure');
    }
    
    // Check if token was set in cookies
    const cookieToken = Cookies.get('authToken');
    if (cookieToken) {
      console.log('✅ Token was successfully set in cookies');
      if (cookieToken === authToken) {
        console.log('✅ Cookie token matches the response token');
      } else {
        console.warn('⚠️ Cookie token does not match the response token');
      }
    } else {
      console.warn('⚠️ Token was not set in cookies');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Direct API login failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received. This might indicate a CORS or network issue.');
    }
    return false;
  }
}

// Test profile access with token
async function testProfileAccessWithToken() {
  console.log('\n--- Profile Access with Token Test ---');
  
  if (!authToken) {
    console.log('⚠️ Skipping profile test as login failed');
    return false;
  }
  
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/profile`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      },
      withCredentials: true
    });
    
    console.log('✅ Profile access successful');
    console.log(`✅ Status: ${response.status}`);
    console.log('✅ Response contains user data:', !!response.data);
    console.log(`✅ User email: ${response.data.email}`);
    
    return true;
  } catch (error) {
    console.error('❌ Profile access failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received. This might indicate a CORS or network issue.');
    }
    return false;
  }
}

// Test AuthService login
async function testAuthServiceLogin() {
  console.log('\n--- AuthService Login Test ---');
  
  try {
    // Import AuthService dynamically
    const { default: AuthService } = await import('../services/auth.service');
    
    // Clear any existing auth tokens
    Cookies.remove('authToken');
    
    console.log(`🔍 Attempting login with AuthService: ${testUser.email}`);
    const result = await AuthService.login(testUser.email, testUser.password);
    
    console.log('✅ AuthService login successful');
    console.log('✅ Result:', result);
    
    // Check if token was set in cookies
    const cookieToken = Cookies.get('authToken');
    if (cookieToken) {
      console.log('✅ Token was successfully set in cookies by AuthService');
    } else {
      console.warn('⚠️ Token was not set in cookies by AuthService');
    }
    
    return true;
  } catch (error) {
    console.error('❌ AuthService login failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    return false;
  }
}

// Test AuthService profile
async function testAuthServiceProfile() {
  console.log('\n--- AuthService Profile Test ---');
  
  try {
    // Import AuthService dynamically
    const { default: AuthService } = await import('../services/auth.service');
    
    console.log('🔍 Checking authentication status');
    const isAuthenticated = AuthService.isAuthenticated();
    console.log(`✅ isAuthenticated: ${isAuthenticated}`);
    
    if (!isAuthenticated) {
      console.log('⚠️ Not authenticated, skipping profile test');
      return false;
    }
    
    console.log('🔍 Fetching user profile with AuthService');
    const profile = await AuthService.getProfile();
    
    console.log('✅ AuthService profile fetch successful');
    console.log('✅ Profile data:', profile);
    
    return true;
  } catch (error) {
    console.error('❌ AuthService profile fetch failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    return false;
  }
}

// Test AuthService logout
async function testAuthServiceLogout() {
  console.log('\n--- AuthService Logout Test ---');
  
  try {
    // Import AuthService dynamically
    const { default: AuthService } = await import('../services/auth.service');
    
    console.log('🔍 Logging out with AuthService');
    AuthService.logout();
    
    // Check if token was removed from cookies
    const cookieToken = Cookies.get('authToken');
    if (!cookieToken) {
      console.log('✅ Token was successfully removed from cookies');
    } else {
      console.warn('⚠️ Token was not removed from cookies');
    }
    
    console.log('🔍 Checking authentication status after logout');
    const isAuthenticated = AuthService.isAuthenticated();
    console.log(`✅ isAuthenticated after logout: ${isAuthenticated}`);
    
    if (isAuthenticated) {
      console.error('❌ Still authenticated after logout');
      return false;
    } else {
      console.log('✅ Successfully logged out');
      return true;
    }
  } catch (error) {
    console.error('❌ AuthService logout failed:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('Running Frontend Authentication Validation Tests');
  
  try {
    // Environment and configuration tests
    validateEnvironmentVariables();
    
    // Backend connectivity tests
    const backendHealthy = await testBackendHealth();
    if (!backendHealthy) {
      console.error('❌ Backend is not healthy, skipping remaining tests');
      return;
    }
    
    await testCorsConfiguration();
    
    // Authentication tests
    const loginSuccessful = await testDirectApiLogin();
    if (loginSuccessful) {
      await testProfileAccessWithToken();
    }
    
    // AuthService tests
    await testAuthServiceLogin();
    await testAuthServiceProfile();
    await testAuthServiceLogout();
    
    console.log('\n✅ Frontend authentication validation tests completed!');
  } catch (error) {
    console.error('\n❌ Tests failed:', error.message);
  }
}

// Run the tests
runTests(); 