/**
 * Deployment Helper Script
 * 
 * This script helps prepare the project for deployment to Vercel.
 * It validates environment variables and creates necessary files.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Paths
const backendEnvPath = path.join(__dirname, 'backend', '.env.production');
const frontendEnvPath = path.join(__dirname, 'frontend', '.env.production');

// Required environment variables
const requiredBackendVars = [
  'NODE_ENV',
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_EXPIRE',
  'JWT_COOKIE_EXPIRE',
  'FRONTEND_URL'
];

const requiredFrontendVars = [
  'VITE_APP_NAME',
  'VITE_API_URL'
];

// Optional environment variables
const optionalBackendVars = [
  'EMAIL_PROVIDER',
  'EMAIL_SERVICE',
  'EMAIL_USERNAME',
  'EMAIL_PASSWORD',
  'FROM_NAME',
  'FROM_EMAIL',
  'MAX_FILE_UPLOAD',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_BUCKET_NAME',
  'AWS_REGION',
  'ENABLE_MICROSOFT_365',
  'AZURE_TENANT_ID',
  'AZURE_CLIENT_ID',
  'AZURE_CLIENT_SECRET'
];

const optionalFrontendVars = [
  'VITE_ENABLE_MICROSOFT_365',
  'VITE_AZURE_TENANT_ID',
  'VITE_AZURE_CLIENT_ID'
];

/**
 * Check if a file exists
 * @param {String} filePath - Path to the file
 * @returns {Boolean} - True if the file exists
 */
const fileExists = (filePath) => {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
};

/**
 * Parse environment variables from a file
 * @param {String} filePath - Path to the .env file
 * @returns {Object} - Object containing the environment variables
 */
const parseEnvFile = (filePath) => {
  if (!fileExists(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const env = {};

  lines.forEach(line => {
    // Skip comments and empty lines
    if (line.startsWith('#') || line.trim() === '') {
      return;
    }

    // Parse key-value pairs
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      env[key] = value;
    }
  });

  return env;
};

/**
 * Validate environment variables
 * @param {Object} env - Object containing environment variables
 * @param {Array} required - Array of required variable names
 * @returns {Array} - Array of missing variable names
 */
const validateEnv = (env, required) => {
  const missing = [];

  required.forEach(varName => {
    if (!env[varName] || env[varName].includes('your-') || env[varName].includes('replace_with_')) {
      missing.push(varName);
    }
  });

  return missing;
};

/**
 * Ask for environment variable value
 * @param {String} varName - Name of the variable
 * @param {String} defaultValue - Default value
 * @returns {Promise<String>} - The value entered by the user
 */
const askForEnvVar = (varName, defaultValue = '') => {
  return new Promise((resolve) => {
    const defaultPrompt = defaultValue ? ` (default: "${defaultValue}")` : '';
    rl.question(`${colors.cyan}Enter value for ${varName}${defaultPrompt}: ${colors.reset}`, (answer) => {
      resolve(answer || defaultValue);
    });
  });
};

/**
 * Update environment file with new values
 * @param {String} filePath - Path to the .env file
 * @param {Object} newValues - Object containing new values
 */
const updateEnvFile = (filePath, newValues) => {
  let content = '';

  if (fileExists(filePath)) {
    content = fs.readFileSync(filePath, 'utf8');
  }

  // Update or add each new value
  Object.entries(newValues).forEach(([key, value]) => {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (content.match(regex)) {
      // Update existing value
      content = content.replace(regex, `${key}=${value}`);
    } else {
      // Add new value
      content += `\n${key}=${value}`;
    }
  });

  // Write the updated content
  fs.writeFileSync(filePath, content.trim() + '\n', 'utf8');
};

/**
 * Main function
 */
const main = async () => {
  console.log(`${colors.magenta}=== Vercel Deployment Helper ===${colors.reset}`);
  console.log(`${colors.yellow}This script will help you prepare your project for deployment to Vercel.${colors.reset}`);
  console.log('');

  // Check backend environment variables
  console.log(`${colors.blue}Checking backend environment variables...${colors.reset}`);
  const backendEnv = parseEnvFile(backendEnvPath);
  const missingBackendVars = validateEnv(backendEnv, requiredBackendVars);

  if (missingBackendVars.length > 0) {
    console.log(`${colors.yellow}The following required backend environment variables are missing or have placeholder values:${colors.reset}`);
    missingBackendVars.forEach(varName => console.log(`  - ${varName}`));
    console.log('');

    const newBackendValues = {};
    for (const varName of missingBackendVars) {
      const value = await askForEnvVar(varName);
      newBackendValues[varName] = value;
    }

    updateEnvFile(backendEnvPath, newBackendValues);
    console.log(`${colors.green}Backend environment variables updated.${colors.reset}`);
  } else {
    console.log(`${colors.green}All required backend environment variables are set.${colors.reset}`);
  }

  // Check frontend environment variables
  console.log('');
  console.log(`${colors.blue}Checking frontend environment variables...${colors.reset}`);
  const frontendEnv = parseEnvFile(frontendEnvPath);
  const missingFrontendVars = validateEnv(frontendEnv, requiredFrontendVars);

  if (missingFrontendVars.length > 0) {
    console.log(`${colors.yellow}The following required frontend environment variables are missing or have placeholder values:${colors.reset}`);
    missingFrontendVars.forEach(varName => console.log(`  - ${varName}`));
    console.log('');

    const newFrontendValues = {};
    for (const varName of missingFrontendVars) {
      const value = await askForEnvVar(varName);
      newFrontendValues[varName] = value;
    }

    updateEnvFile(frontendEnvPath, newFrontendValues);
    console.log(`${colors.green}Frontend environment variables updated.${colors.reset}`);
  } else {
    console.log(`${colors.green}All required frontend environment variables are set.${colors.reset}`);
  }

  console.log('');
  console.log(`${colors.green}Deployment preparation complete!${colors.reset}`);
  console.log(`${colors.yellow}Next steps:${colors.reset}`);
  console.log('1. Push your code to GitHub');
  console.log('2. Deploy the backend to Vercel');
  console.log('3. Deploy the frontend to Vercel');
  console.log('4. Update the FRONTEND_URL in the backend environment variables');
  console.log('5. Update the VITE_API_URL in the frontend environment variables');
  console.log('');
  console.log(`${colors.magenta}See VERCEL_DEPLOYMENT.md for detailed instructions.${colors.reset}`);

  rl.close();
};

// Run the main function
main().catch(error => {
  console.error(`${colors.red}Error:${colors.reset}`, error);
  rl.close();
  process.exit(1);
});
