// Obtener referencias a elementos del DOM
const form = document.getElementById('mainForm');
const successMessage = document.getElementById('successMessage');

// Escuchar evento de envío del formulario
form.addEventListener('submit', function(e) {
    // Prevenir el envío por defecto
    e.preventDefault();

    // Mostrar mensaje de éxito
    showSuccessMessage();

    // Limpiar el formulario
    form.reset();
});

// Función para mostrar el mensaje de éxito
function showSuccessMessage() {
    // Ocultar el formulario
    form.style.display = 'none';

    // Mostrar el mensaje de éxito con animación
    successMessage.classList.remove('hidden');
    successMessage.style.animation = 'fadeIn 0.6s ease-out';

    // Opcional: Redirigir o reiniciar el formulario después de un tiempo
    setTimeout(function() {
        // Reiniciar el formulario y mostrarlo nuevamente
        form.style.display = 'block';
        successMessage.classList.add('hidden');
    }, 5000); // 5 segundos
}

// Escuchar evento de reset del formulario
form.addEventListener('reset', function() {
    // Limpiar estilos de validación
    const inputs = form.querySelectorAll('.form-input, .form-textarea');
    inputs.forEach(input => {
        input.classList.remove('valid', 'invalid');
    });
});

// Validación en tiempo real para campos requeridos
const requiredFields = form.querySelectorAll('[required]');
requiredFields.forEach(field => {
    field.addEventListener('blur', function() {
        validateField(this);
    });

    field.addEventListener('input', function() {
        validateField(this);
    });
});

// Función para validar un campo
function validateField(field) {
    const value = field.value.trim();
    
    if (field.tagName === 'INPUT' && field.type === 'file') {
        // Para campos de archivo, validar si hay archivos seleccionados
        const isValid = field.files.length > 0;
        updateFieldValidation(field, isValid);
    } else {
        // Para otros campos, validar que no estén vacíos
        const isValid = value.length > 0;
        updateFieldValidation(field, isValid);
    }
}

// Función para actualizar el estado de validación de un campo
function updateFieldValidation(field, isValid) {
    field.classList.remove('valid', 'invalid');
    
    if (field.value.trim().length > 0) {
        field.classList.add(isValid ? 'valid' : 'invalid');
    }
}

// Función para generar un resumen de los datos del formulario
function getFormDataSummary() {
    const formData = new FormData(form);
    const summary = {};

    // Recoger datos de campos de texto y textarea
    const textFields = form.querySelectorAll('input[type="text"], textarea');
    textFields.forEach(field => {
        if (field.value.trim()) {
            summary[field.name] = field.value.trim();
        }
    });

    // Recoger datos de campos de archivo
    const fileFields = form.querySelectorAll('input[type="file"]');
    fileFields.forEach(field => {
        if (field.files.length > 0) {
            const filenames = Array.from(field.files).map(file => file.name);
            summary[field.name] = filenames;
        }
    });

    return summary;
}

// Función para exportar los datos del formulario a JSON
function exportToJSON() {
    const formData = getFormDataSummary();
    const json = JSON.stringify(formData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'solicitud-digital-' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(url);
}

// Función para exportar los datos del formulario a CSV
function exportToCSV() {
    const formData = getFormDataSummary();
    const headers = Object.keys(formData);
    const rows = [headers];
    const values = headers.map(header => {
        const value = formData[header];
        if (Array.isArray(value)) {
            return value.join('; ');
        }
        return value;
    });
    rows.push(values);

    const csv = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'solicitud-digital-' + new Date().toISOString().split('T')[0] + '.csv';
    a.click();
    URL.revokeObjectURL(url);
}

// Añadir funcionalidad de exportación (opcional)
// Puedes uncommentar esto si quieres agregar botones de exportación
/*
function addExportButtons() {
    const exportContainer = document.createElement('div');
    exportContainer.className = 'form-actions';
    exportContainer.style.marginTop = '1rem';
    
    const exportJSONBtn = document.createElement('button');
    exportJSONBtn.className = 'btn btn-secondary';
    exportJSONBtn.textContent = 'Exportar a JSON';
    exportJSONBtn.addEventListener('click', exportToJSON);
    
    const exportCSVBtn = document.createElement('button');
    exportCSVBtn.className = 'btn btn-secondary';
    exportCSVBtn.textContent = 'Exportar a CSV';
    exportCSVBtn.addEventListener('click', exportToCSV);
    
    exportContainer.appendChild(exportJSONBtn);
    exportContainer.appendChild(exportCSVBtn);
    
    form.appendChild(exportContainer);
}

// Llamar a la función para añadir botones de exportación
// addExportButtons();
*/

// Función para verificar si el formulario está completo
function isFormComplete() {
    const requiredFields = form.querySelectorAll('[required]');
    return Array.from(requiredFields).every(field => {
        if (field.tagName === 'INPUT' && field.type === 'file') {
            return field.files.length > 0;
        }
        return field.value.trim().length > 0;
    });
}

// Función para guardar el progreso del formulario en localStorage
function saveFormProgress() {
    const formData = getFormDataSummary();
    localStorage.setItem('formProgress', JSON.stringify(formData));
}

// Función para cargar el progreso del formulario desde localStorage
function loadFormProgress() {
    const savedData = localStorage.getItem('formProgress');
    if (savedData) {
        const formData = JSON.parse(savedData);
        Object.keys(formData).forEach(key => {
            const field = form.elements[key];
            if (field) {
                if (field.tagName === 'TEXTAREA' || field.tagName === 'INPUT' && field.type !== 'file') {
                    field.value = formData[key];
                    validateField(field);
                }
            }
        });
    }
}

// Guardar progreso automáticamente cuando el usuario escribe
form.addEventListener('input', function() {
    saveFormProgress();
});

// Cargar progreso guardado al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    loadFormProgress();
});