import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('sas_user') || '{}');

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const getLinkClasses = (path: string) => {
    const isActive = location.pathname === path;
    return isActive
      ? "relative flex items-center gap-3 px-6 py-3 bg-slate-100 text-slate-900 font-bold border-l-4 border-teal-600 transition-all"
      : "relative flex items-center gap-3 px-6 py-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all border-l-4 border-transparent";
  };

  return (
    <div className="min-h-screen flex bg-[#F1F5F9] font-['Inter',_sans-serif]">
      
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <aside className={`w-72 bg-white border-r border-slate-200 flex flex-col fixed h-full z-50 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6 md:p-8 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1E293B] rounded flex items-center justify-center">
              <span className="material-symbols-outlined text-white">shield</span>
            </div>
            <div>
              <h2 className="font-extrabold text-xl text-[#1E293B] tracking-tight">SAS App</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aid Management</p>
            </div>
          </div>
          <button className="md:hidden text-slate-500 hover:text-slate-800" onClick={() => setIsMobileMenuOpen(false)}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="flex flex-col flex-1 overflow-y-auto pt-4">
          {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
            <>
              <Link to="/admin" className={getLinkClasses('/admin')} onClick={() => setIsMobileMenuOpen(false)}>
                <span className="material-symbols-outlined">grid_view</span> Dashboard
              </Link>
              <Link to="/admin/programs" className={getLinkClasses('/admin/programs')} onClick={() => setIsMobileMenuOpen(false)}>
                <span className="material-symbols-outlined">package_2</span> Assistance Programs
              </Link>
            </>
          )}

          {user.role === 'ADMIN' && (
            <Link to="/admin/users" className={getLinkClasses('/admin/users')} onClick={() => setIsMobileMenuOpen(false)}>
              <span className="material-symbols-outlined">group</span> User Management
            </Link>
          )}

          {user.role === 'USER' && (
            <>
              <Link to="/dashboard" className={getLinkClasses('/dashboard')} onClick={() => setIsMobileMenuOpen(false)}>
                <span className="material-symbols-outlined">grid_view</span> My Dashboard
              </Link>
              <Link to="/programs" className={getLinkClasses('/programs')} onClick={() => setIsMobileMenuOpen(false)}>
                <span className="material-symbols-outlined">search</span> Browse Programs
              </Link>
            </>
          )}

          <div className="mt-auto p-6 border-t border-slate-100">
            <button onClick={logout} className="flex items-center gap-3 text-slate-500 hover:text-red-600 font-bold transition-all cursor-pointer">
              <span className="material-symbols-outlined">logout</span> Sign Out
            </button>
          </div>
        </nav>
      </aside>

      <div className="flex-1 md:ml-72 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-slate-200 flex justify-between md:justify-end items-center px-6 md:px-12 sticky top-0 z-30">
          <button className="md:hidden text-slate-600 p-2 -ml-2" onClick={() => setIsMobileMenuOpen(true)}>
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-[#1E293B]">{user.name || 'Staff Member'}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">{user.role}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6 md:p-12 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}