import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface RequestOutDto { id: number; userId: number; userName: string; grantId: number; grantName: string; status: string; createdAt: string; }
interface Grant { id: number; name: string; type: string; description: string; vacancies: number; available: boolean; internalCode: string; }

export default function GrantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [grant, setGrant] = useState<Grant | null>(null);
  const [requests, setRequests] = useState<RequestOutDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [managingRequest, setManagingRequest] = useState<RequestOutDto | null>(null);
  const [formData, setFormData] = useState({ name: '', type: '', description: '', vacancies: 0, internalCode: '' });

  const token = localStorage.getItem('sas_token');

  const fetchData = async () => {
    try {
      const grantResponse = await fetch(`http://localhost:8086/api/v1/grants/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (grantResponse.ok) {
        const grantData = await grantResponse.json();
        setGrant(grantData);
        setFormData({ name: grantData.name, type: grantData.type, description: grantData.description, vacancies: grantData.vacancies, internalCode: grantData.internalCode });
      }

      const requestsResponse = await fetch(`http://localhost:8086/api/v1/requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (requestsResponse.ok) {
        const requestsData: RequestOutDto[] = await requestsResponse.json();
        setRequests(requestsData.filter(req => req.grantId === Number(id)));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id, token]);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8086/api/v1/grants/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...formData, available: grant?.available })
      });
      if (response.ok) { setIsModalOpen(false); fetchData(); }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCloseProgram = async () => {
    if (!grant || !window.confirm("Are you sure you want to close this program?")) return;
    try {
      const response = await fetch(`http://localhost:8086/api/v1/grants/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...grant, available: false })
      });
      if (response.ok) fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRequestStatusChange = async (newStatus: string) => {
    if (!managingRequest) return;
    try {
      const response = await fetch(`http://localhost:8086/api/v1/requests/${managingRequest.id}/status?status=${newStatus}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) { setManagingRequest(null); fetchData(); }
    } catch (error) {
      console.error(error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type?.toLowerCase()) {
      case 'housing': return 'home';
      case 'education': return 'school';
      case 'food': return 'restaurant';
      case 'financial': return 'payments';
      default: return 'inventory_2';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (isLoading) return <div className="p-12 text-center text-slate-500 font-bold">Loading details...</div>;
  if (!grant) return <div className="p-12 text-center text-red-600 font-bold">Program not found.</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-[#1E293B] rounded-lg flex items-center justify-center shadow-md shrink-0">
            <span className="material-symbols-outlined text-4xl text-white">{getTypeIcon(grant.type)}</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wide ${grant.available ? 'bg-teal-100 text-teal-700' : 'bg-red-100 text-red-700'}`}>{grant.available ? 'Active' : 'Closed'}</span>
              <span className="text-slate-400 font-mono text-xs font-bold">{grant.internalCode}</span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B]">{grant.name}</h2>
              <button onClick={() => setIsModalOpen(true)} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-teal-600 shadow-sm transition-all cursor-pointer"><span className="material-symbols-outlined text-[16px]">edit</span></button>
            </div>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={() => navigate('/admin/programs')} className="flex-1 md:flex-none px-6 py-2 border border-slate-300 text-slate-700 font-bold rounded hover:bg-slate-50">Back to Catalog</button>
          {grant.available && <button onClick={handleCloseProgram} className="flex-1 md:flex-none px-6 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-700 shadow-sm flex items-center justify-center gap-2"><span className="material-symbols-outlined text-[18px]">lock</span> Close Program</button>}
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-white border border-slate-200 rounded-md p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-[#1E293B]"><span className="material-symbols-outlined">info</span><h3 className="font-bold text-lg">Program Details</h3></div>
          <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">{grant.description}</p>
          <div className="flex gap-12 pt-6 border-t border-slate-100">
            <div><p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Category</p><p className="font-bold text-[#1E293B] flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-teal-600">{getTypeIcon(grant.type)}</span>{grant.type}</p></div>
            <div><p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Available Vacancies</p><p className="font-bold text-[#1E293B]">{grant.vacancies} Positions</p></div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md shadow-sm w-full overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <div className="flex items-center gap-2 text-[#1E293B]"><span className="material-symbols-outlined">assignment</span><h3 className="font-bold text-md">Recent Applications</h3></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{requests.length} Total</span>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Applicant</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {requests.map((req) => (
                  <tr key={req.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">{String(req.userName || 'U').charAt(0)}</div>
                        <span className="font-bold text-sm text-[#1E293B] truncate">{req.userName || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-500">{formatDate(req.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${req.status === 'APPROVED' ? 'bg-teal-100 text-teal-700' : req.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>{req.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setManagingRequest(req)} className="p-2 text-slate-400 hover:text-teal-600 rounded transition-colors cursor-pointer"><span className="material-symbols-outlined text-[18px]">visibility</span></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h2 className="text-lg font-bold text-[#1E293B]">Edit Grant Information</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleUpdate} className="p-4 sm:p-6 overflow-y-auto space-y-4">
              <div className="space-y-1"><label className="text-[11px] font-bold text-slate-500 uppercase">Grant Name</label><input required type="text" className="w-full px-3 py-2 border border-slate-200 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[11px] font-bold text-slate-500 uppercase">Category</label><select className="w-full px-3 py-2 border border-slate-200 rounded bg-white" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}><option value="Housing">Housing</option><option value="Education">Education</option><option value="Food">Food</option><option value="Financial">Financial</option></select></div>
                <div className="space-y-1"><label className="text-[11px] font-bold text-slate-500 uppercase">Vacancies</label><input required type="number" className="w-full px-3 py-2 border border-slate-200 rounded" value={formData.vacancies} onChange={e => setFormData({...formData, vacancies: parseInt(e.target.value)})} /></div>
              </div>
              <div className="space-y-1"><label className="text-[11px] font-bold text-slate-500 uppercase">Description</label><textarea required rows={5} className="w-full px-3 py-2 border border-slate-200 rounded resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea></div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 shrink-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-teal-700 text-white text-sm font-bold rounded hover:bg-teal-800">Update Details</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {managingRequest && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2 text-[#1E293B]"><span className="material-symbols-outlined">rule</span><h2 className="text-lg font-bold">Manage Application</h2></div>
              <button onClick={() => setManagingRequest(null)} className="text-slate-400 hover:text-red-500"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="p-6 space-y-6">
              <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Applicant</p><p className="font-bold text-[#1E293B] text-lg">{managingRequest.userName}</p><p className="text-sm text-slate-500 font-medium">Submitted: {formatDate(managingRequest.createdAt)}</p></div>
              <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Current Status</p><span className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wide bg-slate-100 text-slate-600">{managingRequest.status}</span></div>
            </div>
            <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-3">
              <button onClick={() => handleRequestStatusChange('REJECTED')} disabled={managingRequest.status === 'REJECTED'} className="flex-1 px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-bold rounded hover:bg-red-50 disabled:opacity-50">Deny Application</button>
              <button onClick={() => handleRequestStatusChange('APPROVED')} disabled={managingRequest.status === 'APPROVED'} className="flex-1 px-4 py-2 bg-teal-700 text-white text-sm font-bold rounded hover:bg-teal-800 disabled:opacity-50">Approve Application</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}