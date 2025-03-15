/**
 * Comprehensive Authentication Validation Test
 * 
 * This test script validates the entire authentication flow, checking for consistency
 * in environment variables, token handling, and user authentication.
 */

const axios = require('axios');
const assert = require('assert');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Test configuration
const API_URL = 'http://127.0.0.1:5000';
const API_ENDPOINT = `${API_URL}/api`;

// Test user credentials
const testUser = {
  email: 'test@example.com',
  password: 'password123'
};

// Store tokens and user data for tests
let authToken = null;
let userId = null;

// Validate environment variables
function validateEnvironmentVariables() {
  console.log('\n--- Environment Variables Validation ---');
  
  // Required environment variables
  const requiredVars = [
    'PORT',
    'NODE_ENV',
    'MONGODB_URI',
    'JWT_SECRET',
    'FRONTEND_URL'
  ];
  
  let missingVars = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    } else {
      console.log(`✅ ${varName} is set: ${varName === 'JWT_SECRET' ? '[REDACTED]' : process.env[varName]}`);
    }
  }
  
  if (missingVars.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
  }
  
  // Check for development mode settings
  if (process.env.NODE_ENV === 'development') {
    console.log('⚠️ Running in development mode');
    
    if (process.env.DISABLE_AUTH === 'true') {
      console.log('⚠️ Authentication is disabled in development mode');
    }
  }
  
  console.log('✅ All required environment variables are set');
}

// Test database connection
async function testDatabaseConnection() {
  console.log('\n--- Database Connection Test ---');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check if test user exists
    const User = mongoose.model('User');
    const user = await User.findOne({ email: testUser.email });
    
    if (user) {
      console.log(`✅ Test user exists: ${user._id}`);
      userId = user._id.toString();
    } else {
      console.log('❌ Test user does not exist');
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

// Test health endpoints
async function testHealthEndpoints() {
  console.log('\n--- Health Endpoints Test ---');
  
  try {
    // Root health endpoint
    const rootResponse = await axios.get(`${API_URL}/health`);
    assert.strictEqual(rootResponse.status, 200);
    assert.strictEqual(rootResponse.data.status, 'ok');
    console.log('✅ Root health endpoint is working');
    
    // API health endpoint
    const apiResponse = await axios.get(`${API_ENDPOINT}/health`);
    assert.strictEqual(apiResponse.status, 200);
    assert.strictEqual(apiResponse.data.status, 'ok');
    console.log('✅ API health endpoint is working');
  } catch (error) {
    console.error('❌ Health endpoints test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    process.exit(1);
  }
}

// Test CORS configuration
async function testCorsConfiguration() {
  console.log('\n--- CORS Configuration Test ---');
  
  try {
    // Test with frontend origin
    const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    const response = await axios.options(`${API_ENDPOINT}/auth/login`, {
      headers: {
        'Origin': frontendOrigin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    });
    
    assert.strictEqual(response.status, 204);
    assert(response.headers['access-control-allow-origin']);
    assert(response.headers['access-control-allow-methods']);
    assert(response.headers['access-control-allow-headers']);
    
    console.log('✅ CORS is properly configured for frontend origin');
    console.log(`✅ Access-Control-Allow-Origin: ${response.headers['access-control-allow-origin']}`);
    console.log(`✅ Access-Control-Allow-Methods: ${response.headers['access-control-allow-methods']}`);
    console.log(`✅ Access-Control-Allow-Headers: ${response.headers['access-control-allow-headers']}`);
    
    // Verify credentials are allowed
    assert(response.headers['access-control-allow-credentials']);
    console.log('✅ Credentials are allowed in CORS');
  } catch (error) {
    console.error('❌ CORS configuration test failed:', error.message);
    if (error.response) {
      console.error('Response headers:', error.response.headers);
    }
    process.exit(1);
  }
}

// Test login with valid credentials
async function testLoginWithValidCredentials() {
  console.log('\n--- Login with Valid Credentials Test ---');
  
  try {
    const response = await axios.post(`${API_ENDPOINT}/auth/login`, testUser);
    
    assert.strictEqual(response.status, 200);
    assert(response.data.token, 'Response should have a token');
    assert(response.data.user, 'Response should have user data');
    assert.strictEqual(response.data.user.email, testUser.email);
    
    // Save token for subsequent tests
    authToken = response.data.token;
    
    // Validate token structure
    const tokenParts = authToken.split('.');
    assert.strictEqual(tokenParts.length, 3, 'Token should have 3 parts (header, payload, signature)');
    
    // Decode token payload
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    assert(payload.userId, 'Token should contain userId');
    assert(payload.iat, 'Token should contain issued at timestamp');
    assert(payload.exp, 'Token should contain expiration timestamp');
    
    // Verify token expiration
    const expirationDate = new Date(payload.exp * 1000);
    const now = new Date();
    assert(expirationDate > now, 'Token should not be expired');
    
    console.log('✅ Login successful with valid credentials');
    console.log('✅ Token structure is valid');
    console.log(`✅ Token expires on: ${expirationDate.toISOString()}`);
    
    // Verify token with JWT secret
    try {
      const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
      assert.strictEqual(decoded.userId, payload.userId);
      console.log('✅ Token can be verified with JWT_SECRET');
    } catch (error) {
      console.error('❌ Token verification failed:', error.message);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Login test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    process.exit(1);
  }
}

// Test login with invalid credentials
async function testLoginWithInvalidCredentials() {
  console.log('\n--- Login with Invalid Credentials Test ---');
  
  try {
    await axios.post(`${API_ENDPOINT}/auth/login`, {
      email: testUser.email,
      password: 'wrongpassword'
    });
    
    console.error('❌ Login with invalid credentials should fail but succeeded');
    process.exit(1);
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Login with invalid credentials correctly failed with 400 status');
      console.log(`✅ Error message: ${error.response.data.message}`);
    } else {
      console.error('❌ Login with invalid credentials failed with unexpected error:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      process.exit(1);
    }
  }
}

// Test user profile access with token
async function testUserProfileWithToken() {
  console.log('\n--- User Profile Access with Token Test ---');
  
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
    
    console.log('✅ Profile access successful with token');
    console.log('✅ User data matches test user');
  } catch (error) {
    console.error('❌ Profile access test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    process.exit(1);
  }
}

// Test user profile access without token
async function testUserProfileWithoutToken() {
  console.log('\n--- User Profile Access without Token Test ---');
  
  try {
    await axios.get(`${API_ENDPOINT}/user/profile`);
    
    if (process.env.NODE_ENV === 'development' && process.env.DISABLE_AUTH === 'true') {
      console.log('⚠️ Profile access without token succeeded, but this is expected in development mode with DISABLE_AUTH=true');
    } else {
      console.error('❌ Profile access without token should fail but succeeded');
      process.exit(1);
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development' && process.env.DISABLE_AUTH === 'true') {
      console.error('❌ Profile access without token failed, but should succeed in development mode with DISABLE_AUTH=true');
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      process.exit(1);
    } else if (error.response && error.response.status === 401) {
      console.log('✅ Profile access without token correctly failed with 401 status');
      console.log(`✅ Error message: ${error.response.data.message}`);
    } else {
      console.error('❌ Profile access without token failed with unexpected error:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      process.exit(1);
    }
  }
}

// Test user profile access with invalid token
async function testUserProfileWithInvalidToken() {
  console.log('\n--- User Profile Access with Invalid Token Test ---');
  
  try {
    await axios.get(`${API_ENDPOINT}/user/profile`, {
      headers: {
        Authorization: 'Bearer invalidtoken'
      }
    });
    
    if (process.env.NODE_ENV === 'development' && process.env.DISABLE_AUTH === 'true') {
      console.log('⚠️ Profile access with invalid token succeeded, but this is expected in development mode with DISABLE_AUTH=true');
    } else {
      console.error('❌ Profile access with invalid token should fail but succeeded');
      process.exit(1);
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development' && process.env.DISABLE_AUTH === 'true') {
      console.error('❌ Profile access with invalid token failed, but should succeed in development mode with DISABLE_AUTH=true');
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      process.exit(1);
    } else if (error.response && error.response.status === 401) {
      console.log('✅ Profile access with invalid token correctly failed with 401 status');
      console.log(`✅ Error message: ${error.response.data.message}`);
    } else {
      console.error('❌ Profile access with invalid token failed with unexpected error:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      process.exit(1);
    }
  }
}

// Run all tests
async function runTests() {
  console.log('Running Comprehensive Authentication Validation Tests');
  
  try {
    // Environment and configuration tests
    validateEnvironmentVariables();
    await testDatabaseConnection();
    await testHealthEndpoints();
    await testCorsConfiguration();
    
    // Authentication tests
    await testLoginWithValidCredentials();
    await testLoginWithInvalidCredentials();
    await testUserProfileWithToken();
    await testUserProfileWithoutToken();
    await testUserProfileWithInvalidToken();
    
    console.log('\n✅ All authentication validation tests passed!');
  } catch (error) {
    console.error('\n❌ Tests failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
runTests(); 