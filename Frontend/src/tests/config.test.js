// Test script to check frontend configuration
console.log('Frontend Configuration Test');
console.log('=========================');
console.log('Environment Variables:');
console.log('- VITE_Backend_URL:', import.meta.env.VITE_Backend_URL || 'Not set');
console.log('- VITE_API_URL:', import.meta.env.VITE_API_URL || 'Not set');
console.log('=========================');

// Check for critical configuration issues
const issues = [];

if (!import.meta.env.VITE_Backend_URL) {
  issues.push('VITE_Backend_URL is not set. Backend connections will fail.');
}

if (!import.meta.env.VITE_API_URL) {
  issues.push('VITE_API_URL is not set. API calls will fail.');
}

if (issues.length > 0) {
  console.log('Configuration Issues Found:');
  issues.forEach(issue => console.log(`- ${issue}`));
  console.log('Please fix these issues in your .env file.');
} else {
  console.log('No configuration issues found.');
}

// Check API URL format
if (import.meta.env.VITE_API_URL) {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
    console.log('Warning: VITE_API_URL does not appear to be a valid URL.');
  }
}

console.log('=========================');
console.log('Test completed.');

// Export a function to run the test
export function runConfigTest() {
  console.log('Running frontend configuration test...');
  // The test will run when this file is imported
  return {
    backendUrl: import.meta.env.VITE_Backend_URL,
    apiUrl: import.meta.env.VITE_API_URL,
    hasIssues: issues.length > 0,
    issues
  };
} 