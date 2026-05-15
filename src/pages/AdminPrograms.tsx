import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Grant {
  id: number;
  name: string;
  type: string;
  description: string;
  vacancies: number;
  available: boolean;
  internalCode: string;
  createdAt: string;
}

export default function AdminPrograms() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<Grant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [filter, setFilter] = useState('All');

  // Estado del formulario
  const [formData, setFormData] = useState({
    name: '',
    type: 'Education',
    description: '',
    vacancies: 1,
    internalCode: ''
  });

  const API_URL = 'http://localhost:8086/api/v1/grants';

  // 1. OBTENER LISTADO (READ)
  const fetchPrograms = async () => {
    const token = localStorage.getItem('sas_token');
    try {
      const response = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPrograms(data);
      }
    } catch (error) {
      console.error("Error fetching grants:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  // 2. PREPARAR EDICIÓN (Cargar datos en el modal)
  const openEditModal = (program: Grant) => {
    setIsEditing(true);
    setCurrentId(program.id);
    setFormData({
      name: program.name,
      type: program.type,
      description: program.description,
      vacancies: program.vacancies,
      internalCode: program.internalCode
    });
    setIsModalOpen(true);
  };

  // 3. GUARDAR (CREATE o UPDATE)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('sas_token');
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `${API_URL}/${currentId}` : API_URL;

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        closeModal();
        fetchPrograms();
      }
    } catch (error) {
      console.error("Error saving grant:", error);
    }
  };

  // 4. ELIMINAR (DELETE)
  const handleDelete = async () => {
    if (!currentId) return;
    if (!window.confirm("Are you sure you want to delete this program? This action cannot be undone.")) return;

    const token = localStorage.getItem('sas_token');
    try {
      const response = await fetch(`${API_URL}/${currentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        closeModal();
        fetchPrograms();
      }
    } catch (error) {
      console.error("Error deleting grant:", error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ name: '', type: 'Education', description: '', vacancies: 1, internalCode: '' });
  };

  const getTypeIcon = (type: string) => {
    switch(type.toLowerCase()) {
      case 'housing': return 'home';
      case 'education': return 'school';
      case 'food': return 'restaurant';
      case 'financial': return 'payments';
      default: return 'inventory_2';
    }
  };

  const filteredPrograms = filter === 'All' ? programs : programs.filter(p => p.type.toLowerCase() === filter.toLowerCase());

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-on-surface mb-2">Assistance Programs Catalog</h2>
          <p className="text-on-surface-variant">Explore and manage the assistance programs available to citizens.</p>
        </div>
        <button 
          onClick={() => { setIsEditing(false); setIsModalOpen(true); }}
          className="px-6 py-2 rounded-lg bg-primary text-on-primary font-bold hover:bg-primary-container transition-colors flex items-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined">add</span> Create Program
        </button>
      </div>

      {/* Filtros con cursor pointer */}
      <div className="flex flex-wrap gap-2 border-b border-outline-variant pb-4">
        {['All', 'Housing', 'Education', 'Food', 'Financial'].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 border transition-colors cursor-pointer ${
              filter === f 
                ? 'bg-primary text-on-primary border-primary shadow-sm' 
                : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:bg-surface-container-low'
            }`}
          >
            {f !== 'All' && <span className="material-symbols-outlined text-[18px]">{getTypeIcon(f)}</span>}
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {filteredPrograms.map(program => (
            <div key={program.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              <div className="h-24 bg-surface-container-low relative flex items-center justify-center border-b border-outline-variant">
                <span className="material-symbols-outlined text-5xl text-secondary/30">{getTypeIcon(program.type)}</span>
                <span className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-md text-on-surface font-bold text-[10px] px-2 py-1 rounded-full flex items-center gap-1 border border-outline-variant/50">
                  <span className="material-symbols-outlined text-[14px] text-secondary">{getTypeIcon(program.type)}</span>
                  {program.type.toUpperCase()}
                </span>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-on-surface mb-2 leading-tight">{program.name}</h3>
                <p className="text-sm text-on-surface-variant flex-1 mb-6 line-clamp-3">{program.description}</p>
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-outline-variant">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-outline font-bold">Vacancies</span>
                    <span className="text-sm font-bold text-primary">{program.vacancies} Left</span>
                  </div>
                    <button 
                    onClick={() => navigate(`/admin/programs/${program.id}`)}
                    className="bg-primary text-on-primary font-bold text-xs px-4 py-2 rounded-lg hover:bg-primary-container transition-colors cursor-pointer"
                    >
                    Manage
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal CRUD (Create & Update) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#121c28]/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h2 className="text-2xl font-bold text-on-surface">
                {isEditing ? 'Edit Assistance Program' : 'New Assistance Program'}
              </h2>
              <button onClick={closeModal} className="text-on-surface-variant hover:text-error cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-bold text-on-surface mb-1">Program Name</label>
                <input required type="text" className="w-full px-4 py-2 border border-outline-variant rounded-md bg-surface" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-1">Category (Type)</label>
                  <select className="w-full px-4 py-2 border border-outline-variant rounded-md bg-surface cursor-pointer" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="Housing">Housing</option>
                    <option value="Education">Education</option>
                    <option value="Food">Food</option>
                    <option value="Financial">Financial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-1">Internal Code</label>
                  <input required type="text" className="w-full px-4 py-2 border border-outline-variant rounded-md bg-surface font-mono text-sm" value={formData.internalCode} onChange={e => setFormData({...formData, internalCode: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-on-surface mb-1">Available Vacancies</label>
                <input required type="number" min="1" className="w-full px-4 py-2 border border-outline-variant rounded-md bg-surface" value={formData.vacancies} onChange={e => setFormData({...formData, vacancies: parseInt(e.target.value)})} />
              </div>

              <div>
                <label className="block text-sm font-bold text-on-surface mb-1">Description</label>
                <textarea required rows={4} className="w-full px-4 py-2 border border-outline-variant rounded-md bg-surface resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>

              <div className="pt-4 flex justify-between gap-3">
                {isEditing ? (
                  <button 
                    type="button" 
                    onClick={handleDelete}
                    className="px-4 py-2 font-bold text-error hover:bg-error-container/20 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined">delete</span> Delete
                  </button>
                ) : <div />}
                
                <div className="flex gap-3">
                  <button type="button" onClick={closeModal} className="px-4 py-2 font-bold text-on-surface-variant hover:bg-surface-container-low rounded-lg cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-2 bg-primary text-on-primary font-bold rounded-lg hover:bg-primary-container transition-colors cursor-pointer">
                    {isEditing ? 'Update Program' : 'Save Program'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}