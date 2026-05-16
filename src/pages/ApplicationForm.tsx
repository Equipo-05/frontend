import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Grant {
  id: number;
  name: string;
  type: string;
  description: string;
  vacancies: number;
  internalCode: string;
}

export default function ApplicationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [grant, setGrant] = useState<Grant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const user = JSON.parse(localStorage.getItem('sas_user') || '{}');
  const token = localStorage.getItem('sas_token');

  useEffect(() => {
    const fetchGrant = async () => {
      try {
        const response = await fetch(`http://localhost:8086/api/v1/grants/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setGrant(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGrant();
  }, [id, token]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setServerError(null);

    try {
      const response = await fetch('http://localhost:8086/api/v1/requests', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(grant?.id) 
      });

      if (response.ok) {
        navigate('/dashboard'); 
      } else {
        setServerError('Failed to submit application. You may have already applied for this program.');
      }
    } catch (error) {
      setServerError('Connection error with the server.');
    } finally {
      setIsSubmitting(false);
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

  if (isLoading) return <div className="p-12 text-center text-slate-500 font-bold">Loading application...</div>;
  if (!grant) return <div className="p-12 text-center text-red-600 font-bold">Program not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm transition-colors cursor-pointer"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back
      </button>

      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
        <div className="bg-slate-50 p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center gap-6">
           <div className="w-16 h-16 bg-[#1E293B] rounded flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-3xl text-white">{getTypeIcon(grant.type)}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest bg-teal-50 px-2 py-1 rounded border border-teal-100">{grant.type}</span>
            <h1 className="text-2xl font-extrabold text-[#1E293B] mt-2">{grant.name}</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">Code: {grant.internalCode}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          
          {serverError && (
            <div className="bg-red-50 border border-red-100 p-4 rounded text-red-700 text-sm font-medium flex items-start gap-3">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <p>{serverError}</p>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-bold text-[#1E293B] text-lg border-b border-slate-100 pb-2">Program Description</h3>
            <p className="text-slate-600 text-sm leading-relaxed font-medium">
              {grant.description}
            </p>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="font-bold text-[#1E293B] text-lg border-b border-slate-100 pb-2">Applicant Information</h3>
            <p className="text-xs text-slate-500 font-medium mb-4">Please review your registered details. The system will automatically link this information to your application.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                <input 
                  readOnly 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded text-slate-700 font-bold outline-none cursor-not-allowed" 
                  value={user.name || ''} 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                <input 
                  readOnly 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded text-slate-700 font-bold outline-none cursor-not-allowed" 
                  value={user.email || ''} 
                />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex justify-end">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full md:w-auto px-8 py-3 bg-teal-700 text-white font-bold rounded hover:bg-teal-800 transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">send</span> Confirm & Apply
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}