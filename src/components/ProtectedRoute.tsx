import React, { type ReactNode } from 'react'; // Importamos ReactNode explícitamente
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
  roleRequired?: string;
}   

export default function ProtectedRoute({ children, roleRequired }: ProtectedRouteProps) {
  const token = localStorage.getItem('sas_token');
  const userStr = localStorage.getItem('sas_user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roleRequired && user.role !== roleRequired) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}