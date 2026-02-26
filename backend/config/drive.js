const { google } = require('@googleapis/drive');
const config = require('./env');

class GoogleDriveService {
  constructor() {
    this.drive = null;
    this.auth = null;
    this.initialize();
  }

  async initialize() {
    try {
      // Create OAuth2 client
      this.auth = new google.auth.OAuth2(
        config.GOOGLE_DRIVE.CLIENT_ID,
        config.GOOGLE_DRIVE.CLIENT_SECRET
      );

      // Set refresh token
      this.auth.setCredentials({
        refresh_token: config.GOOGLE_DRIVE.REFRESH_TOKEN
      });

      // Initialize drive API
      this.drive = google.drive({
        version: 'v3',
        auth: this.auth
      });

      console.log('✅ Google Drive API initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Google Drive API:', error.message);
      if (config.NODE_ENV === 'development') {
        console.warn('⚠️ Google Drive configuration not complete - some features may be disabled');
      }
    }
  }

  async createCompanyFolder(companyName) {
    if (!this.drive) {
      throw new Error('Google Drive API not initialized');
    }

    try {
      // Check if parent folder exists
      let parentFolderId = config.GOOGLE_DRIVE.FOLDER_ID;

      if (!parentFolderId) {
        // Create root folder if not configured
        const rootFolder = await this.drive.files.create({
          resource: {
            name: 'Onboarding Forms',
            mimeType: 'application/vnd.google-apps.folder'
          },
          fields: 'id'
        });
        parentFolderId = rootFolder.data.id;
        console.log('✅ Root folder created with ID:', parentFolderId);
      }

      // Create company folder
      const companyFolder = await this.drive.files.create({
        resource: {
          name: companyName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [parentFolderId]
        },
        fields: 'id'
      });

      console.log('✅ Company folder created:', companyName, 'ID:', companyFolder.data.id);

      // Create "Formulario onboarding" subfolder
      const onboardingFolder = await this.drive.files.create({
        resource: {
          name: 'Formulario onboarding',
          mimeType: 'application/vnd.google-apps.folder',
          parents: [companyFolder.data.id]
        },
        fields: 'id'
      });

      console.log('✅ Onboarding form folder created: Formulario onboarding, ID:', onboardingFolder.data.id);

      return onboardingFolder.data.id;
    } catch (error) {
      console.error('❌ Error creating company folder:', error.message);
      throw error;
    }
  }

  async findOrCreateCompanyFolder(companyName) {
    if (!this.drive) {
      throw new Error('Google Drive API not initialized');
    }

    try {
      // Search for existing company folder
      const searchQuery = `name = '${companyName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
      
      const response = await this.drive.files.list({
        q: searchQuery,
        fields: 'files(id, name)'
      });

      if (response.data.files.length > 0) {
        const companyFolderId = response.data.files[0].id;
        console.log('✅ Company folder exists:', companyName, 'ID:', companyFolderId);

        // Search for "Formulario onboarding" subfolder
        const onboardingFolderQuery = `name = 'Formulario onboarding' and mimeType = 'application/vnd.google-apps.folder' and '${companyFolderId}' in parents and trashed = false`;
        const onboardingResponse = await this.drive.files.list({
          q: onboardingFolderQuery,
          fields: 'files(id, name)'
        });

        if (onboardingResponse.data.files.length > 0) {
          const onboardingFolderId = onboardingResponse.data.files[0].id;
          console.log('✅ Onboarding form folder exists: Formulario onboarding, ID:', onboardingFolderId);
          return onboardingFolderId;
        } else {
          // Create "Formulario onboarding" subfolder if not found
          const onboardingFolder = await this.drive.files.create({
            resource: {
              name: 'Formulario onboarding',
              mimeType: 'application/vnd.google-apps.folder',
              parents: [companyFolderId]
            },
            fields: 'id'
          });

          console.log('✅ Onboarding form folder created: Formulario onboarding, ID:', onboardingFolder.data.id);
          return onboardingFolder.data.id;
        }
      }

      // Create new folder structure if not found
      return await this.createCompanyFolder(companyName);
    } catch (error) {
      console.error('❌ Error finding or creating company folder:', error.message);
      throw error;
    }
  }

  async uploadFile(companyFolderId, file, questionNumber, stepTitle) {
    if (!this.drive) {
      throw new Error('Google Drive API not initialized');
    }

    try {
      // Generate file name with proper format
      const formattedStepTitle = stepTitle.toUpperCase().replace(/\s+/g, ' ').trim();
      const sanitizedFileName = file.originalname.replace(/[^\w\s.-]/g, '');
      const fileName = `P${questionNumber}-${formattedStepTitle} ${sanitizedFileName}`;

      // Upload file
      const response = await this.drive.files.create({
        requestBody: {
          name: fileName,
          parents: [companyFolderId]
        },
        media: {
          mimeType: file.mimetype,
          body: file.buffer
        },
        fields: 'id, name, webViewLink'
      });

      console.log('✅ File uploaded:', fileName, 'ID:', response.data.id);

      return {
        id: response.data.id,
        name: fileName,
        url: response.data.webViewLink,
        size: file.size
      };
    } catch (error) {
      console.error('❌ Error uploading file:', error.message);
      throw error;
    }
  }

  async getCompanyFiles(companyFolderId) {
    if (!this.drive) {
      throw new Error('Google Drive API not initialized');
    }

    try {
      const response = await this.drive.files.list({
        q: `'${companyFolderId}' in parents and trashed = false`,
        fields: 'files(id, name, webViewLink, size, createdTime)'
      });

      return response.data.files;
    } catch (error) {
      console.error('❌ Error fetching company files:', error.message);
      throw error;
    }
  }

  async deleteFile(fileId) {
    if (!this.drive) {
      throw new Error('Google Drive API not initialized');
    }

    try {
      await this.drive.files.delete({
        fileId: fileId
      });

      console.log('✅ File deleted:', fileId);
      return true;
    } catch (error) {
      console.error('❌ Error deleting file:', error.message);
      throw error;
    }
  }
}

module.exports = new GoogleDriveService();
