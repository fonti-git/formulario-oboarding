# Onboarding Form Backend

Backend para el formulario de onboarding, implementado con Node.js + Express + Google Drive API.

## Seguridad Importante

⚠️ **Nunca compartas tus archivos de configuración con API Keys expuestas!**

### Archivos Sensibles
- `.env` - Contiene variables de entorno con credenciales reales (ignorado por git)
- `mcp-config.json` - Generado dinámicamente, contiene la API Key en texto plano (ignorado por git)
- `google-credentials.json` - Credenciales de Google Drive API (ignorado por git)

### Configuración Inicial

1. **Clonar el repositorio**
2. **Instalar dependencias**:
   ```bash
   cd backend
   npm install
   ```

3. **Configurar variables de entorno**:
   - Copiar `.env.example` a `.env`
   - Editar `.env` con tus credenciales reales
   - **¡Importante!**: Never commit `.env` file

4. **Generar configuración MCP**:
   ```bash
   npm run setup
   ```

5. **Verificar configuración**:
   - Archivo `mcp-config.json` se generará automáticamente
   - No modificar este archivo manualmente

### Variables de Entorno

#### InsForge API (Obligatorias)
- `INSFORGE_API_KEY`: Tu API Key de InsForge
- `INSFORGE_API_BASE_URL`: URL base de la API InsForge

#### Server Configuration
- `PORT`: Puerto del servidor (default: 3000)
- `NODE_ENV`: Entorno (development/production/test)

#### Google Drive Configuration
- `GOOGLE_DRIVE_CLIENT_ID`: Client ID de Google Cloud
- `GOOGLE_DRIVE_CLIENT_SECRET`: Client Secret de Google Cloud  
- `GOOGLE_DRIVE_REFRESH_TOKEN`: Refresh Token para acceso offline
- `GOOGLE_DRIVE_FOLDER_ID`: ID de la carpeta raíz en Google Drive

#### Security Configuration
- `JWT_SECRET`: Clave secreta para JWT
- `CORS_ORIGIN`: Orígenes permitidos para CORS

#### File Upload Configuration
- `MAX_FILE_SIZE`: Tamaño máximo de archivo (default: 10MB)
- `ALLOWED_FILE_TYPES`: Tipos de archivo permitidos

### Generación de Credenciales Google Drive

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear un proyecto nuevo
3. Habilitar la API de Google Drive
4. Crear credenciales OAuth 2.0
5. Obtener Client ID y Client Secret
6. Generar Refresh Token usando OAuth Playground
7. Almacenar credenciales en `.env`

### Uso

```bash
# Development (with hot reload)
npm run dev

# Production
npm start

# Run tests
npm run test
```

### Estructura de Archivos en Google Drive

```
[Empresa]/
├── P0-INFORMACIÓN DE LA EMPRESA/
│   ├── P0-INFORMACIÓN DE LA EMPRESA [nombre_archivo1]
│   └── P0-INFORMACIÓN DE LA EMPRESA [nombre_archivo2]
├── P1-INFORMACIÓN DE LA EMPRESA/
│   ├── P1-INFORMACIÓN DE LA EMPRESA [nombre_archivo1]
│   └── P1-INFORMACIÓN DE LA EMPRESA [nombre_archivo2]
├── P5-IDENTIDAD VISUAL/
│   ├── P5-IDENTIDAD VISUAL [nombre_archivo1]
│   └── P5-IDENTIDAD VISUAL [nombre_archivo2]
└── ...
```

### Endpoints

#### POST `/api/upload`
Subir archivos al formulario.

**Body (multipart/form-data):**
- `companyName`: Nombre de la empresa
- `questionNumber`: Número de pregunta (0-18)
- `stepTitle`: Título del paso
- `files`: Archivos a subir

**Response:**
```json
{
  "success": true,
  "message": "Archivos subidos correctamente",
  "files": [
    {
      "name": "P0-INFORMACIÓN DE LA EMPRESA logo.png",
      "url": "https://drive.google.com/...",
      "size": 102400
    }
  ]
}
```

### Seguridad
- API Keys almacenadas en variables de entorno
- Archivos sensibles ignorados por git
- Validación de tipos de archivo
- Límite de tamaño de archivo
- Autenticación JWT (para endpoints protegidos)
