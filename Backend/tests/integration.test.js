const axios = require('axios');
const assert = require('assert');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const API_URL = 'http://127.0.0.1:5000';
const API_ENDPOINT = `${API_URL}/api`;

// Test user credentials
const testUser = {
  email: 'test@example.com',
  password: 'password123'
};

let authToken = null;

// Simple test runner
async function runTests() {
  console.log('Running Backend API Integration Tests');
  
  try {
    // Test health endpoint
    console.log('\n--- Health Check Tests ---');
    await testHealthEndpoint();
    await testApiHealthEndpoint();
    
    // Test authentication
    console.log('\n--- Authentication Tests ---');
    await testLogin();
    
    // Test user profile
    console.log('\n--- User Profile Tests ---');
    await testUserProfile();
    await testUserProfileWithBypass();
    
    // Test CORS
    console.log('\n--- CORS Tests ---');
    await testCorsHeaders();
    await testCorsPreflightRequest();
    
    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('\n❌ Tests failed:', error.message);
    process.exit(1);
  }
}

// Health endpoint tests
async function testHealthEndpoint() {
  try {
    const response = await axios.get(`${API_URL}/health`);
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data.status, 'ok');
    console.log('✅ Health check passed');
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    throw error;
  }
}

async function testApiHealthEndpoint() {
  try {
    const response = await axios.get(`${API_ENDPOINT}/health`);
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data.status, 'ok');
    console.log('✅ API health check passed');
  } catch (error) {
    console.error('❌ API health check failed:', error.message);
    throw error;
  }
}

// Authentication tests
async function testLogin() {
  try {
    const response = await axios.post(`${API_ENDPOINT}/auth/login`, testUser);
    assert.strictEqual(response.status, 200);
    assert(response.data.token, 'Response should have a token');
    assert(response.data.user, 'Response should have user data');
    assert.strictEqual(response.data.user.email, testUser.email);
    
    // Save token for subsequent tests
    authToken = response.data.token;
    console.log('✅ Login test passed, token received');
  } catch (error) {
    console.error('❌ Login test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
}

// User profile tests
async function testUserProfile() {
  try {
    // Skip if login failed
    if (!authToken) {
      console.log('⚠️ Skipping profile test as login failed');
      return;
    }

    const response = await axios.get(`${API_ENDPOINT}/user/profile`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    
    assert.strictEqual(response.status, 200);
    assert(response.data._id, 'Response should have _id');
    assert.strictEqual(response.data.email, testUser.email);
    console.log('✅ Profile fetch test passed');
  } catch (error) {
    console.error('❌ Profile fetch test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
}

async function testUserProfileWithBypass() {
  try {
    // This test relies on DISABLE_AUTH=true in .env
    const response = await axios.get(`${API_ENDPOINT}/user/profile`);
    
    assert.strictEqual(response.status, 200);
    assert(response.data._id, 'Response should have _id');
    console.log('✅ Profile fetch with auth bypass test passed');
  } catch (error) {
    console.error('❌ Profile fetch with auth bypass test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
}

// CORS tests
async function testCorsHeaders() {
  try {
    const response = await axios.get(`${API_URL}/health`, {
      headers: {
        Origin: 'http://localhost:5173'
      }
    });
    
    assert.strictEqual(response.status, 200);
    assert(response.headers['access-control-allow-origin'], 'Response should have CORS headers');
    console.log('✅ CORS test passed');
  } catch (error) {
    console.error('❌ CORS test failed:', error.message);
    if (error.response) {
      console.error('Response headers:', error.response.headers);
    }
    throw error;
  }
}

async function testCorsPreflightRequest() {
  try {
    const response = await axios.options(`${API_ENDPOINT}/user/profile`, {
      headers: {
        Origin: 'http://localhost:5173',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Authorization,Content-Type'
      }
    });
    
    assert.strictEqual(response.status, 204);
    assert(response.headers['access-control-allow-origin'], 'Response should have CORS headers');
    assert(response.headers['access-control-allow-methods'], 'Response should have allowed methods');
    assert(response.headers['access-control-allow-headers'], 'Response should have allowed headers');
    console.log('✅ CORS preflight test passed');
  } catch (error) {
    console.error('❌ CORS preflight test failed:', error.message);
    if (error.response) {
      console.error('Response headers:', error.response.headers);
    }
    throw error;
  }
}

// Run the tests
runTests(); 