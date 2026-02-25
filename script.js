// Form navigation and progress
let currentStep = 1;
const totalSteps = 5;
let formData = {};

// DOM Elements
const form = document.getElementById('mainForm');
const slides = document.querySelectorAll('.slide');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const progressFill = document.querySelector('.progress-fill');
const currentStepText = document.querySelector('.current-step');
const successMessage = document.getElementById('successMessage');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateProgress();
    loadFormProgress();
    setupEventListeners();
});

function setupEventListeners() {
    // Navigation buttons
    prevBtn.addEventListener('click', () => goToStep(currentStep - 1));
    nextBtn.addEventListener('click', () => {
        if (validateCurrentStep()) {
            saveCurrentStepData();
            goToStep(currentStep + 1);
        }
    });
    
    // Submit button
    submitBtn.addEventListener('click', handleSubmit);
    
    // Form input listeners for auto-save
    const allInputs = form.querySelectorAll('input, textarea, select');
    allInputs.forEach(input => {
        input.addEventListener('input', saveFormProgress);
        input.addEventListener('change', saveFormProgress);
    });
    
    // Real-time validation
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', () => validateField(field));
        field.addEventListener('input', () => validateField(field));
    });
    
    // File input handlers
    const fileInputs = [
        { id: 'brandManual', driveId: 'brandManualDrive', sourceName: 'brandManualSource' },
        { id: 'logo', driveId: 'logoDrive', sourceName: 'logoSource' },
        { id: 'photos', driveId: 'photosDrive', sourceName: 'photosSource' },
        { id: 'videos', driveId: 'videosDrive', sourceName: 'videosSource' },
        { id: 'additionalGraphics', driveId: 'additionalGraphicsDrive', sourceName: 'additionalGraphicsSource' },
        { id: 'educationalMaterial', driveId: 'educationalMaterialDrive', sourceName: 'educationalMaterialSource' }
    ];
    
    fileInputs.forEach(input => {
        const fileInput = document.getElementById(input.id);
        const driveInput = document.getElementById(input.driveId);
        const sourceRadios = document.querySelectorAll(`[name="${input.sourceName}"]`);
        const filesContainer = document.getElementById(`${input.id}Files`);
        
        // File selection handler
        fileInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                // Add new files to existing ones
                const existingFiles = [];
                const currentFiles = filesContainer.querySelectorAll('.file-item');
                currentFiles.forEach(item => {
                    existingFiles.push(item.dataset.filename);
                });
                
                Array.from(e.target.files).forEach(file => {
                    if (!existingFiles.includes(file.name)) {
                        addFileItem(filesContainer, file, input.id);
                    }
                });
            }
            saveFormProgress();
        });
        
        // Source selection handler
        sourceRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'drive') {
                    fileInput.disabled = true;
                    driveInput.classList.remove('hidden');
                    driveInput.classList.add('active');
                    filesContainer.innerHTML = '';
                } else {
                    fileInput.disabled = false;
                    driveInput.classList.add('hidden');
                    driveInput.classList.remove('active');
                    driveInput.value = '';
                }
                saveFormProgress();
            });
        });
    });
    
    // Conditional logic listeners
    // Social media
    const socialMediaMethod = document.getElementById('socialMediaMethod');
    const socialMediaFormFields = document.getElementById('socialMediaFormFields');
    const socialMediaCredentials = document.getElementById('socialMediaCredentials');
    const socialMediaInstagram = document.getElementById('socialMediaInstagram');
    const socialMediaMeta = document.getElementById('socialMediaMeta');
    const socialMediaTikTok = document.getElementById('socialMediaTikTok');
    const instagramCredentials = document.getElementById('instagramCredentials');
    const metaCredentials = document.getElementById('metaCredentials');
    const tiktokCredentials = document.getElementById('tiktokCredentials');
    
    socialMediaMethod.addEventListener('change', (e) => {
        if (e.target.value === 'form') {
            socialMediaFormFields.classList.remove('hidden');
            socialMediaFormFields.classList.add('active');
        } else {
            socialMediaFormFields.classList.add('hidden');
            socialMediaFormFields.classList.remove('active');
            socialMediaCredentials.classList.add('hidden');
            socialMediaCredentials.classList.remove('active');
            // Clear all selections
            socialMediaInstagram.checked = false;
            socialMediaMeta.checked = false;
            socialMediaTikTok.checked = false;
            instagramCredentials.classList.add('hidden');
            metaCredentials.classList.add('hidden');
            tiktokCredentials.classList.add('hidden');
        }
        saveFormProgress();
    });
    
    // Social media checkboxes
    const socialMediaCheckboxes = [socialMediaInstagram, socialMediaMeta, socialMediaTikTok];
    const socialMediaCredentialElements = {
        instagram: instagramCredentials,
        meta: metaCredentials,
        tiktok: tiktokCredentials
    };
    
    socialMediaCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const socialMedia = this.value;
            const credentialElement = socialMediaCredentialElements[socialMedia];
            
            if (this.checked) {
                socialMediaCredentials.classList.remove('hidden');
                socialMediaCredentials.classList.add('active');
                credentialElement.classList.remove('hidden');
                credentialElement.classList.add('active');
            } else {
                credentialElement.classList.add('hidden');
                credentialElement.classList.remove('active');
                
                // Check if any other social media is selected
                const anySelected = socialMediaCheckboxes.some(cb => cb.checked);
                if (!anySelected) {
                    socialMediaCredentials.classList.add('hidden');
                    socialMediaCredentials.classList.remove('active');
                }
            }
            saveFormProgress();
        });
    });
    
    // Business Manager
    const businessManagerMethod = document.getElementById('businessManagerMethod');
    const businessManagerFormFields = document.getElementById('businessManagerFormFields');
    
    businessManagerMethod.addEventListener('change', (e) => {
        if (e.target.value === 'form') {
            businessManagerFormFields.classList.remove('hidden');
            businessManagerFormFields.classList.add('active');
        } else {
            businessManagerFormFields.classList.add('hidden');
            businessManagerFormFields.classList.remove('active');
        }
        saveFormProgress();
    });
    
    // Hotmart
    const hotmartMethod = document.getElementById('hotmartMethod');
    const hotmartFormFields = document.getElementById('hotmartFormFields');
    
    hotmartMethod.addEventListener('change', (e) => {
        if (e.target.value === 'form') {
            hotmartFormFields.classList.remove('hidden');
            hotmartFormFields.classList.add('active');
        } else {
            hotmartFormFields.classList.add('hidden');
            hotmartFormFields.classList.remove('active');
        }
        saveFormProgress();
    });
}

function addFileItem(container, file, inputId) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.dataset.filename = file.name;
    
    const fileIcon = getFileIcon(file.name);
    const fileSize = formatFileSize(file.size);
    
    fileItem.innerHTML = `
        <div class="file-info">
            <span class="file-icon">${fileIcon}</span>
            <span class="file-name">${file.name}</span>
            <span class="file-size">${fileSize}</span>
        </div>
        <button type="button" class="file-remove" onclick="removeFileItem(this, '${inputId}')">×</button>
    `;
    
    container.appendChild(fileItem);
}

function removeFileItem(button, inputId) {
    const fileItem = button.closest('.file-item');
    const filename = fileItem.dataset.filename;
    
    // Remove from DOM
    fileItem.remove();
    
    // Also remove from file input (modern browsers don't allow direct manipulation of file list)
    // So we need to reset the file input and add remaining files
    const fileInput = document.getElementById(inputId);
    const remainingFiles = [];
    
    const filesContainer = document.getElementById(`${inputId}Files`);
    const remainingFileItems = filesContainer.querySelectorAll('.file-item');
    remainingFileItems.forEach(item => {
        remainingFiles.push(item.dataset.filename);
    });
    
    saveFormProgress();
}

function getFileIcon(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    
    const icons = {
        pdf: '📄',
        doc: '📘',
        docx: '📘',
        zip: '📦',
        rar: '📦',
        png: '🖼️',
        jpg: '🖼️',
        jpeg: '🖼️',
        svg: '🖼️',
        mp4: '🎥',
        mov: '🎥',
        avi: '🎥',
        mkv: '🎥',
        ppt: '📊',
        pptx: '📊'
    };
    
    return icons[extension] || '📄';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function goToStep(step) {
    // Hide current slide
    slides[currentStep - 1].classList.remove('active');
    
    // Show new slide
    currentStep = step;
    slides[currentStep - 1].classList.add('active');
    
    // Update navigation buttons
    updateNavigationButtons();
    updateProgress();
    
    // Save scroll position
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function updateNavigationButtons() {
    // Previous button
    prevBtn.disabled = currentStep === 1;
    
    // Next button
    if (currentStep === totalSteps) {
        nextBtn.style.display = 'none';
        submitBtn.classList.add('active');
    } else {
        nextBtn.style.display = 'flex';
        submitBtn.classList.remove('active');
    }
}

function updateProgress() {
    // Update progress bar
    const progress = (currentStep / totalSteps) * 100;
    progressFill.style.width = `${progress}%`;
    
    // Update step text
    currentStepText.textContent = `Paso ${currentStep}`;
    
    // Add animation class
    progressFill.classList.remove('progress-animating');
    void progressFill.offsetWidth; // Trigger reflow
    progressFill.classList.add('progress-animating');
}

function validateCurrentStep() {
    const currentSlide = slides[currentStep - 1];
    const requiredFields = currentSlide.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
            highlightError(field);
        }
    });
    
    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    
    if (field.tagName === 'INPUT' && field.type === 'file') {
        const isValid = field.files.length > 0;
        updateFieldValidation(field, isValid);
        return isValid;
    } else {
        const isValid = value.length > 0;
        updateFieldValidation(field, isValid);
        return isValid;
    }
}

function updateFieldValidation(field, isValid) {
    field.classList.remove('valid', 'invalid');
    
    if (field.value.trim().length > 0) {
        field.classList.add(isValid ? 'valid' : 'invalid');
    }
}

function highlightError(field) {
    field.classList.add('invalid');
    field.style.animation = 'shake 0.5s';
    setTimeout(() => {
        field.style.animation = '';
    }, 500);
}

function saveCurrentStepData() {
    const currentSlide = slides[currentStep - 1];
    const inputs = currentSlide.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        if (input.type === 'file') {
            // Save selected files from the UI
            const filesContainer = document.getElementById(`${input.id}Files`);
            const selectedFiles = [];
            const fileItems = filesContainer.querySelectorAll('.file-item');
            fileItems.forEach(item => {
                selectedFiles.push(item.dataset.filename);
            });
            formData[input.name] = selectedFiles;
        } else {
            // Check if field is visible before saving
            let isVisible = true;
            let element = input;
            while (element && element !== currentSlide) {
                if (element.classList.contains('hidden')) {
                    isVisible = false;
                    break;
                }
                element = element.parentElement;
            }
            
            if (isVisible) {
                formData[input.name] = input.value.trim();
            } else {
                // If field is hidden, remove it from formData
                delete formData[input.name];
            }
        }
    });
    
    saveFormProgress();
}

function saveFormProgress() {
    localStorage.setItem('formProgress', JSON.stringify(formData));
}

function loadFormProgress() {
    const savedData = localStorage.getItem('formProgress');
    if (savedData) {
        formData = JSON.parse(savedData);
        
        Object.keys(formData).forEach(key => {
            const field = form.elements[key];
            if (field) {
                if (field.tagName === 'TEXTAREA' || (field.tagName === 'INPUT' && field.type !== 'file')) {
                    field.value = formData[key];
                    validateField(field);
                }
            }
        });
        
        // Restore conditional field states
        // File inputs
        const fileInputs = [
            { id: 'brandManual', driveId: 'brandManualDrive', sourceName: 'brandManualSource' },
            { id: 'logo', driveId: 'logoDrive', sourceName: 'logoSource' },
            { id: 'photos', driveId: 'photosDrive', sourceName: 'photosSource' },
            { id: 'videos', driveId: 'videosDrive', sourceName: 'videosSource' },
            { id: 'additionalGraphics', driveId: 'additionalGraphicsDrive', sourceName: 'additionalGraphicsSource' },
            { id: 'educationalMaterial', driveId: 'educationalMaterialDrive', sourceName: 'educationalMaterialSource' }
        ];
        
        fileInputs.forEach(input => {
            const sourceRadios = document.querySelectorAll(`[name="${input.sourceName}"]`);
            const driveInput = document.getElementById(input.driveId);
            const fileInput = document.getElementById(input.id);
            const filesContainer = document.getElementById(`${input.id}Files`);
            
            if (formData[input.sourceName] === 'drive') {
                sourceRadios.forEach(radio => {
                    if (radio.value === 'drive') {
                        radio.checked = true;
                        fileInput.disabled = true;
                        driveInput.classList.remove('hidden');
                        driveInput.classList.add('active');
                        if (formData[input.driveId]) {
                            driveInput.value = formData[input.driveId];
                        }
                    }
                });
            }
            
            if (formData[input.id]) {
                // Restore selected files in UI
                formData[input.id].forEach(filename => {
                    const mockFile = {
                        name: filename,
                        size: 0 // We don't have size from storage
                    };
                    addFileItem(filesContainer, mockFile, input.id);
                });
            }
        });
        
        // Social media
        const socialMediaMethod = document.getElementById('socialMediaMethod');
        const socialMediaFormFields = document.getElementById('socialMediaFormFields');
        const socialMediaCredentials = document.getElementById('socialMediaCredentials');
        const socialMediaInstagram = document.getElementById('socialMediaInstagram');
        const socialMediaMeta = document.getElementById('socialMediaMeta');
        const socialMediaTikTok = document.getElementById('socialMediaTikTok');
        const instagramCredentials = document.getElementById('instagramCredentials');
        const metaCredentials = document.getElementById('metaCredentials');
        const tiktokCredentials = document.getElementById('tiktokCredentials');
        
        if (formData.socialMediaMethod === 'form') {
            socialMediaFormFields.classList.remove('hidden');
            socialMediaFormFields.classList.add('active');
            
            // Restore social media selections
            if (formData.socialMediaInstagram) {
                socialMediaInstagram.checked = true;
                socialMediaCredentials.classList.remove('hidden');
                socialMediaCredentials.classList.add('active');
                instagramCredentials.classList.remove('hidden');
                instagramCredentials.classList.add('active');
            }
            if (formData.socialMediaMeta) {
                socialMediaMeta.checked = true;
                socialMediaCredentials.classList.remove('hidden');
                socialMediaCredentials.classList.add('active');
                metaCredentials.classList.remove('hidden');
                metaCredentials.classList.add('active');
            }
            if (formData.socialMediaTikTok) {
                socialMediaTikTok.checked = true;
                socialMediaCredentials.classList.remove('hidden');
                socialMediaCredentials.classList.add('active');
                tiktokCredentials.classList.remove('hidden');
                tiktokCredentials.classList.add('active');
            }
        }
        
        // Business Manager
        const businessManagerMethod = document.getElementById('businessManagerMethod');
        const businessManagerFormFields = document.getElementById('businessManagerFormFields');
        
        if (formData.businessManagerMethod === 'form') {
            businessManagerFormFields.classList.remove('hidden');
            businessManagerFormFields.classList.add('active');
        }
        
        // Hotmart
        const hotmartMethod = document.getElementById('hotmartMethod');
        const hotmartFormFields = document.getElementById('hotmartFormFields');
        
        if (formData.hotmartMethod === 'form') {
            hotmartFormFields.classList.remove('hidden');
            hotmartFormFields.classList.add('active');
        }
    }
}

async function handleSubmit(e) {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
        return;
    }
    
    saveCurrentStepData();
    
    // Show loading state
    const submitButton = document.getElementById('submitBtn');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<span class="loading">🚀 Enviando...</span>';
    submitButton.disabled = true;
    
    try {
        console.log('📝 Submitting form to InsForge BaaS...');
        
        // Submit form data to API
        const response = await fetch('http://localhost:8080/api/submit-form', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Form submitted successfully');
            showSuccessMessage();
            
            // Clear form and localStorage
            form.reset();
            localStorage.removeItem('formProgress');
            formData = {};
        } else {
            console.error('❌ Error submitting form:', result.error);
            showErrorMessage(result.error || 'Error al enviar el formulario');
        }
        
    } catch (error) {
        console.error('❌ Network error:', error);
        showErrorMessage('Error de conexión. Por favor, inténtelo nuevamente.');
    } finally {
        // Restore submit button
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
}

function showSuccessMessage() {
    form.style.display = 'none';
    successMessage.classList.remove('hidden');
    
    // Reset form after delay
    setTimeout(() => {
        form.style.display = 'block';
        successMessage.classList.add('hidden');
        goToStep(1);
    }, 5000);
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <div class="error-icon">⚠️</div>
        <p>${message}</p>
        <button class="error-retry" onclick="this.parentElement.remove()">Intentar nuevamente</button>
    `;
    
    const formActions = document.querySelector('.form-actions');
    formActions.appendChild(errorDiv);
    
    // Remove after 10 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 10000);
}

// Add shake animation for errors
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
    .invalid {
        border-color: #ff6b6b !important;
        background-color: #fff5f5 !important;
    }
    .valid {
        border-color: #38ef7d !important;
        background-color: #f0fff4 !important;
    }
    .progress-animating {
        transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }
`;
document.head.appendChild(style);

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (currentStep < totalSteps) {
            if (validateCurrentStep()) {
                saveCurrentStepData();
                goToStep(currentStep + 1);
            }
        } else if (currentStep === totalSteps) {
            handleSubmit(e);
        }
    } else if (e.key === 'ArrowLeft' && currentStep > 1) {
        e.preventDefault();
        goToStep(currentStep - 1);
    } else if (e.key === 'ArrowRight' && currentStep < totalSteps) {
        e.preventDefault();
        if (validateCurrentStep()) {
            saveCurrentStepData();
            goToStep(currentStep + 1);
        }
    }
});

// Prevent form submission on enter
form.addEventListener('submit', (e) => {
    e.preventDefault();
});

// Add smooth scrolling behavior
document.documentElement.style.scrollBehavior = 'smooth';