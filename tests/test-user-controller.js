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
    const loginResponse = await axios.post('http://localhost:5003/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('Login successful, got token');
    
    // Save resume data
    const saveResponse = await axios.post(
      'http://localhost:5003/api/user/profile/resume-data',
      testData,
      {
        headers: {
          'Authorization': `