const config = require('../config/env');

const errorHandler = (error, req, res, next) => {
  console.error('Error:', error);

  // Set default status code
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(error.errors).map(err => err.message).join(', ');
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${error.path}: ${error.value}`;
  } else if (error.name === 'MongoError' && error.code === 11000) {
    statusCode = 400;
    const duplicateKey = Object.keys(error.keyPattern)[0];
    message = `Duplicate field value: ${error.keyValue[duplicateKey]}`;
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (error.message.includes('File type') || error.message.includes('File size')) {
    statusCode = 400;
  }

  // Development mode - include stack trace
  const response = {
    success: false,
    message: message
  };

  if (config.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
