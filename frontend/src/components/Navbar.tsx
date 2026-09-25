import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Code, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Code className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">JavaEdu</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {!user ? (
              <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                Iniciar Sesión
              </Link>
            ) : (
              <>
                {user.role === 'STUDENT' ? (
                  <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
                    <BookOpen className="h-4 w-4" /> Mi Panel
                  </Link>
                ) : (
                  <Link to="/admin" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Panel Admin
                  </Link>
                )}
                <button onClick={handleLogout} className="text-red-600 hover:bg-red-50 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
                  <LogOut className="h-4 w-4" /> Salir
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
