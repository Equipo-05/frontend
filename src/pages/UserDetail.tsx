import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface UserData {
  name: string;
  lastName: string;
  dni: string;
  email: string;
  phone: string;
  birthDate: string;
  role: string;
  active: boolean;
  annualSalary: string;
}

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<UserData>({
    name: '', 
    lastName: '', 
    dni: '', 
    email: '', 
    phone: '', 
    birthDate: '', 
    role: 'USER', 
    active: false, 
    annualSalary: ''
  });

  const token = localStorage.getItem('sas_token');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:8086/api/v2/user/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setFormData({
            name: data.name || '',
            lastName: data.lastName || '',
            dni: data.dni || '',
            email: data.email || '',
            phone: data.phone || '',
            birthDate: data.birthDate ? data.birthDate.substring(0, 10) : '',
            role: data.role || 'USER',
            active: data.active === true,
            annualSalary: data.annualSalary?.toString() || ''
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [id, token]);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerErrors([]);

    const payload = {
      ...formData,
      annualSalary: formData.annualSalary ? parseFloat(formData.annualSalary) : null
    };

    try {
      const response = await fetch(`http://localhost:8086/api/v1/user/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        navigate('/admin/users');
      } else {
        const errorData = await response.json();
        setServerErrors(errorData.errors ? Object.entries(errorData.errors).map(([f, m]) => `${f}: ${m}`) : [errorData.message]);
      }
    } catch (error) {
      setServerErrors(['Server connection error']);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (isLoading) return <div className="p-12 text-center text-slate-500 font-bold">Loading user profile...</div>;

  return (
    <form onSubmit={handleUpdate} className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      {serverErrors.length > 0 && (
        <div className="bg-red-50 border border-red-100 p-4 rounded text-red-700 text-xs font-medium">
          <ul className="list-disc pl-4 space-y-1">
            {serverErrors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full md:w-auto">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-slate-200 shadow-md flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-4xl text-slate-400">person</span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1E293B]">
                {formData.name} {formData.lastName}
              </h1>
              <div className="flex gap-2">
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wide ${formData.active ? 'bg-teal-100 text-teal-700' : 'bg-red-100 text-red-700'}`}>
                  {formData.active ? 'Active' : 'Inactive'}
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wide ${
                  formData.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                  formData.role === 'MANAGER' ? 'bg-blue-100 text-blue-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {formData.role}
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-500 font-medium">User ID: #{formData.dni}</p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            type="button" 
            onClick={() => navigate('/admin/users')} 
            className="flex-1 px-6 py-2 border border-slate-300 text-slate-700 font-bold rounded hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="flex-1 px-6 py-2 bg-[#1E293B] text-white font-bold rounded hover:bg-slate-800 shadow-sm cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        <div className="md:col-span-8 bg-white border border-slate-200 rounded-md p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-[#1E293B]">
            <span className="material-symbols-outlined">person</span>
            <h3 className="font-bold text-lg">Personal Data</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">First Name</label>
              <input 
                name="name" 
                required 
                className="w-full bg-slate-50 border border-slate-200 rounded p-3 outline-none text-slate-700 focus:border-teal-500" 
                value={formData.name} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Last Name</label>
              <input 
                name="lastName" 
                required 
                className="w-full bg-slate-50 border border-slate-200 rounded p-3 outline-none text-slate-700 focus:border-teal-500" 
                value={formData.lastName} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">ID (DNI)</label>
              <input 
                name="dni" 
                required 
                className="w-full bg-slate-50 border border-slate-200 rounded p-3 outline-none text-slate-700 focus:border-teal-500" 
                value={formData.dni} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Birth Date</label>
              <input 
                type="date" 
                name="birthDate" 
                required 
                className="w-full bg-slate-50 border border-slate-200 rounded p-3 outline-none text-slate-700 focus:border-teal-500" 
                value={formData.birthDate} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Email</label>
              <input 
                type="email" 
                name="email" 
                required 
                className="w-full bg-slate-50 border border-slate-200 rounded p-3 outline-none text-slate-700 focus:border-teal-500" 
                value={formData.email} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Phone</label>
              <input 
                type="tel" 
                name="phone" 
                required 
                className="w-full bg-slate-50 border border-slate-200 rounded p-3 outline-none text-slate-700 focus:border-teal-500" 
                value={formData.phone} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-bold text-slate-700">Annual Salary (€)</label>
              <input 
                type="number" 
                name="annualSalary" 
                required 
                className="w-full bg-slate-50 border border-slate-200 rounded p-3 outline-none text-slate-700 focus:border-teal-500" 
                value={formData.annualSalary} 
                onChange={handleInputChange} 
              />
            </div>
          </div>
        </div>

        <div className="md:col-span-4 bg-white border border-slate-200 rounded-md p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-[#1E293B]">
            <span className="material-symbols-outlined">security</span>
            <h3 className="font-bold text-lg">Access and Role</h3>
          </div>
          
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#1E293B]">Account Status</p>
              <p className="text-[10px] text-slate-500">{formData.active ? 'Access enabled' : 'Access disabled'}</p>
            </div>
            <button 
              type="button" 
              onClick={() => setFormData(p => ({ ...p, active: !p.active }))} 
              className={`w-12 h-6 rounded-full transition-all relative cursor-pointer ${formData.active ? 'bg-[#0D9488]' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.active ? 'right-1' : 'left-1'}`} />
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">System Role</label>
            <select 
              name="role" 
              value={formData.role} 
              onChange={handleInputChange} 
              className="w-full bg-white border border-slate-200 rounded p-3 font-bold text-[#1E293B] outline-none cursor-pointer focus:border-teal-500"
            >
              <option value="USER">User (Beneficiary)</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Derived Permissions</p>
            <div className="flex flex-wrap gap-2">
              {formData.role === 'ADMIN' ? (
                <>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded">Manage Grants</span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded">Manage Users</span>
                </>
              ) : formData.role === 'MANAGER' ? (
                <>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded">Manage Grants</span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded">Manage Applications</span>
                </>
              ) : (
                <>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded">View Programs</span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded">Submit Applications</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}