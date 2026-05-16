import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Estados para Login
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');

  // Estados para Registro
  const [regData, setRegData] = useState({
    name: '', lastName: '', dni: '', email: '', phone: '', birthDate: '', password: '', annualSalary: ''
  });

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8086/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni, password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Invalid credentials');
      
      localStorage.setItem('sas_token', data.token);
      localStorage.setItem('sas_user', JSON.stringify({
        name: data.name, role: data.role, email: data.email
      }));

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

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Formateamos el payload. Forzamos el rol a USER siempre.
    const payload = {
      ...regData,
      role: 'USER',
      annualSalary: regData.annualSalary ? parseFloat(regData.annualSalary) : 0
    };

    try {
      const response = await fetch('http://localhost:8086/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.errors 
          ? Object.values(errorData.errors)[0] as string 
          : (errorData.message || 'Registration failed');
        throw new Error(errorMessage);
      }
      
      // Si el registro es un éxito, volvemos a la vista de login
      setSuccessMsg('Account created successfully! Please sign in.');
      setIsRegistering(false);
      setDni(regData.dni); // Autocompletamos el DNI para que le sea más fácil loguearse
      setPassword('');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setSuccessMsg('');
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 p-4 font-['Inter',_sans-serif]">
      <div className={`w-full bg-white rounded-md border border-slate-200 p-8 shadow-sm transition-all duration-300 ${isRegistering ? 'max-w-2xl' : 'max-w-md'}`}>
        
        <div className="text-center mb-8">
            <div className="w-12 h-12 bg-[#1E293B] rounded mx-auto flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-white text-2xl">shield</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#1E293B] mb-1">SAS App</h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              {isRegistering ? 'Citizen Registration' : 'Aid Management'}
            </p>
        </div>
        
        {error && (
          <div className="mb-6 text-red-700 text-center text-xs font-bold p-3 bg-red-50 rounded border border-red-100">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 text-teal-700 text-center text-xs font-bold p-3 bg-teal-50 rounded border border-teal-100 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            {successMsg}
          </div>
        )}

        {!isRegistering ? (
          /* ================= LOGIN FORM ================= */
          <form onSubmit={handleLogin} className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase">ID Number (DNI)</label>
              <input 
                  className="w-full px-3 py-2.5 border border-slate-200 rounded outline-none text-slate-700 font-medium focus:border-teal-500 transition-colors"
                  type="text" value={dni} onChange={(e) => setDni(e.target.value)} required placeholder="Enter your ID"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Password</label>
              <input 
                  className="w-full px-3 py-2.5 border border-slate-200 rounded outline-none text-slate-700 font-medium focus:border-teal-500 transition-colors"
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={isLoading} className="w-full mt-6 bg-[#1E293B] text-white py-2.5 rounded font-bold hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50 cursor-pointer">
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        ) : (
          /* ================= REGISTER FORM ================= */
          <form onSubmit={handleRegister} className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">First Name</label>
                <input className="w-full px-3 py-2 border border-slate-200 rounded outline-none focus:border-teal-500" type="text" value={regData.name} onChange={(e) => setRegData({...regData, name: e.target.value})} required />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Last Name</label>
                <input className="w-full px-3 py-2 border border-slate-200 rounded outline-none focus:border-teal-500" type="text" value={regData.lastName} onChange={(e) => setRegData({...regData, lastName: e.target.value})} required />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">DNI</label>
                <input className="w-full px-3 py-2 border border-slate-200 rounded outline-none focus:border-teal-500" type="text" value={regData.dni} onChange={(e) => setRegData({...regData, dni: e.target.value})} required placeholder="12345678Z" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Birth Date</label>
                <input className="w-full px-3 py-2 border border-slate-200 rounded outline-none focus:border-teal-500" type="date" value={regData.birthDate} onChange={(e) => setRegData({...regData, birthDate: e.target.value})} required />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Email</label>
                <input className="w-full px-3 py-2 border border-slate-200 rounded outline-none focus:border-teal-500" type="email" value={regData.email} onChange={(e) => setRegData({...regData, email: e.target.value})} required />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Phone</label>
                <input className="w-full px-3 py-2 border border-slate-200 rounded outline-none focus:border-teal-500" type="tel" value={regData.phone} onChange={(e) => setRegData({...regData, phone: e.target.value})} required />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Annual Salary (€)</label>
                <input className="w-full px-3 py-2 border border-slate-200 rounded outline-none focus:border-teal-500" type="number" value={regData.annualSalary} onChange={(e) => setRegData({...regData, annualSalary: e.target.value})} required />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Password</label>
                <input className="w-full px-3 py-2 border border-slate-200 rounded outline-none focus:border-teal-500" type="password" value={regData.password} onChange={(e) => setRegData({...regData, password: e.target.value})} required placeholder="Min 8 chars, 1 Upper, 1 Number, 1 Symbol" />
              </div>
            </div>
            
            <button type="submit" disabled={isLoading} className="w-full mt-6 bg-teal-700 text-white py-2.5 rounded font-bold hover:bg-teal-800 transition-all shadow-sm disabled:opacity-50 cursor-pointer">
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        {/* TOGGLE BUTTON */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500 font-medium">
            {isRegistering ? "Already have an account?" : "Don't have an account yet?"}
          </p>
          <button 
            onClick={toggleMode}
            className="mt-2 text-sm font-bold text-teal-700 hover:text-teal-800 hover:underline cursor-pointer"
          >
            {isRegistering ? "Sign in here" : "Register as a Citizen"}
          </button>
        </div>

      </div>
    </div>
  );
}