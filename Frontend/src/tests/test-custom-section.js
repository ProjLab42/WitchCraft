import { profileAPI } from '../services/api.service.ts';

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
    console.log('Updated sections:', JSON.stringify(updatedSections, null, 2));
    
    const response = await profileAPI.updateProfile({
      sections: updatedSections
    });
    
    console.log('Custom section added successfully');
    console.log('Response sections:', JSON.stringify(response.sections, null, 2));
    
    return { response, sectionKey };
  } catch (error) {
    console.error('Add custom section failed:', error);
    throw error;
  }
}

// Run the test
testAddCustomSection()
  .then(result => {
    console.log('Test completed successfully');
  })
  .catch(error => {
    console.error('Test failed:', error);
  }); 