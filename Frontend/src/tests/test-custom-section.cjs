const axios = require('axios');

// Create a simple API client
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true
});

// Auth API functions
const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  }
};

// Profile API functions
const profileAPI = {
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },
  
  updateProfile: async (profileData) => {
    console.log('Updating profile with data:', JSON.stringify(profileData, null, 2));
    try {
      const response = await api.put('/user/profile', profileData);
      console.log('Profile update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Profile update error:', error.response?.data || error.message);
      throw error;
    }
  }
};

// Helper function to set auth token
const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

async function testAddCustomSection() {
  console.log('Testing add custom section...');
  try {
    // First login to get auth token
    console.log('Logging in...');
    const loginResponse = await authAPI.login({
      email: 'test@example.com',
      password: 'password123'
    });
    
    console.log('Login successful, token:', loginResponse.token.substring(0, 10) + '...');
    setAuthToken(loginResponse.token);
    
    // Get the current profile
    const profile = await profileAPI.getProfile();
    console.log('Current profile sections:', Object.keys(profile.sections || {}));
    
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
        [sectionKey]: {
          id: `custom-${Date.now()}`,
          title: sectionName,
          content: "",
          items: []
        }
      }
    };
    
    // Update the profile with the new sections
    console.log('Sending update with custom section:', sectionKey);
    
    try {
      const response = await profileAPI.updateProfile({
        sections: updatedSections
      });
      
      console.log('Custom section added successfully');
      console.log('Response sections:', Object.keys(response.sections || {}));
      
      return { response, sectionKey };
    } catch (error) {
      console.error('Profile update error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  } catch (error) {
    console.error('Add custom section failed:', error.response?.data?.message || error.message);
    throw error;
  }
}

// Run the test
testAddCustomSection()
  .then(result => {
    console.log('Test completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Test failed:', error.message);
    process.exit(1);
  }); 