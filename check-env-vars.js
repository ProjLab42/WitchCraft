#!/usr/bin/env node

/**
 * Environment Variables Checker
 * 
 * This script checks the environment variables in both the backend and frontend
 * to ensure they are consistent and properly configured.
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// ANSI color codes for formatting
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m'
};

// Required environment variables
const requiredVars = {
  backend: [
    'PORT',
    'NODE_ENV',
    'MONGODB_URI',
    'JWT_SECRET',
    'FRONTEND_URL'
  ],
  frontend: [
    'VITE_Backend_URL',
    'VITE_API_URL'
  ]
};

// Check if a file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}

// Load environment variables from a file
function loadEnvFile(filePath) {
  try {
    if (!fileExists(filePath)) {
      return { error: `File not found: ${filePath}` };
    }
    
    const envConfig = dotenv.parse(fs.readFileSync(filePath));
    return { vars: envConfig };
  } catch (error) {
    return { error: `Error loading ${filePath}: ${error.message}` };
  }
}

// Check required variables
function checkRequiredVars(vars, requiredList, component) {
  const missing = [];
  const present = [];
  
  for (const varName of requiredList) {
    if (!vars[varName]) {
      missing.push(varName);
    } else {
      present.push(varName);
    }
  }
  
  return { missing, present };
}

// Validate URL format
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Check consistency between frontend and backend URLs
function checkUrlConsistency(backendVars, frontendVars) {
  const issues = [];
  
  // Check if frontend URL in backend matches actual frontend URL
  if (backendVars.FRONTEND_URL && !backendVars.FRONTEND_URL.includes('localhost:5173')) {
    issues.push(`Backend FRONTEND_URL (${backendVars.FRONTEND_URL}) might not match the actual frontend URL (expected localhost:5173)`);
  }
  
  // Check if backend URL in frontend matches actual backend URL
  const backendPort = backendVars.PORT || '5000';
  if (frontendVars.VITE_Backend_URL && !frontendVars.VITE_Backend_URL.includes(`localhost:${backendPort}`)) {
    issues.push(`Frontend VITE_Backend_URL (${frontendVars.VITE_Backend_URL}) might not match the actual backend URL (expected localhost:${backendPort})`);
  }
  
  // Check if API URL is consistent with Backend URL
  if (frontendVars.VITE_Backend_URL && frontendVars.VITE_API_URL) {
    if (!frontendVars.VITE_API_URL.startsWith(frontendVars.VITE_Backend_URL)) {
      issues.push(`VITE_API_URL (${frontendVars.VITE_API_URL}) does not start with VITE_Backend_URL (${frontendVars.VITE_Backend_URL})`);
    }
  }
  
  return issues;
}

// Main function
function main() {
  console.log(`${colors.bright}${colors.magenta}=== Environment Variables Checker ===${colors.reset}\n`);
  
  // Define file paths
  const backendEnvPath = path.join(process.cwd(), 'Backend', '.env');
  const frontendEnvPath = path.join(process.cwd(), 'Frontend', '.env');
  
  // Check if files exist
  console.log(`${colors.cyan}Checking for .env files:${colors.reset}`);
  const backendEnvExists = fileExists(backendEnvPath);
  const frontendEnvExists = fileExists(frontendEnvPath);
  
  console.log(`Backend .env: ${backendEnvExists ? colors.green + 'Found' : colors.red + 'Not found'}${colors.reset}`);
  console.log(`Frontend .env: ${frontendEnvExists ? colors.green + 'Found' : colors.red + 'Not found'}${colors.reset}`);
  
  if (!backendEnvExists || !frontendEnvExists) {
    console.log(`\n${colors.red}${colors.bright}One or more .env files are missing. Please create them before running this check.${colors.reset}`);
    process.exit(1);
  }
  
  // Load environment variables
  console.log(`\n${colors.cyan}Loading environment variables:${colors.reset}`);
  const backendEnv = loadEnvFile(backendEnvPath);
  const frontendEnv = loadEnvFile(frontendEnvPath);
  
  if (backendEnv.error) {
    console.log(`${colors.red}${backendEnv.error}${colors.reset}`);
    process.exit(1);
  }
  
  if (frontendEnv.error) {
    console.log(`${colors.red}${frontendEnv.error}${colors.reset}`);
    process.exit(1);
  }
  
  console.log(`${colors.green}Successfully loaded environment variables from both files${colors.reset}`);
  
  // Check required variables
  console.log(`\n${colors.cyan}Checking required variables:${colors.reset}`);
  
  const backendCheck = checkRequiredVars(backendEnv.vars, requiredVars.backend, 'Backend');
  const frontendCheck = checkRequiredVars(frontendEnv.vars, requiredVars.frontend, 'Frontend');
  
  // Backend variables
  console.log(`\n${colors.bright}Backend Variables:${colors.reset}`);
  if (backendCheck.missing.length > 0) {
    console.log(`${colors.red}Missing: ${backendCheck.missing.join(', ')}${colors.reset}`);
  }
  
  for (const varName of backendCheck.present) {
    const value = varName === 'JWT_SECRET' ? '[REDACTED]' : backendEnv.vars[varName];
    console.log(`${colors.green}✓ ${varName}:${colors.reset} ${value}`);
  }
  
  // Frontend variables
  console.log(`\n${colors.bright}Frontend Variables:${colors.reset}`);
  if (frontendCheck.missing.length > 0) {
    console.log(`${colors.red}Missing: ${frontendCheck.missing.join(', ')}${colors.reset}`);
  }
  
  for (const varName of frontendCheck.present) {
    console.log(`${colors.green}✓ ${varName}:${colors.reset} ${frontendEnv.vars[varName]}`);
  }
  
  // Validate URL formats
  console.log(`\n${colors.cyan}Validating URL formats:${colors.reset}`);
  
  const urlVars = [
    { name: 'FRONTEND_URL', value: backendEnv.vars.FRONTEND_URL, component: 'Backend' },
    { name: 'VITE_Backend_URL', value: frontendEnv.vars.VITE_Backend_URL, component: 'Frontend' },
    { name: 'VITE_API_URL', value: frontendEnv.vars.VITE_API_URL, component: 'Frontend' }
  ];
  
  for (const { name, value, component } of urlVars) {
    if (value) {
      const isValid = isValidUrl(value);
      console.log(`${component} ${name}: ${isValid ? colors.green + 'Valid URL' : colors.red + 'Invalid URL'} (${value})${colors.reset}`);
    }
  }
  
  // Check consistency
  console.log(`\n${colors.cyan}Checking consistency between frontend and backend:${colors.reset}`);
  const consistencyIssues = checkUrlConsistency(backendEnv.vars, frontendEnv.vars);
  
  if (consistencyIssues.length > 0) {
    for (const issue of consistencyIssues) {
      console.log(`${colors.yellow}⚠️ ${issue}${colors.reset}`);
    }
  } else {
    console.log(`${colors.green}✓ Frontend and backend URLs are consistent${colors.reset}`);
  }
  
  // Overall status
  console.log(`\n${colors.bright}${colors.magenta}=== Overall Status ===${colors.reset}\n`);
  
  const hasMissingVars = backendCheck.missing.length > 0 || frontendCheck.missing.length > 0;
  const hasConsistencyIssues = consistencyIssues.length > 0;
  
  if (hasMissingVars) {
    console.log(`${colors.bgRed}${colors.white}${colors.bright} FAIL: Missing required environment variables ${colors.reset}`);
  } else if (hasConsistencyIssues) {
    console.log(`${colors.bgYellow}${colors.black}${colors.bright} WARNING: Consistency issues detected ${colors.reset}`);
  } else {
    console.log(`${colors.bgGreen}${colors.black}${colors.bright} SUCCESS: All environment variables are properly configured ${colors.reset}`);
  }
  
  // Recommendations
  if (hasMissingVars || hasConsistencyIssues) {
    console.log(`\n${colors.bright}${colors.yellow}Recommendations:${colors.reset}`);
    
    if (backendCheck.missing.length > 0) {
      console.log(`${colors.yellow}1. Add the following variables to Backend/.env: ${backendCheck.missing.join(', ')}${colors.reset}`);
    }
    
    if (frontendCheck.missing.length > 0) {
      console.log(`${colors.yellow}2. Add the following variables to Frontend/.env: ${frontendCheck.missing.join(', ')}${colors.reset}`);
    }
    
    if (hasConsistencyIssues) {
      console.log(`${colors.yellow}3. Fix the consistency issues between frontend and backend URLs${colors.reset}`);
    }
  }
  
  console.log(`\n${colors.bright}${colors.magenta}=== End of Check ===${colors.reset}\n`);
}

// Run the main function
main(); 