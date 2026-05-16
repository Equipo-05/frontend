import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roleRequired: string | string[];
}

export default function ProtectedRoute({ children, roleRequired }: ProtectedRouteProps) {
  const token = localStorage.getItem('sas_token');
  const userString = localStorage.getItem('sas_user');

  if (!token || !userString) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userString);
  
  // Verificamos si el rol del usuario está permitido
  const hasRequiredRole = Array.isArray(roleRequired) 
    ? roleRequired.includes(user.role) 
    : user.role === roleRequired;

  if (!hasRequiredRole) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}