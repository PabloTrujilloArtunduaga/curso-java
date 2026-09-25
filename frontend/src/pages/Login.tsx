import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { user, login, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Credenciales incorrectas');
        setLoading(false);
        return;
      }

      login(data.token, data.user);
      navigate(data.user.role === 'ADMIN' ? '/admin' : '/dashboard');

    } catch (err) {
      setError('No se pudo conectar con el servidor.');
      setLoading(false);
    }
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
        <div className="flex flex-col items-center">
          <div className="bg-indigo-600 p-3.5 rounded-full shadow-md mb-3">
            <Code className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
            Iniciar Sesión
          </h2>
          <p className="text-slate-500 text-sm mt-1">Plataforma de Curso Java Presencial</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 text-red-700 p-3.5 rounded-xl text-sm text-center border border-red-200 font-medium">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1">Correo Electrónico</label>
              <input
                id="email"
                type="email"
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                placeholder="ej: u20212213569@usco.edu.co"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1">Contraseña</label>
              <input
                id="password"
                type="password"
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-md disabled:opacity-70 cursor-pointer"
            >
              {loading ? 'Iniciando sesión...' : 'Entrar a la Plataforma'}
            </button>
          </div>
        </form>
        
        <div className="text-sm text-center mt-6">
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
            ¿No tienes cuenta? Regístrate como estudiante
          </Link>
        </div>
      </div>
    </div>
  );
};
