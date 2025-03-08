// Test script to check backend configuration
require('dotenv').config();

console.log('Backend Configuration Test');
console.log('=========================');
console.log('Environment Variables:');
console.log('- PORT:', process.env.PORT || '5000 (default)');
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'Set (hidden for security)' : 'Not set');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'Set (hidden for security)' : 'Not set');
console.log('- FRONTEND_URL:', process.env.FRONTEND_URL || 'Not set');
console.log('=========================');

// Check for critical configuration issues
const issues = [];

if (!process.env.MONGODB_URI) {
  issues.push('MONGODB_URI is not set. Database connections will fail.');
}

if (!process.env.JWT_SECRET) {
  issues.push('JWT_SECRET is not set. Authentication will not work properly.');
}

if (!process.env.FRONTEND_URL) {
  issues.push('FRONTEND_URL is not set. CORS might block requests from the frontend.');
}

if (issues.length > 0) {
  console.log('Configuration Issues Found:');
  issues.forEach(issue => console.log(`- ${issue}`));
  console.log('Please fix these issues in your .env file.');
} else {
  console.log('No configuration issues found.');
}

// Check if MongoDB connection string is valid
if (process.env.MONGODB_URI) {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
    console.log('Warning: MONGODB_URI does not appear to be a valid MongoDB connection string.');
  }
}

console.log('=========================');
console.log('Test completed.'); 