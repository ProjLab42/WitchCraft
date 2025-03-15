/**
 * Create Test User Script
 * 
 * This script ensures that a test user exists in the database for authentication testing.
 * It will create the user if it doesn't exist, or update it if it already exists.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Test user credentials
const testUser = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User',
  role: 'user'
};

// Connect to MongoDB
async function connectToDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
}

// Create or update test user
async function createOrUpdateTestUser() {
  try {
    // Import the User model
    require('../src/models/user.model');
    const User = mongoose.model('User');
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: testUser.email });
    
    if (existingUser) {
      console.log(`Test user already exists with ID: ${existingUser._id}`);
      
      // Update password if needed
      const passwordMatches = await bcrypt.compare(testUser.password, existingUser.password);
      
      if (!passwordMatches) {
        console.log('Updating test user password...');
        existingUser.password = testUser.password; // Will be hashed by pre-save hook
        await existingUser.save();
        console.log('Test user password updated successfully');
      } else {
        console.log('Test user password is already correct');
      }
      
      return existingUser;
    } else {
      console.log('Creating new test user...');
      const newUser = new User(testUser);
      await newUser.save();
      console.log(`Test user created successfully with ID: ${newUser._id}`);
      return newUser;
    }
  } catch (error) {
    console.error('Failed to create or update test user:', error.message);
    process.exit(1);
  }
}

// Main function
async function main() {
  try {
    await connectToDatabase();
    const user = await createOrUpdateTestUser();
    console.log('Test user details:');
    console.log(`- ID: ${user._id}`);
    console.log(`- Email: ${user.email}`);
    console.log(`- Name: ${user.name}`);
    console.log(`- Role: ${user.role}`);
    console.log('\nYou can now run the authentication validation tests with this user.');
  } catch (error) {
    console.error('An error occurred:', error.message);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
main(); 