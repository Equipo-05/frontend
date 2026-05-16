import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface RequestOutDto {
  id: number;
  userId: number;
  userName: string;
  grantId: number;
  grantName: string;
  status: string;
  createdAt: string;
  resolvedAt: string | null;
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<RequestOutDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  const token = localStorage.getItem('sas_token');
  const user = JSON.parse(localStorage.getItem('sas_user') || '{}');

  useEffect(() => {
    const fetchMyRequests = async () => {
      try {
        const response = await fetch('http://localhost:8086/api/v1/requests/mine', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data: RequestOutDto[] = await response.json();
          setRequests(data);

          setStats({
            total: data.length,
            pending: data.filter(r => r.status === 'PENDING').length,
            approved: data.filter(r => r.status === 'APPROVED').length,
            rejected: data.filter(r => r.status === 'REJECTED').length
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyRequests();
  }, [token]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (isLoading) return <div className="p-12 text-center text-slate-500 font-bold">Loading your dashboard...</div>;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1E293B]">Welcome back, {user.name}</h2>
          <p className="text-slate-500 text-sm font-medium">Track your social assistance applications and their statuses.</p>
        </div>
        <button
          onClick={() => navigate('/programs')}
          className="px-6 py-2.5 bg-[#1E293B] text-white font-bold rounded flex items-center gap-2 hover:bg-slate-800 transition-all cursor-pointer shadow-sm w-full sm:w-auto justify-center"
        >
          <span className="material-symbols-outlined text-[20px]">search</span> Browse Programs
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm flex flex-col justify-between">
          <div className="w-10 h-10 rounded bg-slate-100 text-slate-600 flex items-center justify-center mb-4 shrink-0">
            <span className="material-symbols-outlined">description</span>
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Applied</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#1E293B]">{stats.total}</p>
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm flex flex-col justify-between">
          <div className="w-10 h-10 rounded bg-amber-50 text-amber-600 flex items-center justify-center mb-4 shrink-0">
            <span className="material-symbols-outlined">pending_actions</span>
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">In Review</p>
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
            <h3 className="font-bold text-md">My Applications</h3>
          </div>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Assistance Program</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Date Applied</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Resolution Date</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {requests.map((req) => (
                <tr key={req.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-bold text-sm text-[#1E293B]">{req.grantName}</span>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-500 whitespace-nowrap">
                    {formatDate(req.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${req.status === 'APPROVED' ? 'bg-teal-100 text-teal-700' : req.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      <span className="material-symbols-outlined text-[14px]">
                        {req.status === 'APPROVED' ? 'check_circle' : req.status === 'REJECTED' ? 'cancel' : 'hourglass_empty'}
                      </span>
                      {req.status === 'PENDING' ? 'In Review' : req.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-500 whitespace-nowrap">
                    {req.resolvedAt ? formatDate(req.resolvedAt) : 'Pending Review'}
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm font-medium">
                    You haven't applied for any assistance programs yet.
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