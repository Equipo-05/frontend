import { useState } from 'react';

export default function App() {
  // 1. Estados para capturar los datos del formulario
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 2. Función que se ejecuta al enviar el formulario
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita que la página se recargue
    setError('');
    setIsLoading(true);

    try {
      // 3. Llamada al backend
      const response = await fetch('http://localhost:8086/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dni, password }), // Enviamos DNI y Password
      });

      if (!response.ok) {
        // Si el backend devuelve 401, 403, 404, etc.
        throw new Error('Invalid DNI or password');
      }

      const data = await response.json();
      
      // 4. Guardamos el token (asumiendo que tu backend devuelve { "token": "ey..." })
      const token = data.token; 
      localStorage.setItem('sas_token', token);
      
      alert('Login successful! Token saved.');
      // Aquí iría la redirección a la página principal: navigate('/dashboard')

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-md md:p-gutter">
      <main className="w-full max-w-[480px]">
        <div className="bg-surface rounded-lg border border-outline-variant p-xl flex flex-col space-y-lg shadow-sm">
          
          {/* Header Section */}
          <div className="text-center space-y-sm flex flex-col items-center">
            <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mb-sm">
              <span className="material-symbols-outlined text-on-primary-container text-[32px]">shield_person</span>
            </div>
            <h1 className="font-headline-lg text-3xl font-bold text-on-surface">SAS Social Assistance</h1>
            <p className="font-body-md text-on-surface-variant">Management and Application Portal</p>
          </div>

          {/* Login Form */}
          <form className="space-y-md" onSubmit={handleLogin}>
            
            {/* Mensaje de Error */}
            {error && (
              <div className="p-sm bg-error-container text-on-error-container border border-error rounded-DEFAULT font-label-md text-center">
                {error}
              </div>
            )}

            {/* DNI Input (Reemplaza al Email) */}
            <div className="space-y-xs">
              <label className="font-label-md text-on-surface block font-semibold" htmlFor="dni">DNI / ID Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline">badge</span>
                </div>
                <input 
                  className="block w-full pl-10 pr-sm py-sm border border-outline-variant rounded-DEFAULT bg-surface text-on-surface focus:ring-2 focus:ring-secondary focus:border-secondary transition-shadow" 
                  id="dni" 
                  name="dni" 
                  placeholder="12345678Z" 
                  required 
                  type="text"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-xs">
              <div className="flex justify-between items-center">
                <label className="font-label-md text-on-surface block font-semibold" htmlFor="password">Password</label>
                <a className="font-caption text-xs text-primary hover:underline" href="#">Forgot your password?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline">lock</span>
                </div>
                <input 
                  className="block w-full pl-10 pr-sm py-sm border border-outline-variant rounded-DEFAULT bg-surface text-on-surface focus:ring-2 focus:ring-secondary focus:border-secondary transition-shadow" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  required 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-sm">
              <button 
                className={`w-full flex justify-center py-md px-lg border border-transparent rounded-DEFAULT shadow-sm font-label-md font-bold text-on-primary transition-colors ${isLoading ? 'bg-outline cursor-not-allowed' : 'bg-primary hover:bg-primary-container focus:ring-2 focus:ring-offset-2 focus:ring-primary'}`} 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
          </form>

          {/* Registration CTA */}
          <div className="text-center pt-md border-t border-outline-variant">
            <p className="font-body-md text-on-surface-variant">
              Don't have an account? <a className="font-label-md text-primary font-bold hover:underline" href="#">Register here</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}