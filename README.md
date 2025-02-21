# Meal Registration System

A full-stack application for managing employee meal registrations using QR codes.

## Features

- User authentication with role-based access control (Admin/Employee)
- Weekly menu management
- QR code-based meal registration
- Real-time meal registration tracking
- Reporting and analytics
- Employee management
- Profile management with QR code regeneration

## Tech Stack

### Frontend
- React
- Material-UI
- React Router
- Axios
- Recharts for analytics
- QR code scanning and generation

### Backend
- Node.js
- Express.js
- MySQL
- JWT authentication
- QR code generation

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd meal-registration-app
```

2. Set up the backend:
```bash
cd backend
cp .env.example .env  # Create and configure your .env file
npm install
```

3. Set up the database:
- Create a MySQL database
- Update the .env file with your database credentials
- Run the schema:
```bash
mysql -u your_username -p your_database_name < src/database/schema.sql
```

4. Set up the frontend:
```bash
cd ../frontend
cp .env.example .env  # Create and configure your .env file
npm install
```

## Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

The application will be available at http://localhost:3000

## Default Admin Account

Username: admin
Password: admin123

## API Documentation

### Authentication Endpoints
- POST /api/auth/register - Register a new user
- POST /api/auth/login - User login
- GET /api/auth/profile - Get user profile
- PUT /api/auth/profile - Update user profile

### Menu Endpoints
- GET /api/menus/weekly - Get weekly menu
- GET /api/menus/daily - Get daily menu
- POST /api/menus - Create menu (Admin)
- PUT /api/menus/:id - Update menu (Admin)
- DELETE /api/menus/:id - Delete menu (Admin)

### Meal Registration Endpoints
- POST /api/meals/register - Register a meal
- POST /api/meals/verify-qr - Verify QR code
- GET /api/meals/daily - Get daily registrations
- GET /api/meals/stats - Get registration statistics

### Employee Endpoints
- GET /api/employees - List employees (Admin)
- GET /api/employees/:id - Get employee details
- PUT /api/employees/:id - Update employee (Admin)
- DELETE /api/employees/:id - Delete employee (Admin)
- GET /api/employees/:id/qr-code - Get employee QR code

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=meal_registration_db
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NAME=Meal Registration System
REACT_APP_VERSION=1.0.0
```

## Project Structure

```
meal-registration-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── database/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.js
│   ├── .env
│   └── package.json
└── README.md
```

## License

MIT
