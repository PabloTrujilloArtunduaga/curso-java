import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code, AlertCircle } from 'lucide-react';

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
        body: JSON.stringify({ email: email.trim().toLowerCase(), password })
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
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-xs border border-slate-200">
        <div className="flex flex-col items-center text-center">
          <div className="bg-blue-600 text-white p-3 rounded-xl shadow-xs mb-3">
            <Code className="h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Iniciar Sesión
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Plataforma del Curso Presencial de Java — USCO
          </p>
        </div>
        
        <form className="mt-6 space-y-5" onSubmit={handleLogin}>
          {error && (
            <div className="bg-rose-50 text-rose-700 p-3.5 rounded-xl text-xs sm:text-sm border border-rose-200 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Correo Electrónico
              </label>
              <input
                id="login-email"
                type="email"
                required
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all text-sm"
                placeholder="u20212213569@usco.edu.co"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700">
                  Contraseña
                </label>
              </div>
              <input
                id="login-password"
                type="password"
                required
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all text-sm"
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
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-xs disabled:opacity-60 cursor-pointer"
            >
              {loading ? 'Iniciando sesión...' : 'Entrar a la Plataforma'}
            </button>
          </div>
        </form>
        
        <div className="text-xs text-center text-slate-500 pt-2 border-t border-slate-100">
          ¿No tienes una cuenta de estudiante?{' '}
          <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
            Inscríbete aquí
          </Link>
        </div>
      </div>
    </div>
  );
};
