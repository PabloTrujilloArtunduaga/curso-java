import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Code, CheckCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const Register = () => {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [capacity, setCapacity] = useState<number | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const navigate = useNavigate();
  const { user, login } = useAuth();

  useEffect(() => {
    if (user && !isSuccess) {
      navigate('/dashboard'); 
    }
    checkCapacity();
  }, [user, navigate, isSuccess]);

  const checkCapacity = async () => {
    const count = await api.getStudentsCount();
    setCapacity(count);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (capacity !== null && capacity >= 20) {
      setError('El curso ha alcanzado su capacidad máxima (20 estudiantes).');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, lastName, phone })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Error durante el registro');
        setLoading(false);
        return;
      }

      login(data.token, data.user);
      setIsSuccess(true);
      setLoading(false);

    } catch (err) {
      setError('No se pudo conectar con el servidor.');
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4">
        <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl text-center border-t-4 border-emerald-500">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">¡Inscripción Exitosa!</h2>
          <p className="text-slate-600 mb-6 text-sm">
            Tu cuenta ha sido creada correctamente. Ahora puedes consultar el estado de los módulos en tu panel.
          </p>
          <Link to="/dashboard" className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl font-bold hover:bg-indigo-700 block transition-all shadow-md">
            Ir a mi Panel de Estudiante
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
        <div className="flex flex-col items-center">
          <div className="bg-indigo-600 p-3 rounded-full mb-2 shadow-md">
            <Code className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
            Inscripción al Curso
          </h2>
          {capacity !== null && (
            <div className="mt-2 text-sm text-slate-600 font-medium bg-slate-100 px-4 py-1.5 rounded-full">
              Cupos ocupados: <span className={capacity >= 20 ? 'text-red-600 font-bold' : 'text-indigo-600 font-bold'}>{capacity} / 20</span>
              {capacity < 10 && <span className="block text-xs text-amber-600 font-normal">Faltan {10 - capacity} alumnos para el cupo mínimo.</span>}
            </div>
          )}
        </div>
        
        <form className="mt-4 space-y-4" onSubmit={handleRegister}>
          {error && (
            <div className="bg-red-50 text-red-700 p-3.5 rounded-xl text-sm text-center border border-red-200 font-medium">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre(s)</label>
              <input
                type="text" required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={name} onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Apellidos</label>
              <input
                type="text" required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={lastName} onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico</label>
            <input
              type="email" required placeholder="ej: estudiante@correo.com"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono (Opcional)</label>
            <input
              type="tel"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={phone} onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contraseña</label>
              <input
                type="password" required minLength={6}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Confirmar</label>
              <input
                type="password" required minLength={6}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || (capacity !== null && capacity >= 20)}
            className="w-full justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-md transition-all cursor-pointer"
          >
            {loading ? 'Procesando...' : (capacity !== null && capacity >= 20) ? 'Cupos Agotados' : 'Completar Inscripción'}
          </button>
        </form>
        
        <div className="text-sm text-center mt-4">
          <Link to="/login" className="font-semibold text-slate-600 hover:text-indigo-600">
            ¿Ya tienes cuenta? <span className="text-indigo-600 underline">Inicia sesión</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
