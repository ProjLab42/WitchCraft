#!/usr/bin/env node

/**
 * Authentication Validation Setup Script
 * 
 * This script installs the necessary dependencies for running the authentication validation tests.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for formatting
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Required dependencies
const dependencies = {
  root: ['dotenv'],
  backend: [],
  frontend: ['js-cookie']
};

// Run a command and return a promise
function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    console.log(`${colors.cyan}Running command: ${command} ${args.join(' ')}${colors.reset}`);
    
    const childProcess = spawn(command, args, {
      cwd,
      stdio: 'pipe',
      shell: true
    });
    
    let stdout = '';
    let stderr = '';
    
    childProcess.stdout.on('data', (data) => {
      const text = data.toString();
      stdout += text;
      process.stdout.write(text);
    });
    
    childProcess.stderr.on('data', (data) => {
      const text = data.toString();
      stderr += text;
      process.stderr.write(text);
    });
    
    childProcess.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
  });
}

// Check if a directory exists
function directoryExists(dirPath) {
  try {
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  } catch (err) {
    return false;
  }
}

// Install dependencies
async function installDependencies(deps, cwd) {
  if (deps.length === 0) {
    console.log(`${colors.green}No dependencies to install in ${cwd}${colors.reset}`);
    return;
  }
  
  try {
    console.log(`${colors.cyan}Installing dependencies in ${cwd}...${colors.reset}`);
    await runCommand('npm', ['install', '--save-dev', ...deps], cwd);
    console.log(`${colors.green}Dependencies installed successfully in ${cwd}${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Failed to install dependencies in ${cwd}: ${error.message}${colors.reset}`);
    throw error;
  }
}

// Create directories if they don't exist
function createDirectoryIfNotExists(dirPath) {
  if (!directoryExists(dirPath)) {
    console.log(`${colors.yellow}Creating directory: ${dirPath}${colors.reset}`);
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`${colors.green}Directory created: ${dirPath}${colors.reset}`);
  }
}

// Main function
async function main() {
  console.log(`${colors.bright}${colors.magenta}=== Authentication Validation Setup ===${colors.reset}\n`);
  
  const rootDir = process.cwd();
  const backendDir = path.join(rootDir, 'Backend');
  const frontendDir = path.join(rootDir, 'Frontend');
  
  // Check if directories exist
  console.log(`${colors.cyan}Checking project structure...${colors.reset}`);
  
  if (!directoryExists(backendDir)) {
    console.error(`${colors.red}Backend directory not found at ${backendDir}${colors.reset}`);
    process.exit(1);
  }
  
  if (!directoryExists(frontendDir)) {
    console.error(`${colors.red}Frontend directory not found at ${frontendDir}${colors.reset}`);
    process.exit(1);
  }
  
  console.log(`${colors.green}Project structure verified${colors.reset}`);
  
  // Create necessary directories
  const backendTestsDir = path.join(backendDir, 'tests');
  const backendScriptsDir = path.join(backendDir, 'scripts');
  const frontendTestsDir = path.join(frontendDir, 'src', 'tests');
  
  createDirectoryIfNotExists(backendTestsDir);
  createDirectoryIfNotExists(backendScriptsDir);
  createDirectoryIfNotExists(frontendTestsDir);
  
  // Install dependencies
  try {
    // Root dependencies
    await installDependencies(dependencies.root, rootDir);
    
    // Backend dependencies
    await installDependencies(dependencies.backend, backendDir);
    
    // Frontend dependencies
    await installDependencies(dependencies.frontend, frontendDir);
    
    console.log(`\n${colors.green}${colors.bright}All dependencies installed successfully${colors.reset}`);
  } catch (error) {
    console.error(`\n${colors.red}${colors.bright}Failed to install dependencies: ${error.message}${colors.reset}`);
    process.exit(1);
  }
  
  // Make scripts executable
  console.log(`\n${colors.cyan}Making scripts executable...${colors.reset}`);
  
  const scriptsToMakeExecutable = [
    path.join(rootDir, 'test-auth-flow.js'),
    path.join(rootDir, 'check-env-vars.js')
  ];
  
  for (const scriptPath of scriptsToMakeExecutable) {
    if (fs.existsSync(scriptPath)) {
      try {
        fs.chmodSync(scriptPath, '755');
        console.log(`${colors.green}Made executable: ${scriptPath}${colors.reset}`);
      } catch (error) {
        console.error(`${colors.red}Failed to make executable: ${scriptPath} - ${error.message}${colors.reset}`);
      }
    } else {
      console.warn(`${colors.yellow}Script not found: ${scriptPath}${colors.reset}`);
    }
  }
  
  console.log(`\n${colors.bright}${colors.magenta}=== Setup Complete ===${colors.reset}`);
  console.log(`\n${colors.bright}${colors.green}You can now run the authentication validation tests:${colors.reset}`);
  console.log(`${colors.cyan}1. First, check your environment variables: ${colors.bright}./check-env-vars.js${colors.reset}`);
  console.log(`${colors.cyan}2. Then, create the test user: ${colors.bright}cd Backend && node scripts/create-test-user.js${colors.reset}`);
  console.log(`${colors.cyan}3. Finally, run the tests: ${colors.bright}./test-auth-flow.js${colors.reset}`);
}

// Run the main function
main().catch(error => {
  console.error(`${colors.red}${colors.bright}An unexpected error occurred: ${error.message}${colors.reset}`);
  process.exit(1);
}); 