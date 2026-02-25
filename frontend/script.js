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
    
    // Testimonials source selection
    const testimonialsRadios = document.querySelectorAll('[name="testimonialsSource"]');
    const testimonialsText = document.getElementById('testimonials');
    const testimonialsFile = document.getElementById('testimonialsFile');
    const testimonialsFiles = document.getElementById('testimonialsFiles');
    const testimonialsGoogleLink = document.getElementById('testimonialsGoogleLink');
    
    testimonialsRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            testimonialsText.classList.add('hidden');
            testimonialsFile.classList.add('hidden');
            testimonialsFiles.classList.add('hidden');
            testimonialsGoogleLink.classList.add('hidden');
            
            if (this.value === 'text') {
                testimonialsText.classList.remove('hidden');
            } else if (this.value === 'file') {
                testimonialsFile.classList.remove('hidden');
                testimonialsFiles.classList.remove('hidden');
            } else if (this.value === 'google') {
                testimonialsGoogleLink.classList.remove('hidden');
            }
        });
    });
}

function addFileItem(container, file, inputId) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.dataset.filename = file.name;
    
    const fileName = document.createElement('span');
    fileName.className = 'file-name';
    fileName.textContent = file.name;
    
    const fileSize = document.createElement('span');
    fileSize.className = 'file-size';
    fileSize.textContent = `(${formatFileSize(file.size)})`;
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-file-btn';
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', function() {
        container.removeChild(fileItem);
        // Also remove from file input
        const fileInput = document.getElementById(inputId);
        if (fileInput) {
            // This is a workaround to clear the file input without losing other files
            // Note: Due to security restrictions, we can't modify the FileList directly
        }
        saveFormProgress();
    });
    
    fileItem.appendChild(fileName);
    fileItem.appendChild(fileSize);
    fileItem.appendChild(removeBtn);
    container.appendChild(fileItem);
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
            if (filesContainer) {
                const fileItems = filesContainer.querySelectorAll('.file-item');
                fileItems.forEach(item => {
                    selectedFiles.push(item.dataset.filename);
                });
            }
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
        
        // Restore form values
        Object.keys(formData).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                if (input.type === 'file') {
                    // Files can't be restored from localStorage due to security restrictions
                } else if (input.type === 'checkbox') {
                    input.checked = true;
                } else if (input.type === 'radio') {
                    const radio = form.querySelector(`[name="${key}"][value="${formData[key]}"]`);
                    if (radio) {
                        radio.checked = true;
                        // Trigger change event to update UI
                        const event = new Event('change');
                        radio.dispatchEvent(event);
                    }
                } else {
                    input.value = formData[key];
                }
            }
        });
        
        // Restore progress bar
        // Note: We don't restore the current step from localStorage for security reasons
    }
}

function handleSubmit(e) {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
        return;
    }
    
    saveCurrentStepData();
    
    // Show success message
    form.style.display = 'none';
    successMessage.classList.remove('hidden');
    successMessage.classList.add('active');
    
    // Scroll to top
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    // Clear localStorage after successful submission
    localStorage.removeItem('formProgress');
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
