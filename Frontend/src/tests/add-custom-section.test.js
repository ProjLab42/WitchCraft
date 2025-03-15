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

async function testAddCustomSection() {
  console.log('Testing add custom section...');
  try {
    // First get the current profile
    const profile = await profileAPI.getProfile();
    console.log('Current profile sections:', profile.sections);
    
    // Create a test custom section
    const sectionName = 'Test Section ' + Date.now();
    const sectionKey = sectionName.toLowerCase().replace(/\s+/g, '-');
    
    // Add the custom section to the sections
    const updatedSections = {
      ...profile.sections,
      sectionMeta: {
        ...profile.sections.sectionMeta,
        [sectionKey]: { name: sectionName, deletable: true, renamable: true }
      },
      customSections: {
        ...profile.sections.customSections,
        [sectionKey]: []
      }
    };
    
    // Update the profile with the new sections
    console.log('Sending update with custom section:', sectionKey);
    console.log('Updated sections:', updatedSections);
    
    const response = await profileAPI.updateProfile({
      sections: updatedSections
    });
    
    console.log('Custom section added successfully');
    console.log('Response sections:', response.sections);
    console.log('Response custom sections:', response.sections.customSections);
    
    return { response, sectionKey };
  } catch (error) {
    console.error('Add custom section failed:', error);
    throw error;
  }
}

// Run tests
async function runTests() {
  try {
    await testLogin();
    await testAddCustomSection();
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Tests failed:', error.message);
  }
}

// Export the test functions
export { runTests, testLogin, testAddCustomSection }; 