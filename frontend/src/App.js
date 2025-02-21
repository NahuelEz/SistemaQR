import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { AuthProvider } from './context/AuthContext';
import theme from './theme';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Employees from './pages/employees/Employees';
import Menus from './pages/menus/Menus';
import WeeklySelection from './pages/menus/WeeklySelection';
import QRScanner from './pages/qr-scanner/QRScanner';
import Profile from './pages/profile/Profile';

// Components
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Ruta pública - Login */}
            <Route path="/login" element={<Login />} />

            {/* Rutas protegidas */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard - Página principal */}
              <Route index element={<Dashboard />} />

              {/* Rutas de administración - Solo para admins */}
              <Route
                path="employees"
                element={
                  <ProtectedRoute adminOnly>
                    <Employees />
                  </ProtectedRoute>
                }
              />
              <Route
                path="menus"
                element={
                  <ProtectedRoute adminOnly>
                    <Menus />
                  </ProtectedRoute>
                }
              />

              {/* Rutas para todos los usuarios autenticados */}
              <Route path="weekly-selection" element={<WeeklySelection />} />
              <Route
                path="qr-scanner"
                element={
                  <ProtectedRoute adminOnly>
                    <QRScanner />
                  </ProtectedRoute>
                }
              />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Redirigir rutas no encontradas al dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
