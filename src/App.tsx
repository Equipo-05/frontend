// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login'; 
import AdminPrograms from './pages/AdminPrograms';
import GrantDetail from './pages/GrantDetail';
import BeneficiaryMgmt from './pages/BeneficiaryMgmt';

// Componente para proteger rutas
function ProtectedRoute({ children, roleRequired }: { children: React.ReactNode, roleRequired?: string }) {
  const token = localStorage.getItem('sas_token');
  const userStr = localStorage.getItem('sas_user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!token || !user) return <Navigate to="/login" replace />;
  if (roleRequired && user.role !== roleRequired) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta de Login */}
        <Route path="/login" element={<Login />} />

        {/* Ruta de Admin */}
        <Route path="/admin" element={
          <ProtectedRoute roleRequired="ADMIN">
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/programs" element={
          <ProtectedRoute roleRequired="ADMIN">
            <DashboardLayout><AdminPrograms />
            </DashboardLayout>
            </ProtectedRoute>
        } />
        <Route path="/admin/programs/:id" element={
          <ProtectedRoute roleRequired="ADMIN">
            <DashboardLayout><GrantDetail /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute roleRequired="ADMIN">
            <DashboardLayout>
              <BeneficiaryMgmt />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Puedes añadir aquí la de USER cuando muevas el UserPanel a su archivo */}
        {/* <Route path="/dashboard" element={<ProtectedRoute roleRequired="USER"><DashboardLayout><UserDashboard /></DashboardLayout></ProtectedRoute>} /> */}

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}