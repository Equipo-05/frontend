import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8086/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials');
      }
      
      localStorage.setItem('sas_token', data.token);
      localStorage.setItem('sas_user', JSON.stringify({
        name: data.name,
        role: data.role,
        email: data.email
      }));

      // AQUI ESTÁ LA CORRECCIÓN CLAVE
      if (data.role === 'ADMIN' || data.role === 'MANAGER') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 p-4 font-['Inter',_sans-serif]">
      <div className="w-full max-w-md bg-white rounded-md border border-slate-200 p-8 shadow-sm">
        <div className="text-center mb-8">
            <div className="w-12 h-12 bg-[#1E293B] rounded mx-auto flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-white text-2xl">shield</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#1E293B] mb-1">SAS App</h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Aid Management</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="text-red-700 text-center text-xs font-bold p-3 bg-red-50 rounded border border-red-100">
              {error}
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-500 uppercase">ID Number (DNI)</label>
            <input 
                className="w-full px-3 py-2.5 border border-slate-200 rounded outline-none text-slate-700 font-medium focus:border-teal-500 transition-colors"
                type="text" 
                value={dni} 
                onChange={(e) => setDni(e.target.value)} 
                required 
                placeholder="Enter your ID"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-500 uppercase">Password</label>
            <input 
                className="w-full px-3 py-2.5 border border-slate-200 rounded outline-none text-slate-700 font-medium focus:border-teal-500 transition-colors"
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit"
            className="w-full mt-6 bg-[#1E293B] text-white py-2.5 rounded font-bold hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}