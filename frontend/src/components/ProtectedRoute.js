import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  if (!user) {
    // Redirigir a login si el usuario no está autenticado
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin()) {
    // Redirigir al dashboard si el usuario no es admin
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
