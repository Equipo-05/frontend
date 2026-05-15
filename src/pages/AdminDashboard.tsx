// src/pages/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Definimos la interfaz basada exactamente en tu RequestOutDto.java
interface RequestOutDto {
  id: number;
  userId: number;
  userName: string;
  grantId: number;
  grantName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED'; // Basado en el Enum de Request.java
  createdAt: string;
  resolvedAt: string | null;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [recentRequests, setRecentRequests] = useState<RequestOutDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const API_URL = 'http://localhost:8086/api/v1/requests'; // Endpoint de tu RequestController
  const token = localStorage.getItem('sas_token');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(API_URL, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const requests: RequestOutDto[] = await response.json();
          
          // Calculamos las métricas usando los estados reales del backend
          const pending = requests.filter(r => r.status === 'PENDING').length;
          const approved = requests.filter(r => r.status === 'APPROVED').length;
          const rejected = requests.filter(r => r.status === 'REJECTED').length;

          setStats({
            total: requests.length,
            pending,
            approved,
            rejected
          });

          // Ordenamos por fecha de creación (más recientes primero) y tomamos las 5 primeras
          const sorted = [...requests].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ).slice(0, 5);
          
          setRecentRequests(sorted);
        }
      } catch (error) {
        console.error("Error fetching requests:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  // Mapeo de métricas para las tarjetas superiores
  const metrics = [
    { label: 'Total Applications', value: stats.total, icon: 'description', color: 'text-primary', bg: 'bg-surface-container' },
    { label: 'Pending Review', value: stats.pending, icon: 'pending_actions', color: 'text-on-surface', bg: 'bg-surface-dim' },
    { label: 'Approved', value: stats.approved, icon: 'check_circle', color: 'text-on-secondary-container', bg: 'bg-secondary-container' },
    { label: 'Rejected', value: stats.rejected, icon: 'cancel', color: 'text-on-error-container', bg: 'bg-error-container' },
  ];

  // Helper para formatear la fecha que viene del LocalDateTime de Java
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (isLoading) return <div className="p-8 text-center">Loading dashboard metrics...</div>;

  return (
    <div className="space-y-8">
      {/* Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-on-surface mb-1">Overview</h2>
          <p className="text-on-surface-variant">Real-time status of all social assistance requests.</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, idx) => (
          <div key={idx} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col justify-between hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${metric.bg} ${metric.color}`}>
                <span className="material-symbols-outlined">{metric.icon}</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface-variant mb-1">{metric.label}</p>
              <p className="text-4xl font-bold text-on-surface">{metric.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Applications Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low flex items-center justify-between">
          <h3 className="text-xl font-bold text-on-surface">Recent Applications</h3>
          <button className="text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer">
            View all <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-outline-variant">
                <th className="px-6 py-3 text-sm font-bold text-on-surface-variant">Applicant</th>
                <th className="px-6 py-3 text-sm font-bold text-on-surface-variant">Assistance Program</th>
                <th className="px-6 py-3 text-sm font-bold text-on-surface-variant">Submission Date</th>
                <th className="px-6 py-3 text-sm font-bold text-on-surface-variant">Status</th>
                <th className="px-6 py-3 text-sm font-bold text-on-surface-variant text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-on-surface">
              {recentRequests.map((req) => (
                <tr key={req.id} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs uppercase">
                        {req.userName.charAt(0)}
                      </div>
                      <span className="font-medium">{req.userName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{req.grantName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-on-surface-variant">
                    {formatDate(req.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                      req.status === 'APPROVED' ? 'bg-secondary-container text-on-secondary-container' : 
                      req.status === 'REJECTED' ? 'bg-error-container text-on-error-container' : 
                      'bg-surface-dim text-on-surface'
                    }`}>
                      <span className="material-symbols-outlined text-[16px]">
                        {req.status === 'APPROVED' ? 'check_circle' : req.status === 'REJECTED' ? 'cancel' : 'hourglass_empty'}
                      </span>
                      {req.status === 'PENDING' ? 'In Review' : req.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button 
                      onClick={() => navigate(`/admin/requests/${req.id}`)}
                      className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container-high transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined">visibility</span>
                    </button>
                  </td>
                </tr>
              ))}
              {recentRequests.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-on-surface-variant italic">
                    No requests found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}