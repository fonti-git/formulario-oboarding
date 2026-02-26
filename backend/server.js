const express = require('express');
const path = require('path');

// Import configuration
const config = require('./config/env');

// Import middleware
const { securityMiddlewares, requestLogger } = require('./middleware/security');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const uploadRoutes = require('./routes/upload');
const formRoutes = require('./routes/form');

// Create Express app
const app = express();

// Security and performance middlewares
app.use(securityMiddlewares);

// Request logging (development only)
if (config.NODE_ENV === 'development') {
  app.use(requestLogger);
}

// Body parsing
app.use(express.json({ 
  limit: '10mb' 
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// API Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/form', formRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend server is healthy',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    version: '1.0.0',
    server: 'Express',
    uptime: process.uptime(),
    googleDriveConfigured: !!(config.GOOGLE_DRIVE.CLIENT_ID && config.GOOGLE_DRIVE.CLIENT_SECRET && config.GOOGLE_DRIVE.REFRESH_TOKEN)
  });
});

// Serve frontend files (optional - for development)
if (config.NODE_ENV === 'development') {
  app.use(express.static(path.join(__dirname, '../frontend')));
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  });
}

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = config.PORT;
app.listen(PORT, () => {
  console.log('🚀 Server is running');
  console.log('========================');
  console.log(`Environment: ${config.NODE_ENV}`);
  console.log(`Port: ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`API Base URL: ${config.INSFORGE_API_BASE_URL}`);
  console.log('========================');
  
  // Warning if API key is still the default
  if (config.INSFORGE_API_KEY && config.INSFORGE_API_KEY.includes('your_insforge_api_key_here')) {
    console.warn('⚠️ WARNING: Using default API key - please update in .env file');
  }
  
  // Warning if Google Drive config is not complete
  if (!config.GOOGLE_DRIVE.CLIENT_ID || !config.GOOGLE_DRIVE.CLIENT_SECRET || !config.GOOGLE_DRIVE.REFRESH_TOKEN) {
    console.warn('⚠️ WARNING: Google Drive configuration not complete - some features may be disabled');
  }
});

module.exports = app;
