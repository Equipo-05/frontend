import { useState, useEffect, type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';

interface User { 
  id: number; 
  dni: string; 
  name: string; 
  lastName: string; 
  email: string; 
  phone: string; 
  role: string; 
}

export default function BeneficiaryMgmt(): ReactElement {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    dni: '', 
    name: '', 
    lastName: '', 
    email: '', 
    phone: '', 
    birthDate: '', 
    password: '', 
    role: 'USER', 
    annualSalary: ''
  });

  const token = localStorage.getItem('sas_token');

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8086/api/v2/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setUsers(await response.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    fetchUsers(); 
  }, []);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerErrors([]);
    try {
      const response = await fetch('http://localhost:8086/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsModalOpen(false);
        setFormData({ dni: '', name: '', lastName: '', email: '', phone: '', birthDate: '', password: '', role: 'USER', annualSalary: '' });
        fetchUsers(); 
      } else {
        const errorData = await response.json();
        setServerErrors(errorData.errors ? Object.entries(errorData.errors).map(([f, m]) => `${f}: ${m}`) : [errorData.message]);
      }
    } catch (error) {
      setServerErrors(['Server connection error']);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#1E293B]">User Management</h2>
          <p className="text-slate-500 text-sm font-medium">Manage beneficiaries and system access levels.</p>
        </div>
        <button 
          onClick={() => { setServerErrors([]); setIsModalOpen(true); }} 
          className="w-full sm:w-auto px-5 py-2.5 bg-[#1E293B] text-white font-bold rounded flex items-center justify-center gap-2 hover:bg-slate-800 shadow-sm transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span> Register Beneficiary
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-md shadow-sm w-full overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Beneficiary</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">ID Number</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Contact</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Loading records...</td></tr>
              ) : users.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-teal-50 text-teal-700 rounded flex items-center justify-center font-bold text-sm uppercase shrink-0">
                        {u.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-[#1E293B] truncate">{u.name} {u.lastName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500 font-bold">{u.dni}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${
                      u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                      u.role === 'MANAGER' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => navigate(`/admin/users/${u.id}`)} 
                      className="p-2 text-slate-400 hover:text-teal-600 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined">edit_square</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h2 className="text-lg font-bold text-[#1E293B]">Register New User</h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 hover:text-red-500 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleRegister} className="p-4 sm:p-6 overflow-y-auto space-y-4">
              {serverErrors.length > 0 && (
                <div className="bg-red-50 border border-red-100 p-4 rounded text-red-700 text-xs font-medium">
                  <ul className="list-disc pl-4 space-y-1">
                    {serverErrors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">First Name</label>
                  <input 
                    required 
                    className="w-full px-3 py-2 border border-slate-200 rounded focus:border-teal-500 outline-none" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Last Name</label>
                  <input 
                    required 
                    className="w-full px-3 py-2 border border-slate-200 rounded focus:border-teal-500 outline-none" 
                    value={formData.lastName} 
                    onChange={e => setFormData({...formData, lastName: e.target.value})} 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">DNI</label>
                  <input 
                    required 
                    className="w-full px-3 py-2 border border-slate-200 rounded focus:border-teal-500 outline-none" 
                    value={formData.dni} 
                    onChange={e => setFormData({...formData, dni: e.target.value})} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Annual Salary</label>
                  <input 
                    required 
                    type="number" 
                    className="w-full px-3 py-2 border border-slate-200 rounded focus:border-teal-500 outline-none" 
                    value={formData.annualSalary} 
                    onChange={e => setFormData({...formData, annualSalary: e.target.value})} 
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Email Address</label>
                <input 
                  required 
                  type="email" 
                  className="w-full px-3 py-2 border border-slate-200 rounded focus:border-teal-500 outline-none" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Phone</label>
                  <input 
                    required 
                    type="tel" 
                    className="w-full px-3 py-2 border border-slate-200 rounded focus:border-teal-500 outline-none" 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Birth Date</label>
                  <input 
                    required 
                    type="date" 
                    className="w-full px-3 py-2 border border-slate-200 rounded focus:border-teal-500 outline-none" 
                    value={formData.birthDate} 
                    onChange={e => setFormData({...formData, birthDate: e.target.value})} 
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">System Role</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-200 rounded focus:border-teal-500 outline-none bg-white cursor-pointer" 
                  value={formData.role} 
                  onChange={e => setFormData({...formData, role: e.target.value})}
                >
                  <option value="USER">User (Beneficiary)</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
              
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Temporary Password</label>
                <input 
                  required 
                  type="password" 
                  title="password" 
                  className="w-full px-3 py-2 border border-slate-200 rounded focus:border-teal-500 outline-none" 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                />
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 shrink-0">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-teal-700 text-white text-sm font-bold rounded hover:bg-teal-800 cursor-pointer"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}