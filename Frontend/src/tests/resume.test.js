import { profileAPI, authAPI } from '../services/api.service';

// Helper function to set auth cookie
const setAuthCookie = (token) => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7);
  document.cookie = `authToken=${token}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
};

// Test user credentials
const testUser = {
  email: 'test@example.com',
  password: 'password123'
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

async function testUpdateResumeSections() {
  console.log('Testing update resume sections...');
  try {
    // First get the current profile
    const profile = await profileAPI.getProfile();
    
    // Create a test experience item
    const testExperience = {
      id: `exp-${Date.now()}`,
      title: 'Test Position',
      company: 'Test Company',
      period: '2020 - Present',
      description: 'Test description',
      bulletPoints: [{ id: `bp-${Date.now()}`, text: 'Test bullet point' }]
    };
    
    // Add the test experience to the sections
    const updatedSections = {
      ...profile.sections,
      experience: [...(profile.sections.experience || []), testExperience]
    };
    
    // Update the profile with the new sections
    console.log('Sending update with sections:', updatedSections);
    const response = await profileAPI.updateProfile({
      sections: updatedSections
    });
    
    console.log('Update successful');
    console.log('Updated user data structure:', Object.keys(response));
    
    // Check if sections exist in the response
    if (response.sections) {
      console.log('Sections found in updated response:', Object.keys(response.sections));
      console.log('Experience items count:', response.sections.experience.length);
    } else {
      console.error('No sections found in updated user profile response');
    }
    
    return response;
  } catch (error) {
    console.error('Update resume sections failed:', error);
    throw error;
  }
}

// Run tests
async function runTests() {
  try {
    await testLogin();
    await testGetUserProfile();
    await testUpdateResumeSections();
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Tests failed:', error.message);
  }
}

// Export the test functions
export { runTests, testLogin, testGetUserProfile, testUpdateResumeSections }; 