const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
require('dotenv').config();

// Test CV document creation
const testCreateCV = async () => {
  try {
    // Your test code will go here
    console.log('Test: Creating CV document');
    
    // Add your test logic here
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.connection.close();
  }
};

// Run the test
connectDB().then(() => {
  testCreateCV();
});
