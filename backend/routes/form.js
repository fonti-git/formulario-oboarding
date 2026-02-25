const express = require('express');
const driveService = require('../config/drive');
const { upload } = require('../middleware/upload');
const config = require('../config/env');

const router = express.Router();

// Step configuration for the form
const formSteps = [
  { step: 1, title: 'Información de la Empresa', questions: [
    { number: 0, title: 'Nombre de la empresa' },
    { number: 1, title: 'Historia de la empresa' },
    { number: 2, title: 'Descripción del producto o servicio' },
    { number: 3, title: 'Público objetivo general' },
    { number: 4, title: 'Precio o rango de precios' }
  ]},
  { step: 2, title: 'Identidad visual', questions: [
    { number: 5, title: 'Manual de marca (si existe)' },
    { number: 6, title: 'Logo en alta resolución' },
    { number: 7, title: 'Paleta de colores' },
    { number: 8, title: 'Tipografías' }
  ]},
  { step: 3, title: 'Recursos visuales', questions: [
    { number: 9, title: 'Fotografías del producto, servicio o equipo' },
    { number: 10, title: 'Videos disponibles' },
    { number: 11, title: 'Testimonios de éxito' },
    { number: 12, title: 'Material gráfico adicional' }
  ]},
  { step: 4, title: 'Accesos', questions: [
    { number: 13, title: 'Accesos a redes sociales' },
    { number: 14, title: 'Acceso a Business Manager' },
    { number: 15, title: 'Acceso a Hotmart' }
  ]},
  { step: 5, title: 'Adicionales', questions: [
    { number: 16, title: 'Material educativo (PDFs, documentos, recursos base)' },
    { number: 17, title: 'Información relevante que consideren importante comunicar' },
    { number: 18, title: 'Nombre del dominio que tiene o desea' }
  ]}
];

// GET /api/form/structure - Get form structure
router.get('/structure', (req, res) => {
  res.json({
    success: true,
    steps: formSteps
  });
});

// POST /api/form/submit - Submit entire form
router.post('/submit', upload.array('files'), async (req, res, next) => {
  try {
    const { companyName, formData } = req.body;
    
    if (!companyName) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required'
      });
    }

    // Parse form data
    let parsedFormData;
    try {
      parsedFormData = typeof formData === 'string' 
        ? JSON.parse(formData) 
        : formData;
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid form data format'
      });
    }

    // Find or create company folder
    const companyFolderId = await driveService.findOrCreateCompanyFolder(companyName);

    // Process files
    const uploadedFiles = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const questionNumber = parseInt(file.fieldname.replace('file_', ''));
        const question = findQuestionByNumber(questionNumber);
        
        if (question) {
          const uploadedFile = await driveService.uploadFile(
            companyFolderId,
            file,
            questionNumber,
            question.stepTitle
          );
          uploadedFiles.push(uploadedFile);
        }
      }
    }

    res.json({
      success: true,
      message: 'Form submitted successfully',
      companyName: companyName,
      companyFolderId: companyFolderId,
      uploadedFiles: uploadedFiles,
      formData: parsedFormData
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to find question by number
function findQuestionByNumber(questionNumber) {
  for (const step of formSteps) {
    const question = step.questions.find(q => q.number === questionNumber);
    if (question) {
      return {
        ...question,
        stepTitle: step.title
      };
    }
  }
  return null;
}

// GET /api/form/questions - Get all questions with metadata
router.get('/questions', (req, res) => {
  const allQuestions = [];
  
  formSteps.forEach(step => {
    step.questions.forEach(question => {
      allQuestions.push({
        step: step.step,
        stepTitle: step.title,
        questionNumber: question.number,
        questionTitle: question.title
      });
    });
  });

  res.json({
    success: true,
    questions: allQuestions
  });
});

module.exports = router;
