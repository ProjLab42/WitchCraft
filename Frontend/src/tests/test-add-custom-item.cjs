const axios = require('axios');

// Create a simple API client
const api = axios.create({
  baseURL: 'http://localhost:5003/api',
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

async function testAddCustomItem() {
  console.log('Testing add custom item...');
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
    
    // Find a custom section to add an item to
    const customSections = profile.sections.customSections;
    const customSectionKeys = Object.keys(customSections);
    
    if (customSectionKeys.length === 0) {
      console.log('No custom sections found. Creating one first...');
      
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
      console.log('Creating custom section:', sectionKey);
      
      const updatedProfile = await profileAPI.updateProfile({
        sections: updatedSections
      });
      
      console.log('Custom section created successfully');
      
      // Use the updated profile
      profile.sections = updatedProfile.sections;
      customSectionKeys.push(sectionKey);
    }
    
    // Select the first custom section
    const sectionKey = customSectionKeys[0];
    console.log('Using custom section:', sectionKey);
    
    // Create a new item for the custom section
    const newItem = {
      id: `item-${Date.now()}`,
      title: 'Test Item ' + Date.now(),
      subtitle: 'Test Subtitle',
      date: '2025',
      description: 'Test Description',
      bulletPoints: [
        {
          id: `bp-${Date.now()}`,
          text: 'Test bullet point'
        }
      ]
    };
    
    // Get the current section
    const currentSection = profile.sections.customSections[sectionKey];
    
    // Create updated sections data
    const updatedSections = {
      ...profile.sections,
      customSections: {
        ...profile.sections.customSections,
        [sectionKey]: {
          ...currentSection,
          items: [...(currentSection.items || []), newItem]
        }
      }
    };
    
    // Update the profile with the new item
    console.log('Adding item to custom section:', sectionKey);
    
    const response = await profileAPI.updateProfile({
      sections: updatedSections
    });
    
    console.log('Custom item added successfully');
    console.log('Updated section items count:', response.sections.customSections[sectionKey].items.length);
    
    return { response, sectionKey };
  } catch (error) {
    console.error('Add custom item failed:', error.response?.data?.message || error.message);
    throw error;
  }
}

// Run the test
testAddCustomItem()
  .then(result => {
    console.log('Test completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Test failed:', error.message);
    process.exit(1);
  }); 