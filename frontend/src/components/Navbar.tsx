import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Code, LogOut, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm group-hover:bg-blue-700 transition-colors">
                <Code className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-slate-900 tracking-tight leading-none">JavaEdu</span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wide">Universidad Surcolombiana</span>
              </div>
            </Link>

            {user && (
              <div className="hidden md:flex items-center gap-1 border-l border-slate-200 pl-6">
                {user.role === 'STUDENT' ? (
                  <>
                    <Link
                      to="/dashboard"
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                        isActive('/dashboard')
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <BookOpen className="h-4 w-4" /> Mi Panel
                    </Link>
                    <Link
                      to="/course"
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive('/course')
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      Módulos
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/admin"
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                        isActive('/admin')
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <ShieldCheck className="h-4 w-4" /> Panel del docente
                    </Link>
                    <Link
                      to="/course"
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive('/course')
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      Vista de Módulos
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Inscribirse
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-700">
                  <UserIcon className="h-3.5 w-3.5 text-slate-500" />
                  <span className="font-semibold text-slate-900">{user.name}</span>
                  <span className="text-slate-400">·</span>
                  <span className="font-medium text-slate-600">
                    {user.role === 'ADMIN' ? 'Docente' : 'Estudiante'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-slate-600 hover:text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 border border-transparent hover:border-rose-200"
                  title="Cerrar Sesión"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
