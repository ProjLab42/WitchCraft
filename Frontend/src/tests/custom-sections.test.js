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
    const response = await profileAPI.updateProfile({
      sections: updatedSections
    });
    
    console.log('Custom section added successfully');
    console.log('Updated sections:', Object.keys(response.sections.customSections));
    
    return { response, sectionKey };
  } catch (error) {
    console.error('Add custom section failed:', error);
    throw error;
  }
}

async function testAddCustomItem(sectionKey) {
  console.log(`Testing add custom item to section ${sectionKey}...`);
  try {
    // First get the current profile
    const profile = await profileAPI.getProfile();
    
    // Create a test custom item
    const customItem = {
      id: `custom-item-${Date.now()}`,
      title: 'Test Item',
      description: 'Test Description',
      bulletPoints: [{ id: `bp-${Date.now()}`, text: 'Test bullet point' }]
    };
    
    // Add the custom item to the section
    const updatedSections = {
      ...profile.sections,
      customSections: {
        ...profile.sections.customSections,
        [sectionKey]: [
          ...(profile.sections.customSections[sectionKey] || []),
          customItem
        ]
      }
    };
    
    // Update the profile with the new sections
    console.log('Sending update with custom item:', customItem);
    const response = await profileAPI.updateProfile({
      sections: updatedSections
    });
    
    console.log('Custom item added successfully');
    console.log('Updated custom section items:', response.sections.customSections[sectionKey].length);
    
    return { response, customItem };
  } catch (error) {
    console.error('Add custom item failed:', error);
    throw error;
  }
}

async function testUpdateCustomItem(sectionKey, customItem) {
  console.log(`Testing update custom item in section ${sectionKey}...`);
  try {
    // First get the current profile
    const profile = await profileAPI.getProfile();
    
    // Make sure the section and item exist
    if (!profile.sections.customSections[sectionKey]) {
      throw new Error(`Section ${sectionKey} not found`);
    }
    
    const items = profile.sections.customSections[sectionKey];
    const itemIndex = items.findIndex(item => item.id === customItem.id);
    
    if (itemIndex === -1) {
      throw new Error(`Item ${customItem.id} not found in section ${sectionKey}`);
    }
    
    // Update the custom item
    const updatedItem = {
      ...customItem,
      title: `${customItem.title} (Updated)`,
      description: `${customItem.description} (Updated)`,
      bulletPoints: [
        ...customItem.bulletPoints,
        { id: `bp-update-${Date.now()}`, text: 'Updated bullet point' }
      ]
    };
    
    // Create updated sections with the updated item
    const updatedItems = [...items];
    updatedItems[itemIndex] = updatedItem;
    
    const updatedSections = {
      ...profile.sections,
      customSections: {
        ...profile.sections.customSections,
        [sectionKey]: updatedItems
      }
    };
    
    // Update the profile with the updated sections
    console.log('Sending update with updated custom item:', updatedItem);
    const response = await profileAPI.updateProfile({
      sections: updatedSections
    });
    
    console.log('Custom item updated successfully');
    console.log('Updated custom item:', response.sections.customSections[sectionKey][itemIndex]);
    
    return { response, updatedItem };
  } catch (error) {
    console.error('Update custom item failed:', error);
    throw error;
  }
}

// Run tests
async function runTests() {
  try {
    await testLogin();
    const { sectionKey } = await testAddCustomSection();
    const { customItem } = await testAddCustomItem(sectionKey);
    await testUpdateCustomItem(sectionKey, customItem);
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Tests failed:', error.message);
  }
}

// Export the test functions
export { runTests, testLogin, testAddCustomSection, testAddCustomItem, testUpdateCustomItem }; 