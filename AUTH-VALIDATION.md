# Authentication Validation Framework

This document outlines the authentication validation framework for the WitchCraft application. The framework consists of comprehensive tests for both the backend and frontend to ensure that the authentication flow works correctly and consistently.

## Overview

The authentication validation framework tests the following aspects of the application:

1. **Environment Variables**: Ensures all required environment variables are set and properly formatted.
2. **Database Connection**: Verifies the connection to MongoDB and checks if test users exist.
3. **Health Endpoints**: Tests the health endpoints to ensure the server is running correctly.
4. **CORS Configuration**: Validates that CORS is properly configured for cross-origin requests.
5. **Authentication Flow**: Tests the complete authentication flow, including:
   - Login with valid credentials
   - Login with invalid credentials
   - User profile access with valid token
   - User profile access without token
   - User profile access with invalid token
6. **Token Handling**: Verifies that JWT tokens are properly generated, validated, and stored.
7. **Frontend-Backend Integration**: Ensures that the frontend can communicate with the backend API.

## Test Files

The framework consists of the following files:

1. **Backend Test**: `Backend/tests/auth-validation.test.js`
2. **Frontend Test**: `Frontend/src/tests/auth-validation.test.js`
3. **Test Runner**: `test-auth-flow.js`
4. **Test User Creation Script**: `Backend/scripts/create-test-user.js`
5. **Environment Variables Checker**: `check-env-vars.js`
6. **Setup Script**: `setup-auth-validation.js`

## Getting Started

### Setup

To set up the authentication validation framework, run the setup script:

```bash
# Make the script executable (if not already)
chmod +x setup-auth-validation.js

# Run the setup script
./setup-auth-validation.js
```

This script will:
- Verify the project structure
- Create necessary directories if they don't exist
- Install required dependencies
- Make the test scripts executable

### Prerequisites

Before running the tests, ensure that:

1. Both the backend and frontend servers are running.
2. A test user exists in the database with the following credentials:
   - Email: `test@example.com`
   - Password: `password123`
3. All required environment variables are set in both `.env` files.

## Checking Environment Variables

To check if your environment variables are correctly set up and consistent between the frontend and backend, run:

```bash
# Make the script executable (if not already)
chmod +x check-env-vars.js

# Run the environment variables checker
./check-env-vars.js
```

This script will:
- Check if both `.env` files exist
- Verify that all required variables are present
- Validate URL formats
- Check for consistency between frontend and backend URLs
- Provide recommendations if issues are found

## Setting Up the Test User

To create the test user required for the authentication tests, run the following command:

```bash
# Navigate to the Backend directory
cd Backend

# Run the create-test-user script
node scripts/create-test-user.js
```

This script will:
- Check if a user with the email `test@example.com` already exists
- Create the user if it doesn't exist
- Update the password if the user exists but has a different password
- Display the user details, including the user ID

## Running the Tests

### Option 1: Run the Comprehensive Test Suite

The easiest way to run all tests is to use the test runner script:

```bash
# Make the script executable (if not already)
chmod +x test-auth-flow.js

# Run the test suite
./test-auth-flow.js
```

This will run both the backend and frontend tests and generate a comprehensive report.

### Option 2: Run Individual Tests

You can also run the backend and frontend tests separately:

```bash
# Run backend tests
cd Backend
node tests/auth-validation.test.js

# Run frontend tests
cd Frontend
# Note: Frontend tests require the Vite dev server to be running
npm run dev  # In a separate terminal
node --experimental-modules --es-module-specifier-resolution=node src/tests/auth-validation.test.js
```

## Test Report

The test runner generates a comprehensive report that includes:

1. **Overall Status**: Whether all tests passed or failed.
2. **Backend and Frontend Test Results**: Individual results for each component.
3. **Successful Validations**: A list of all tests that passed.
4. **Failed Validations**: A list of all tests that failed.
5. **Recommendations**: Suggestions for fixing any issues that were found.

## Common Issues and Solutions

### Environment Variables

Ensure that the following environment variables are set:

#### Backend (.env)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/cv_management
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:8080
```

#### Frontend (.env)
```
VITE_Backend_URL=http://localhost:5003
VITE_API_URL=http://localhost:5003/api
```

### CORS Issues

If you encounter CORS issues, check the following:

1. Ensure that the `FRONTEND_URL` in the backend `.env` file matches the URL of your frontend application.
2. Verify that the CORS middleware in `Backend/src/app.js` is properly configured:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

3. Make sure that the frontend API calls include the `withCredentials: true` option.

### Authentication Issues

If authentication is failing, check the following:

1. Verify that the JWT secret is consistent and properly set.
2. Ensure that the token is being properly stored in cookies.
3. Check that the token is being included in the Authorization header for protected routes.
4. Verify that the token has not expired.

### Database Issues

If database connection is failing, check the following:

1. Ensure that MongoDB is running.
2. Verify that the `MONGODB_URI` in the backend `.env` file is correct.
3. Check that the test user exists in the database by running the `create-test-user.js` script.

## Extending the Tests

You can extend the tests by adding new test functions to the respective test files. For example, to add a new test for password reset functionality:

1. Add a new test function to `Backend/tests/auth-validation.test.js`:

```javascript
async function testPasswordReset() {
  console.log('\n--- Password Reset Test ---');
  
  // Test implementation
}
```

2. Add the function call to the `runTests` function:

```javascript
async function runTests() {
  // Existing tests
  await testPasswordReset();
  // More tests
}
```

3. Do the same for the frontend test file if needed.

## Troubleshooting

### Test Runner Issues

If the test runner fails to execute, check the following:

1. Ensure that Node.js is installed and up to date.
2. Verify that all required files exist in the correct locations.
3. Check that the file permissions allow execution of the script.

### Frontend Test Issues

If the frontend tests fail to run, check the following:

1. Ensure that the Vite dev server is running.
2. Verify that the ES module imports are correctly formatted.
3. Check that all required dependencies are installed.

### Backend Test Issues

If the backend tests fail to run, check the following:

1. Ensure that the backend server is running.
2. Verify that the MongoDB connection is working.
3. Check that all required environment variables are set.

## Conclusion

The authentication validation framework provides a comprehensive way to test and validate the authentication flow in the WitchCraft application. By running these tests regularly, you can ensure that the authentication system remains secure and functional as the application evolves.

For any questions or issues, please contact the development team. 