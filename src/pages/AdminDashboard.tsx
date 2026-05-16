import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface RequestOutDto {
  id: number;
  userId: number;
  userName: string;
  grantId: number;
  grantName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  resolvedAt: string | null;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [recentRequests, setRecentRequests] = useState<RequestOutDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [managingRequest, setManagingRequest] = useState<RequestOutDto | null>(null);

  const token = localStorage.getItem('sas_token');

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:8086/api/v1/requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const requests: RequestOutDto[] = await response.json();
        setStats({
          total: requests.length,
          pending: requests.filter(r => r.status === 'PENDING').length,
          approved: requests.filter(r => r.status === 'APPROVED').length,
          rejected: requests.filter(r => r.status === 'REJECTED').length
        });

        const sorted = [...requests].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ).slice(0, 5);
        setRecentRequests(sorted);
      }
    } catch (error) {
      console.error(error);
    } {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const handleRequestStatusChange = async (newStatus: string) => {
    if (!managingRequest) return;
    try {
      const response = await fetch(`http://localhost:8086/api/v1/requests/${managingRequest.id}/status?status=${newStatus}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setManagingRequest(null);
        fetchDashboardData(); 
      }
    } catch (error) {
      console.error(error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (isLoading) return <div className="p-12 text-center text-slate-500 font-bold">Loading dashboard metrics...</div>;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#1E293B]">Overview</h2>
        <p className="text-slate-500 text-sm font-medium">Real-time status of all social assistance requests.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm flex flex-col justify-between">
          <div className="w-10 h-10 rounded bg-slate-100 text-slate-600 flex items-center justify-center mb-4 shrink-0">
            <span className="material-symbols-outlined">description</span>
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Applications</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#1E293B]">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm flex flex-col justify-between">
          <div className="w-10 h-10 rounded bg-amber-50 text-amber-600 flex items-center justify-center mb-4 shrink-0">
            <span className="material-symbols-outlined">pending_actions</span>
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pending Review</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#1E293B]">{stats.pending}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm flex flex-col justify-between">
          <div className="w-10 h-10 rounded bg-teal-50 text-teal-700 flex items-center justify-center mb-4 shrink-0">
            <span className="material-symbols-outlined">check_circle</span>
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Approved</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-teal-700">{stats.approved}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm flex flex-col justify-between">
          <div className="w-10 h-10 rounded bg-red-50 text-red-600 flex items-center justify-center mb-4 shrink-0">
            <span className="material-symbols-outlined">cancel</span>
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Rejected</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-red-600">{stats.rejected}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-md shadow-sm w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-2 text-[#1E293B]">
            <span className="material-symbols-outlined">assignment</span>
            <h3 className="font-bold text-md">Recent Applications</h3>
          </div>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-white border-b border-slate-100">
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Applicant</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assistance Program</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Submission Date</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {recentRequests.map((req) => (
                <tr key={req.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                        {String(req.userName || 'U').charAt(0)}
                      </div>
                      <span className="font-bold text-sm text-[#1E293B] truncate">{req.userName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{req.grantName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-500">{formatDate(req.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${req.status === 'APPROVED' ? 'bg-teal-100 text-teal-700' : req.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                      <span className="material-symbols-outlined text-[14px]">
                        {req.status === 'APPROVED' ? 'check_circle' : req.status === 'REJECTED' ? 'cancel' : 'hourglass_empty'}
                      </span>
                      {req.status === 'PENDING' ? 'In Review' : req.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button onClick={() => setManagingRequest(req)} className="p-2 text-slate-400 hover:text-teal-600 rounded transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {managingRequest && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2 text-[#1E293B]">
                <span className="material-symbols-outlined">rule</span>
                <h2 className="text-lg font-bold">Manage Application</h2>
              </div>
              <button onClick={() => setManagingRequest(null)} className="text-slate-400 hover:text-red-500 cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Applicant</p>
                <p className="font-bold text-[#1E293B] text-lg">{managingRequest.userName}</p>
                <p className="text-sm text-slate-500 font-medium">Submitted: {formatDate(managingRequest.createdAt)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Current Status</p>
                <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wide ${managingRequest.status === 'APPROVED' ? 'bg-teal-100 text-teal-700' : managingRequest.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                  {managingRequest.status}
                </span>
              </div>
            </div>
            <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-3">
              <button onClick={() => handleRequestStatusChange('REJECTED')} disabled={managingRequest.status === 'REJECTED'} className="flex-1 px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-bold rounded hover:bg-red-50 transition-all cursor-pointer disabled:opacity-50">
                Deny Application
              </button>
              <button onClick={() => handleRequestStatusChange('APPROVED')} disabled={managingRequest.status === 'APPROVED'} className="flex-1 px-4 py-2 bg-teal-700 text-white text-sm font-bold rounded hover:bg-teal-800 transition-all cursor-pointer disabled:opacity-50">
                Approve Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}