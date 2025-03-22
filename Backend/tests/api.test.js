const axios = require('axios');

const API_URL = 'http://localhost:5003/api';
let authToken = '';

// Test user credentials
const testUser = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User'
};

// Test functions
async function testRegister() {
  try {
    console.log('Testing user registration...');
    const response = await axios.post(`${API_URL}/auth/register`, testUser);
    console.log('Registration successful:', response.data);
    authToken = response.data.token; // Set token from registration response
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error.response?.data || error.message);
    // If user already exists, try to login
    return await testLogin();
  }
}

async function testLogin() {
  try {
    console.log('Testing user login...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('Login successful:', response.data);
    authToken = response.data.token; // Set token from login response
    return response.data;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testGetUserProfile() {
  try {
    console.log('Testing get user profile...');
    console.log('Using token:', authToken);
    const response = await axios.get(`${API_URL}/user/profile`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    console.log('Get user profile successful');
    console.log('User data structure:', Object.keys(response.data));
    
    // Check if sections exist in the response
    if (response.data.sections) {
      console.log('Sections found in response:', Object.keys(response.data.sections));
    } else {
      console.error('No sections found in user profile response');
    }
    
    return response.data;
  } catch (error) {
    console.error('Get user profile failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testUpdateUserProfile() {
  try {
    console.log('Testing update user profile...');
    const updateData = {
      name: 'Updated Test User',
      title: 'Software Developer',
      bio: 'This is a test bio',
      location: 'Test City',
      links: {
        linkedin: 'https://linkedin.com/in/testuser',
        portfolio: 'https://testuser.com'
      },
      sections: {
        sectionMeta: {
          "experience": { name: "Experience", deletable: true, renamable: true },
          "education": { name: "Education", deletable: true, renamable: true },
          "skills": { name: "Skills", deletable: true, renamable: true },
          "projects": { name: "Projects", deletable: true, renamable: true },
          "certifications": { name: "Certifications", deletable: true, renamable: true }
        },
        experience: [{
          id: `exp-${Date.now()}`,
          title: 'Test Position',
          company: 'Test Company',
          period: '2020 - Present',
          description: 'Test description',
          bulletPoints: [{ id: `bp-${Date.now()}`, text: 'Test bullet point' }]
        }],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
        customSections: {}
      }
    };
    
    const response = await axios.put(`${API_URL}/user/profile`, updateData, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    console.log('Update user profile successful');
    console.log('Updated user data structure:', Object.keys(response.data));
    
    // Check if sections exist in the response
    if (response.data.sections) {
      console.log('Sections found in updated response:', Object.keys(response.data.sections));
    } else {
      console.error('No sections found in updated user profile response');
    }
    
    return response.data;
  } catch (error) {
    console.error('Update user profile failed:', error.response?.data || error.message);
    throw error;
  }
}

// Run tests
async function runTests() {
  try {
    // First try to login, if that fails, register a new user
    try {
      await testLogin();
    } catch (error) {
      await testRegister();
    }
    
    // Test getting user profile
    const userProfile = await testGetUserProfile();
    
    // Test updating user profile
    await testUpdateUserProfile();
    
    // Test getting user profile again to verify update
    await testGetUserProfile();
    
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Tests failed:', error.message);
  }
}

// Run the tests
runTests(); 