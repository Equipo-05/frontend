// src/pages/BeneficiaryMgmt.tsx
import { useState, useEffect } from 'react';

interface User {
  id: number;
  dni: string;
  name: string;
  email: string;
  role: string;
}

export default function BeneficiaryMgmt() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estado para el formulario de nuevo usuario
  const [formData, setFormData] = useState({
    dni: '',
    name: '',
    lastname: '',
    email: '',
    password: '',
    role: 'USER',
    phone: '',
    birthDate: '',
    annualSalary: '',
    active: ''
  });

  const token = localStorage.getItem('sas_token');

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8086/api/v2/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8086/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsModalOpen(false);
        setFormData({ dni: '', name: '', lastname: '', email: '', password: '', role: 'USER', phone: '', birthDate:'', annualSalary: '', active: ''});
        fetchUsers(); // Recargamos la lista
      }
    } catch (error) {
      console.error("Error registering user:", error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-on-surface mb-1">Beneficiary Management</h2>
          <p className="text-on-surface-variant">View and register citizens in the SAS system.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-2 rounded-lg bg-primary text-on-primary font-bold hover:bg-primary-container transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <span className="material-symbols-outlined">person_add</span> Register Beneficiary
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="px-6 py-4 text-sm font-bold text-on-surface-variant">Name</th>
                <th className="px-6 py-4 text-sm font-bold text-on-surface-variant">DNI / ID</th>
                <th className="px-6 py-4 text-sm font-bold text-on-surface-variant">Email</th>
                <th className="px-6 py-4 text-sm font-bold text-on-surface-variant">Role</th>
                <th className="px-6 py-4 text-sm font-bold text-on-surface-variant text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-on-surface">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center">Loading users...</td></tr>
              ) : users.map((u) => (
                <tr key={u.id} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs uppercase">
                        {u.name.charAt(0)}
                      </div>
                      {u.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-on-surface-variant font-mono text-sm">{u.dni}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-on-surface-variant">{u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${u.role === 'ADMIN' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-dim text-on-surface'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container-high cursor-pointer transition-colors">
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button className="p-2 text-on-surface-variant hover:text-error rounded-full hover:bg-error-container/20 cursor-pointer transition-colors">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#121c28]/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h2 className="text-xl font-bold">Register New User</h2>
              <button onClick={() => setIsModalOpen(false)} className="material-symbols-outlined cursor-pointer hover:text-error">close</button>
            </div>
            <form onSubmit={handleRegister} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Name</label>
                <input required className="w-full px-4 py-2 border border-outline-variant rounded-md" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Last Name</label>
                <input required className="w-full px-4 py-2 border border-outline-variant rounded-md" value={formData.lastname} onChange={e => setFormData({...formData, lastname: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">DNI (ID Number)</label>
                <input required className="w-full px-4 py-2 border border-outline-variant rounded-md" value={formData.dni} onChange={e => setFormData({...formData, dni: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Email Address</label>
                <input required type="email" className="w-full px-4 py-2 border border-outline-variant rounded-md" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Phone</label>
                <input required type="email" className="w-full px-4 py-2 border border-outline-variant rounded-md" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Birthday</label>
                <input required type="email" className="w-full px-4 py-2 border border-outline-variant rounded-md" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Initial Password</label>
                <input required type="password" className="w-full px-4 py-2 border border-outline-variant rounded-md" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-bold text-on-surface-variant">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-primary text-on-primary font-bold rounded-lg hover:bg-primary-container">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}