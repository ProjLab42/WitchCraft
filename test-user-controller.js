/**
 * Test script to check if the user controller is properly handling the resume data
 */

const axios = require('axios');

// Test data with the same structure as the frontend sends
const testData = {
  personalInfo: {
    selected: true,
    name: "Nuh Al-Sharafi",
    email: "test@example.com",
    phone: "+90 5411205169",
    title: "Math 102 Learning Assistant",
    location: "Not provided",
    bio: "Not provided",
    links: {
      portfolio: "https://nuh.najeeb.alsharafi"
    }
  },
  certifications: [
    {
      id: "cert1",
      selected: true,
      name: "CCNA (Cisco Certified Network Associate)",
      issuer: "New Horizons Computer Learning Centers",
      date: "Apr 2022",
      bulletPoints: []
    },
    {
      id: "cert2",
      selected: true,
      name: "Certified Ethical Hacker",
      issuer: "New Horizons Computer Learning Centers",
      date: "Mar 2022",
      bulletPoints: []
    },
    {
      id: "cert3",
      selected: true,
      name: "CompTia Security+",
      issuer: "New Horizons Computer Learning Centers",
      date: "Jan 2022",
      bulletPoints: []
    },
    {
      id: "cert4",
      selected: true,
      name: "CompTia Network+",
      issuer: "New Horizons Computer Learning Centers",
      date: "Oct 2021",
      bulletPoints: []
    }
  ],
  experience: [],
  education: [],
  skills: [],
  projects: []
};

// Test function
async function testSaveResumeData() {
  try {
    console.log('Testing resume data saving endpoint...');
    
    // Get token from login
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('Login successful, got token');
    
    // Save resume data
    const saveResponse = await axios.post(
      'http://localhost:5000/api/user/profile/resume-data',
      testData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Resume data saved successfully!');
    console.log('Response:', saveResponse.data);
    
    return true;
  } catch (error) {
    console.error('Error saving resume data:');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server');
      console.error('Request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
    
    return false;
  }
}

// Run the test
testSaveResumeData()
  .then(success => {
    console.log('Test completed:', success ? 'PASSED' : 'FAILED');
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  }); 