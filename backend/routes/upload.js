const express = require('express');
const driveService = require('../config/drive');
const { upload } = require('../middleware/upload');
const config = require('../config/env');

const router = express.Router();

// POST /api/upload - Upload files
router.post('/', upload.array('files'), async (req, res, next) => {
  try {
    const { companyName, questionNumber, stepTitle } = req.body;

    // Validate request
    if (!companyName || questionNumber === undefined || !stepTitle) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: companyName, questionNumber, or stepTitle'
      });
    }

    // Validate files
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    // Convert question number to integer
    const qNumber = parseInt(questionNumber);
    if (isNaN(qNumber) || qNumber < 0 || qNumber > 18) {
      return res.status(400).json({
        success: false,
        message: 'Question number must be between 0 and 18'
      });
    }

    // Find or create company folder
    const companyFolderId = await driveService.findOrCreateCompanyFolder(companyName);

    // Upload all files
    const uploadedFiles = [];
    for (const file of req.files) {
      const uploadedFile = await driveService.uploadFile(
        companyFolderId,
        file,
        qNumber,
        stepTitle
      );
      uploadedFiles.push(uploadedFile);
    }

    // Success response
    res.json({
      success: true,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      files: uploadedFiles,
      companyFolderId: companyFolderId
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/upload/company/:companyName - Get company files
router.get('/company/:companyName', async (req, res, next) => {
  try {
    const { companyName } = req.params;
    
    // Find company folder
    const companyFolderId = await driveService.findOrCreateCompanyFolder(companyName);
    
    // Get all files in company folder
    const files = await driveService.getCompanyFiles(companyFolderId);
    
    res.json({
      success: true,
      companyName: companyName,
      companyFolderId: companyFolderId,
      files: files
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/upload/file/:fileId - Delete file
router.delete('/file/:fileId', async (req, res, next) => {
  try {
    const { fileId } = req.params;
    
    await driveService.deleteFile(fileId);
    
    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/upload/health - Health check for file upload service
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'File upload service is healthy',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    googleDriveConfigured: !!(config.GOOGLE_DRIVE.CLIENT_ID && config.GOOGLE_DRIVE.CLIENT_SECRET && config.GOOGLE_DRIVE.REFRESH_TOKEN)
  });
});

module.exports = router;
