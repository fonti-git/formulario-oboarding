const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const config = require('../config/env');

const securityMiddlewares = [
  // Helmet for security headers
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'", config.CORS_ORIGIN, config.INSFORGE_API_BASE_URL]
      }
    },
    crossOriginEmbedderPolicy: false
  }),

  // CORS configuration
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }),

  // Compression middleware
  compression({
    level: 6,
    threshold: 1024
  })
];

const requestLogger = (req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  if (Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  if (Object.keys(req.query).length > 0) {
    console.log('Query:', JSON.stringify(req.query, null, 2));
  }
  next();
};

module.exports = {
  securityMiddlewares,
  requestLogger
};
