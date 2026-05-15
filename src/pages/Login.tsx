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

      if (data.role === 'ADMIN') {
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-xl border border-outline-variant p-8 shadow-md">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">SAS Assistance</h1>
            <p className="text-on-surface-variant">Sign in to continue</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="text-[#93000a] text-center text-sm p-3 bg-[#ffdad6] rounded-md font-bold border border-[#93000a]/20">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="block text-sm font-bold text-on-surface">ID Number (DNI)</label>
            <input 
                className="w-full px-4 py-2 border border-outline-variant rounded-md bg-surface focus:outline-none focus:ring-2 focus:ring-secondary transition-shadow"
                type="text" 
                value={dni} 
                onChange={(e) => setDni(e.target.value)} 
                required 
                placeholder="Enter your ID"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-bold text-on-surface">Password</label>
            <input 
                className="w-full px-4 py-2 border border-outline-variant rounded-md bg-surface focus:outline-none focus:ring-2 focus:ring-secondary transition-shadow"
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit"
            className="w-full mt-4 bg-primary text-on-primary py-3 rounded-md font-bold hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}