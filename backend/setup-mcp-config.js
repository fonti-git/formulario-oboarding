#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({
  path: path.resolve(__dirname, '.env')
});

// Template configuration
const configTemplate = {
  mcpServers: {
    insforge: {
      command: "npx",
      args: [
        "-y",
        "@insforge/mcp@latest"
      ],
      env: {
        API_KEY: process.env.INSFORGE_API_KEY,
        API_BASE_URL: process.env.INSFORGE_API_BASE_URL
      }
    }
  }
};

// Output file path
const outputPath = path.resolve(__dirname, 'mcp-config.json');

// Generate configuration file
try {
  fs.writeFileSync(
    outputPath,
    JSON.stringify(configTemplate, null, 2)
  );
  console.log('✅ mcp-config.json generated successfully');
  
  // Verify the file was created
  if (fs.existsSync(outputPath)) {
    console.log('✅ File created at:', outputPath);
  } else {
    console.error('❌ File not created');
  }
} catch (error) {
  console.error('❌ Error generating mcp-config.json:', error.message);
  process.exit(1);
}

// Check if API key is valid
if (!process.env.INSFORGE_API_KEY || process.env.INSFORGE_API_KEY === 'your_insforge_api_key_here') {
  console.warn('\n⚠️ Warning: API key not configured');
  console.warn('Please update the INSFORGE_API_KEY variable in your .env file');
  console.warn('Using template value:', process.env.INSFORGE_API_KEY);
}
