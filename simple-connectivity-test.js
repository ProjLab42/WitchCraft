/**
 * Simple Connectivity Test
 * 
 * This script tests basic connectivity between frontend and backend.
 */

const axios = require('axios');

// Test backend health endpoint
async function testBackendHealth() {
  console.log('Testing backend health endpoint...');
  try {
    const response = await axios.get('http://localhost:5000/health');
    console.log('✅ Backend health endpoint is working');
    console.log(`✅ Status: ${response.status}`);
    console.log(`✅ Data: ${JSON.stringify(response.data)}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to backend health endpoint:', error.message);
    return false;
  }
}

// Test backend API health endpoint
async function testBackendApiHealth() {
  console.log('\nTesting backend API health endpoint...');
  try {
    const response = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Backend API health endpoint is working');
    console.log(`✅ Status: ${response.status}`);
    console.log(`✅ Data: ${JSON.stringify(response.data)}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to backend API health endpoint:', error.message);
    return false;
  }
}

// Test CORS configuration
async function testCorsConfiguration() {
  console.log('\nTesting CORS configuration...');
  try {
    const response = await axios.options('http://localhost:5000/api/auth/login', {
      headers: {
        'Origin': 'http://localhost:5173',
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

// Test login with test user
async function testLogin() {
  console.log('\nTesting login with test user...');
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    
    console.log('✅ Login successful');
    console.log(`✅ Status: ${response.status}`);
    console.log('✅ Response contains token:', !!response.data.token);
    console.log('✅ Response contains user data:', !!response.data.user);
    
    return response.data.token;
  } catch (error) {
    console.error('❌ Login test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    return null;
  }
}

// Test user profile access with token
async function testUserProfile(token) {
  if (!token) {
    console.log('\n⚠️ Skipping profile test as login failed');
    return false;
  }
  
  console.log('\nTesting user profile access with token...');
  try {
    const response = await axios.get('http://localhost:5000/api/user/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('✅ Profile access successful');
    console.log(`✅ Status: ${response.status}`);
    console.log('✅ Response contains user data:', !!response.data);
    console.log(`✅ User email: ${response.data.email}`);
    
    return true;
  } catch (error) {
    console.error('❌ Profile access test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('Running Simple Connectivity Tests\n');
  
  let success = true;
  
  // Test backend health
  success = await testBackendHealth() && success;
  
  // Test backend API health
  success = await testBackendApiHealth() && success;
  
  // Test CORS configuration
  success = await testCorsConfiguration() && success;
  
  // Test login
  const token = await testLogin();
  success = !!token && success;
  
  // Test user profile
  success = await testUserProfile(token) && success;
  
  // Print overall result
  console.log('\n=== Test Results ===');
  if (success) {
    console.log('✅ All connectivity tests passed!');
  } else {
    console.log('❌ Some connectivity tests failed. See details above.');
  }
  
  return success;
}

// Run the tests
runTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  }); 