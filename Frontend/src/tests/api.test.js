import { profileAPI, authAPI } from '../services/api.service';

// Test user credentials
const testUser = {
  email: 'test@example.com',
  password: 'password123'
};

// Helper function to set auth cookie
const setAuthCookie = (token) => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7);
  document.cookie = `authToken=${token}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
};

// Test functions
async function testLogin() {
  console.log('Testing user login...');
  try {
    const response = await authAPI.login(testUser.email, testUser.password);
    console.log('Login successful:', response);
    setAuthCookie(response.token);
    return response;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

async function testGetUserProfile() {
  console.log('Testing get user profile...');
  try {
    const response = await profileAPI.getProfile();
    console.log('Get user profile successful');
    console.log('User data structure:', Object.keys(response));
    
    // Check if sections exist in the response
    if (response.sections) {
      console.log('Sections found in response:', Object.keys(response.sections));
    } else {
      console.error('No sections found in user profile response');
    }
    
    return response;
  } catch (error) {
    console.error('Get user profile failed:', error);
    throw error;
  }
}

// Run tests
async function runTests() {
  try {
    await testLogin();
    await testGetUserProfile();
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Tests failed:', error.message);
  }
}

// Export the test functions
export { runTests, testLogin, testGetUserProfile }; 