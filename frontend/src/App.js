import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layout Components
import MainLayout from './components/layout/MainLayout';

// Lazy load other components
const Menu = React.lazy(() => import('./components/menu/Menu'));
const QRScanner = React.lazy(() => import('./components/meal/QRScanner'));
const EmployeeList = React.lazy(() => import('./components/employee/EmployeeList'));
const Reports = React.lazy(() => import('./components/menu/Reports'));
const Profile = React.lazy(() => import('./components/auth/Profile'));
const WeeklyMenuSelection = React.lazy(() => import('./components/menu/WeeklyMenuSelection'));

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh' 
  }}>
    Loading...
  </div>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <React.Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route
                path="/menu"
                element={
                  <ProtectedRoute roles={['admin', 'employee']}>
                    <Menu />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/scan"
                element={
                  <ProtectedRoute roles={['admin', 'employee']}>
                    <QRScanner />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/employees"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <EmployeeList />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/reports"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <Reports />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute roles={['admin', 'employee']}>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/weekly-menu"
                element={
                  <ProtectedRoute roles={['employee']}>
                    <WeeklyMenuSelection />
                  </ProtectedRoute>
                }
              />

              {/* Redirect root to appropriate page based on role */}
              <Route
                path="/"
                element={
                  <ProtectedRoute roles={['admin', 'employee']}>
                    <Navigate to="/menu" replace />
                  </ProtectedRoute>
                }
              />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </React.Suspense>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
