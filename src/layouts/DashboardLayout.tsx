import { useNavigate, Link, useLocation } from 'react-router-dom';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation(); // <-- Obtenemos la ruta actual
  const user = JSON.parse(localStorage.getItem('sas_user') || '{}');

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Función mágica para el estado "activo"
  const getLinkClasses = (path: string) => {
    const isActive = location.pathname === path;
    return isActive
      ? "px-4 py-3 bg-secondary-container text-on-secondary-container rounded-lg font-bold flex gap-3 items-center"
      : "px-4 py-3 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-lg font-bold flex gap-3 items-center transition-colors";
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-on-surface">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-container border-r border-outline-variant p-6 flex flex-col gap-6 fixed h-full z-40 hidden md:flex">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined">assured_workload</span>
          </div>
          <div>
            <h2 className="font-bold text-lg text-primary leading-tight">SAS App</h2>
            <p className="text-xs text-on-surface-variant">2026 Term</p>
          </div>
        </div>

        {/* Primary Action */}
        <button className="bg-primary text-on-primary rounded-lg py-2 px-4 font-bold w-full flex items-center justify-center gap-2 hover:bg-opacity-90 transition-colors">
          <span className="material-symbols-outlined text-[20px]">add</span> New Application
        </button>

        <nav className="flex flex-col gap-2 flex-1 mt-4">
          {/* Usamos getLinkClasses para aplicar los colores dinámicamente */}
          <Link to="/admin" className={getLinkClasses('/admin')}>
            <span className="material-symbols-outlined">dashboard</span> Dashboard
          </Link>
          
          {user.role === 'ADMIN' && (
            <>
              <Link to="/admin/programs" className={getLinkClasses('/admin/programs')}>
                <span className="material-symbols-outlined">inventory_2</span> Assistance Programs
              </Link>
              {/* Dejamos preparada la ruta para los usuarios */}
              <Link to="/admin/users" className={getLinkClasses('/admin/users')}>
                <span className="material-symbols-outlined">group</span> Beneficiary Mgmt.
              </Link>
            </>
          )}

          <div className="mt-auto border-t border-outline-variant pt-4">
            <button onClick={logout} className="w-full text-left px-4 py-3 text-on-surface-variant hover:text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg font-bold flex gap-3 items-center transition-colors">
              <span className="material-symbols-outlined">logout</span> Sign Out
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64 w-full min-h-screen">
        <header className="bg-surface border-b border-outline-variant flex justify-end items-center px-8 py-4 sticky top-0 z-30">
          <div className="flex items-center gap-4 border-l border-outline-variant pl-4">
            <div className="text-right">
              <p className="text-sm font-bold text-on-surface">{user.name || 'Admin User'}</p>
              <p className="text-xs text-on-surface-variant">{user.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold">
              {user.name ? user.name.charAt(0) : 'A'}
            </div>
          </div>
        </header>
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}