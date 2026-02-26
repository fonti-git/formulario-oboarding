const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({
  path: path.resolve(__dirname, '../.env')
});

// Environment configuration
const config = {
  // Server configuration
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // InsForge API
  INSFORGE_API_KEY: process.env.INSFORGE_API_KEY,
  INSFORGE_API_BASE_URL: process.env.INSFORGE_API_BASE_URL || 'https://pyf9kwxd.us-west.insforge.app',
  
   // Google Drive configuration
  GOOGLE_DRIVE: {
    CLIENT_ID: process.env.GOOGLE_DRIVE_CLIENT_ID,
    CLIENT_SECRET: process.env.GOOGLE_DRIVE_CLIENT_SECRET,
    REFRESH_TOKEN: process.env.GOOGLE_DRIVE_REFRESH_TOKEN,
    FOLDER_ID: (() => {
      const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
      if (!folderId) return null;
      // Extract folder ID from URL (e.g., https://drive.google.com/drive/u/1/folders/1W1-57Ismsi9z3dQAwzIbb6D3qI1LIIPC)
      const match = folderId.match(/\/folders\/([a-zA-Z0-9_-]+)/);
      return match ? match[1] : folderId;
    })(),
  },
  
  // Security configuration
  JWT_SECRET: process.env.JWT_SECRET || 'default_jwt_secret_key_change_in_production',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:8000',
  
  // File upload configuration
  FILE_UPLOAD: {
    MAX_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: process.env.ALLOWED_FILE_TYPES 
      ? process.env.ALLOWED_FILE_TYPES.split(',')
      : ['image/jpeg', 'image/png', 'application/pdf'],
  }
};

// Validate required configuration
const requiredFields = [
  'INSFORGE_API_KEY',
  'INSFORGE_API_BASE_URL'
];

requiredFields.forEach(field => {
  if (!config[field]) {
    console.warn(`⚠️ Warning: ${field} not configured in environment variables`);
    if (config.NODE_ENV === 'production') {
      throw new Error(`${field} is required for production`);
    }
  }
});

// Validate API key format
if (config.INSFORGE_API_KEY && config.INSFORGE_API_KEY.includes('your_insforge_api_key_here')) {
  console.warn('⚠️ Warning: Using default API key - please update in .env file');
}

module.exports = config;
