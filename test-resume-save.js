/**
 * Test script to check if the resume data saving endpoint is working correctly
 */

const axios = require('axios');

// Test data
const testData = {
  personalInfo: {
    selected: true,
    name: "Test User",
    email: "test@example.com",
    phone: "123-456-7890",
    title: "Software Developer",
    location: "San Francisco, CA",
    bio: "Experienced software developer with a passion for building great products."
  },
  experience: [
    {
      id: "exp1",
      selected: true,
      company: "Test Company",
      title: "Software Engineer",
      period: "2020 - Present",
      description: "Worked on various projects",
      bulletPoints: [
        { text: "Developed web applications using React" },
        { text: "Implemented RESTful APIs using Node.js" }
      ]
    }
  ],
  education: [
    {
      id: "edu1",
      selected: true,
      institution: "Test University",
      degree: "Bachelor of Science in Computer Science",
      year: "2016 - 2020",
      bulletPoints: [
        { text: "GPA: 3.8/4.0" },
        { text: "Relevant coursework: Data Structures, Algorithms, Web Development" }
      ]
    }
  ],
  skills: [
    {
      id: "skill1",
      selected: true,
      name: "JavaScript"
    },
    {
      id: "skill2",
      selected: true,
      name: "React"
    }
  ],
  certifications: [
    {
      id: "cert1",
      selected: true,
      name: "CCNA (Cisco Certified Network Associate)",
      issuer: "New Horizons Computer Learning Centers",
      date: "Apr 2022"
    }
  ]
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