// src/pages/GrantDetail.tsx
import { useState, useEffect } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para la edición
  const [isModalOpen, setIsModalOpen] = useState(false);
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
        // Preparamos el formulario con los datos actuales
        setFormData({
          name: data.name,
          type: data.type,
          description: data.description,
          vacancies: data.vacancies,
          internalCode: data.internalCode
        });
      }
    } catch (error) {
      console.error("Error fetching details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGrantDetails();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
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
        fetchGrantDetails(); // Refrescar los datos en pantalla
      }
    } catch (error) {
      console.error("Error updating grant:", error);
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
      console.error("Error closing program:", error);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!grant) return <div className="p-8 text-center text-error">Program not found.</div>;

  return (
    <div className="space-y-8">
      {/* Header & Main Info */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${grant.available ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'}`}>
                {grant.available ? '● Active' : '○ Closed'}
              </span>
              <span className="text-outline font-mono text-sm">{grant.internalCode}</span>
            </div>
            
            {/* Título con Lápiz de Edición */}
            <div className="flex items-center gap-4">
              <h2 className="text-4xl font-bold text-primary">{grant.name}</h2>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-on-primary transition-all cursor-pointer shadow-sm"
                title="Edit Grant Info"
              >
                <span className="material-symbols-outlined text-[20px]">edit</span>
              </button>
            </div>

            <p className="text-lg text-on-surface-variant max-w-3xl leading-relaxed">
              {grant.description}
            </p>

            <div className="flex gap-8 pt-4">
              <div>
                <p className="text-[10px] uppercase font-bold text-outline">Category</p>
                <p className="font-bold text-on-surface">{grant.type}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-outline">Vacancies</p>
                <p className="font-bold text-on-surface">{grant.vacancies} Positions</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto">
            <button onClick={() => navigate('/admin/programs')} className="px-6 py-2 border border-outline-variant rounded-lg font-bold hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2 cursor-pointer">
              <span className="material-symbols-outlined">arrow_back</span> Back to Catalog
            </button>
            {grant.available && (
              <button onClick={handleCloseProgram} className="px-6 py-2 bg-[#ba1a1a] text-white rounded-lg font-bold hover:bg-[#93000a] transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer">
                <span className="material-symbols-outlined">lock</span> Close Program
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
          <h3 className="text-xl font-bold text-on-surface">Recent Applications</h3>
          <span className="text-sm font-bold text-on-surface-variant">{grant.grantRequests?.length || 0} total requests</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-outline-variant">
                <th className="px-6 py-3 text-sm font-bold text-on-surface-variant">Applicant</th>
                <th className="px-6 py-3 text-sm font-bold text-on-surface-variant">Submission Date</th>
                <th className="px-6 py-3 text-sm font-bold text-on-surface-variant">Status</th>
                <th className="px-6 py-3 text-sm font-bold text-on-surface-variant text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-on-surface">
              {grant.grantRequests?.map((req) => (
                <tr key={req.id} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs uppercase">{req.applicantName.charAt(0)}</div>
                      <span className="font-medium">{req.applicantName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-on-surface-variant">{req.submissionDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${req.status === 'Approved' ? 'bg-secondary-container text-on-secondary-container' : req.status === 'Denied' ? 'bg-error-container text-on-error-container' : 'bg-surface-dim text-on-surface'}`}>
                      <span className="material-symbols-outlined text-[16px]">{req.status === 'Approved' ? 'check_circle' : req.status === 'Denied' ? 'cancel' : 'hourglass_empty'}</span>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container-high transition-colors cursor-pointer">
                      <span className="material-symbols-outlined">visibility</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Edición */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#121c28]/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h2 className="text-2xl font-bold text-on-surface">Edit Grant Information</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-error cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-bold text-on-surface mb-1">Grant Name</label>
                <input required type="text" className="w-full px-4 py-2 border border-outline-variant rounded-md bg-surface" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-1">Category</label>
                  <select className="w-full px-4 py-2 border border-outline-variant rounded-md bg-surface" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="Housing">Housing</option>
                    <option value="Education">Education</option>
                    <option value="Food">Food</option>
                    <option value="Financial">Financial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-1">Vacancies</label>
                  <input required type="number" className="w-full px-4 py-2 border border-outline-variant rounded-md bg-surface" value={formData.vacancies} onChange={e => setFormData({...formData, vacancies: parseInt(e.target.value)})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface mb-1">Description</label>
                <textarea required rows={5} className="w-full px-4 py-2 border border-outline-variant rounded-md bg-surface resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-bold text-on-surface-variant hover:bg-surface-container-low rounded-lg">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-primary text-on-primary font-bold rounded-lg hover:bg-primary-container transition-colors">Update Details</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}