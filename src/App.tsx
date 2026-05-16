import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login'; 
import AdminPrograms from './pages/AdminPrograms';
import GrantDetail from './pages/GrantDetail';
import BeneficiaryMgmt from './pages/BeneficiaryMgmt';
import UserDetail from './pages/UserDetail';
import CitizenPrograms from './pages/CitizenPrograms';
import ApplicationForm from './pages/ApplicationForm';
import UserDashboard from './pages/UserDashboard'; // <-- IMPORTA EL NUEVO COMPONENTE

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* ADMIN ROUTES */}
        <Route path="/admin" element={
          <ProtectedRoute roleRequired="ADMIN">
            <DashboardLayout><AdminDashboard /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/programs" element={
          <ProtectedRoute roleRequired="ADMIN">
            <DashboardLayout><AdminPrograms /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/programs/:id" element={
          <ProtectedRoute roleRequired="ADMIN">
            <DashboardLayout><GrantDetail /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute roleRequired="ADMIN">
            <DashboardLayout><BeneficiaryMgmt /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/users/:id" element={
          <ProtectedRoute roleRequired="ADMIN">
            <DashboardLayout><UserDetail /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* REGULAR USER ROUTES */}
        <Route path="/dashboard" element={
          <ProtectedRoute roleRequired="USER">
            <DashboardLayout><UserDashboard /></DashboardLayout>  {/* <-- APLICA EL COMPONENTE AQUÍ */}
          </ProtectedRoute>
        } />
        <Route path="/programs" element={
          <ProtectedRoute roleRequired="USER">
            <DashboardLayout><CitizenPrograms /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/apply/:id" element={
          <ProtectedRoute roleRequired="USER">
            <DashboardLayout><ApplicationForm /></DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}