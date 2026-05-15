import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login'; 
import AdminPrograms from './pages/AdminPrograms';
import GrantDetail from './pages/GrantDetail';
import BeneficiaryMgmt from './pages/BeneficiaryMgmt';
import UserDetail from './pages/UserDetail' ; // Importa la nueva vista

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
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

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}