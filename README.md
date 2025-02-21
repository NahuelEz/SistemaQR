# Sistema de Registro de Comidas QR

## Configuración del Entorno

### Base de Datos
1. Asegúrate de tener MySQL instalado y ejecutándose
2. Crea la base de datos:
```sql
mysql -u root -p
-- Ingresa tu contraseña
CREATE DATABASE meal_registration_db;
USE meal_registration_db;
source path/to/backend/src/database/schema.sql
```

### Backend (.env)
Crea un archivo `.env` en la carpeta `backend` con el siguiente contenido:
```
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=meal_registration_db

# Server Configuration
PORT=3001

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)
Crea un archivo `.env` en la carpeta `frontend` con el siguiente contenido:
```
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_QR_SCANNER_DELAY=500
```

## Instalación

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install --legacy-peer-deps
npm start
```

## Acceso
Una vez que los servicios estén ejecutándose, accede a:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Usuario por defecto
- Usuario: admin
- Contraseña: admin123
- Email: admin@example.com

## Orden de inicio
1. Asegúrate de que MySQL esté corriendo (puerto 3306)
2. Inicia el servidor backend (puerto 3001)
3. Inicia el frontend (puerto 3000)
