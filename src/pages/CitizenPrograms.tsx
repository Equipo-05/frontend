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
}

export default function CitizenPrograms() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<Grant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const API_URL = 'http://localhost:8086/api/v1/grants';

  useEffect(() => {
    const fetchPrograms = async () => {
      const token = localStorage.getItem('sas_token');
      try {
        const response = await fetch(API_URL, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setPrograms(data.filter((p: Grant) => p.available));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrograms();
  }, []);

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
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#1E293B]">Available Programs</h2>
          <p className="text-slate-500 text-sm font-medium">Browse and apply for social assistance programs.</p>
        </div>
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
        <div className="text-center py-12 text-slate-500 font-bold">Loading available programs...</div>
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
                    onClick={() => navigate(`/apply/${program.id}`)}
                    className="bg-[#1E293B] text-white font-bold text-xs px-4 py-2 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Apply
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
    </div>
  );
}