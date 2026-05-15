import React, { useState, useEffect } from 'react';
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    type: 'Education',
    description: '',
    vacancies: 1,
    internalCode: ''
  });

  const API_URL = 'http://localhost:8086/api/v1/grants';

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
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

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

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
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
      console.error(error);
    }
  };

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
      console.error(error);
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

  const filteredPrograms = programs.filter(p => {
    const matchesFilter = filter === 'All' || p.type.toLowerCase() === filter.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.internalCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#1E293B]">Assistance Programs Catalog</h2>
          <p className="text-slate-500 text-sm font-medium">Explore and manage the assistance programs available to citizens.</p>
        </div>
        <button 
          onClick={() => { setIsEditing(false); setIsModalOpen(true); }}
          className="px-5 py-2.5 bg-[#1E293B] text-white font-bold rounded flex items-center gap-2 hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">add</span> Create Program
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 border border-slate-200 rounded-md shadow-sm">
        <div className="flex flex-wrap gap-2">
          {['All', 'Housing', 'Education', 'Food', 'Financial'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded text-xs font-bold flex items-center gap-2 border transition-colors cursor-pointer ${
                filter === f 
                  ? 'bg-teal-50 text-teal-700 border-teal-200' 
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f !== 'All' && <span className="material-symbols-outlined text-[16px]">{getTypeIcon(f)}</span>}
              {f}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">search</span>
          <input 
            type="text" 
            placeholder="Search programs..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded outline-none focus:border-teal-500 transition-all text-sm font-medium text-slate-700 bg-slate-50"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500 font-bold">Loading catalog...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {filteredPrograms.map(program => (
            <div key={program.id} className="bg-white border border-slate-200 rounded-md overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
              <div className="h-24 bg-slate-50 relative flex items-center justify-center border-b border-slate-100">
                <span className="material-symbols-outlined text-5xl text-slate-200">{getTypeIcon(program.type)}</span>
                <span className="absolute top-3 left-3 bg-white text-slate-600 font-bold text-[10px] px-2 py-1 rounded shadow-sm flex items-center gap-1 border border-slate-200 uppercase tracking-wide">
                  <span className="material-symbols-outlined text-[14px] text-teal-600">{getTypeIcon(program.type)}</span>
                  {program.type}
                </span>
                {!program.available && (
                   <span className="absolute top-3 right-3 bg-red-50 text-red-600 font-bold text-[10px] px-2 py-1 rounded shadow-sm border border-red-100 uppercase tracking-wide">
                   Closed
                 </span>
                )}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-[#1E293B] mb-2 leading-tight line-clamp-2" title={program.name}>{program.name}</h3>
                <p className="text-xs text-slate-500 flex-1 mb-6 line-clamp-3 font-medium">{program.description}</p>
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Vacancies</span>
                    <span className="text-sm font-extrabold text-teal-700">{program.vacancies} Left</span>
                  </div>
                  <button 
                    onClick={() => navigate(`/admin/programs/${program.id}`)}
                    className="bg-slate-100 text-slate-700 font-bold text-xs px-4 py-2 rounded hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Manage
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredPrograms.length === 0 && (
             <div className="col-span-full py-12 text-center text-slate-500 font-bold">No programs match your search criteria.</div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#1E293B]">
                {isEditing ? 'Edit Assistance Program' : 'New Assistance Program'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-red-500 cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Program Name</label>
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
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Internal Code</label>
                  <input required type="text" className="w-full px-3 py-2 border border-slate-200 rounded focus:border-teal-500 outline-none transition-all font-mono text-sm" value={formData.internalCode} onChange={e => setFormData({...formData, internalCode: e.target.value})} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Available Vacancies</label>
                <input required type="number" min="1" className="w-full px-3 py-2 border border-slate-200 rounded focus:border-teal-500 outline-none transition-all" value={formData.vacancies} onChange={e => setFormData({...formData, vacancies: parseInt(e.target.value)})} />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Description</label>
                <textarea required rows={4} className="w-full px-3 py-2 border border-slate-200 rounded focus:border-teal-500 outline-none transition-all resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>

              <div className="pt-4 flex justify-between gap-3 border-t border-slate-100">
                {isEditing ? (
                  <button 
                    type="button" 
                    onClick={handleDelete}
                    className="px-4 py-2 font-bold text-red-600 hover:bg-red-50 rounded transition-colors flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span> Delete
                  </button>
                ) : <div />}
                
                <div className="flex gap-3">
                  <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-2 bg-teal-700 text-white text-sm font-bold rounded hover:bg-teal-800 transition-all cursor-pointer">
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