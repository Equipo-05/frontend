import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login'; 
import AdminDashboard from './pages/AdminDashboard';
import AdminPrograms from './pages/AdminPrograms';
import GrantDetail from './pages/GrantDetail';
import BeneficiaryMgmt from './pages/BeneficiaryMgmt';
import UserDetail from './pages/UserDetail';
import CitizenPrograms from './pages/CitizenPrograms';
import ApplicationForm from './pages/ApplicationForm';
import UserDashboard from './pages/UserDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* ROUTES FOR STAFF (ADMIN & MANAGER) */}
        <Route path="/admin" element={
          <ProtectedRoute roleRequired={["ADMIN", "MANAGER"]}>
            <DashboardLayout><AdminDashboard /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/programs" element={
          <ProtectedRoute roleRequired={["ADMIN", "MANAGER"]}>
            <DashboardLayout><AdminPrograms /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/programs/:id" element={
          <ProtectedRoute roleRequired={["ADMIN", "MANAGER"]}>
            <DashboardLayout><GrantDetail /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* ROUTES EXCLUSIVE FOR ADMIN */}
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

        {/* ROUTES FOR CITIZENS (USER) */}
        <Route path="/dashboard" element={
          <ProtectedRoute roleRequired="USER">
            <DashboardLayout><UserDashboard /></DashboardLayout> 
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