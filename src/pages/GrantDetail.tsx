import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Request {
  id: number;
  applicantName: string;
  submissionDate: string;
  status: string;
}

interface Grant {
  id: number;
  name: string;
  type: string;
  description: string;
  vacancies: number;
  available: boolean;
  internalCode: string;
  grantRequests: Request[];
}

export default function GrantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [grant, setGrant] = useState<Grant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    vacancies: 0,
    internalCode: ''
  });

  const API_URL = `http://localhost:8086/api/v1/grants/${id}`;
  const token = localStorage.getItem('sas_token');

  const fetchGrantDetails = async () => {
    try {
      const response = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setGrant(data);
        setFormData({
          name: data.name,
          type: data.type,
          description: data.description,
          vacancies: data.vacancies,
          internalCode: data.internalCode
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGrantDetails();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, available: grant?.available })
      });

      if (response.ok) {
        setIsModalOpen(false);
        fetchGrantDetails(); 
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCloseProgram = async () => {
    if (!grant) return;
    if (!window.confirm("Are you sure you want to close this program?")) return;

    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...grant, available: false })
      });

      if (response.ok) {
        fetchGrantDetails();
      }
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

  if (isLoading) return <div className="p-12 text-center text-slate-500 font-bold">Loading details...</div>;
  if (!grant) return <div className="p-12 text-center text-red-600 font-bold">Program not found.</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-[#1E293B] rounded-lg flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-4xl text-white">{getTypeIcon(grant.type)}</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wide ${grant.available ? 'bg-teal-100 text-teal-700' : 'bg-red-100 text-red-700'}`}>
                {grant.available ? 'Active' : 'Closed'}
              </span>
              <span className="text-slate-400 font-mono text-xs font-bold">{grant.internalCode}</span>
            </div>
            
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-extrabold text-[#1E293B]">{grant.name}</h2>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-teal-600 transition-all cursor-pointer shadow-sm"
                title="Edit Grant Info"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/admin/programs')} 
            className="px-6 py-2 border border-slate-300 text-slate-700 font-bold rounded hover:bg-slate-50 transition-all cursor-pointer"
          >
            Back to Catalog
          </button>
          {grant.available && (
            <button 
              onClick={handleCloseProgram} 
              className="px-6 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition-all shadow-sm cursor-pointer flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">lock</span> Close Program
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 md:col-span-8 space-y-8">
          
          <div className="bg-white border border-slate-200 rounded-md p-8 shadow-sm">
             <div className="flex items-center gap-3 mb-4 text-[#1E293B]">
              <span className="material-symbols-outlined">info</span>
              <h3 className="font-bold text-lg">Program Details</h3>
            </div>
            <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">
              {grant.description}
            </p>
            <div className="flex gap-12 pt-6 border-t border-slate-100">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Category</p>
                <p className="font-bold text-[#1E293B] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-teal-600">{getTypeIcon(grant.type)}</span>
                  {grant.type}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Available Vacancies</p>
                <p className="font-bold text-[#1E293B]">{grant.vacancies} Positions</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-2 text-[#1E293B]">
                <span className="material-symbols-outlined">assignment</span>
                <h3 className="font-bold text-md">Recent Applications</h3>
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{grant.grantRequests?.length || 0} Total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Applicant</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  {grant.grantRequests?.map((req) => (
                    <tr key={req.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs uppercase">{req.applicantName.charAt(0)}</div>
                          <span className="font-bold text-sm text-[#1E293B]">{req.applicantName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-500">{req.submissionDate}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${req.status === 'Approved' ? 'bg-teal-100 text-teal-700' : req.status === 'Denied' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                          <span className="material-symbols-outlined text-[14px]">{req.status === 'Approved' ? 'check_circle' : req.status === 'Denied' ? 'cancel' : 'hourglass_empty'}</span>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-slate-400 hover:text-teal-600 rounded transition-colors cursor-pointer">
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!grant.grantRequests || grant.grantRequests.length === 0) && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm font-medium">
                        No applications received for this program yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="col-span-12 md:col-span-4">
             {/* Future metrics or side info can go here */}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#1E293B]">Edit Grant Information</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 overflow-y-auto space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Grant Name</label>
                <input required type="text" className="w-full px-3 py-2 border border-slate-200 rounded focus:border-teal-500 outline-none transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Category</label>
                  <select className="w-full px-3 py-2 border border-slate-200 rounded focus:border-teal-500 outline-none transition-all cursor-pointer bg-white" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="Housing">Housing</option>
                    <option value="Education">Education</option>
                    <option value="Food">Food</option>
                    <option value="Financial">Financial</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Vacancies</label>
                  <input required type="number" className="w-full px-3 py-2 border border-slate-200 rounded focus:border-teal-500 outline-none transition-all" value={formData.vacancies} onChange={e => setFormData({...formData, vacancies: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Description</label>
                <textarea required rows={5} className="w-full px-3 py-2 border border-slate-200 rounded focus:border-teal-500 outline-none transition-all resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 cursor-pointer">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-teal-700 text-white text-sm font-bold rounded hover:bg-teal-800 transition-all cursor-pointer">Update Details</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}