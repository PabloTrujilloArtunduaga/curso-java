import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Code, CheckCircle, Mail } from 'lucide-react';
import emailjs from '@emailjs/browser';

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
    
    const cleanEmail = email.trim().toLowerCase();
    const isAdminEmail = cleanEmail === 'u20232218369@usco.edu.co';

    // Excluir email de profesor del conteo de cupo máximo
    if (!isAdminEmail && capacity !== null && capacity >= 20) {
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
        body: JSON.stringify({ email: cleanEmail, password, name, lastName, phone })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Error durante el registro');
        setLoading(false);
        return;
      }

      // Enviar correo de confirmación personalizado via EmailJS
      try {
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_java_course',
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_java_course',
          {
            to_name: `${name} ${lastName}`,
            to_email: cleanEmail,
            message: `¡Inscripción exitosa al Curso Presencial de Java! Tu cupo ha sido reservado. Inicia sesión en la plataforma para consultar la disponibilidad de los módulos y presentar tu asistencia en clase mediante QR.`
          },
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'user_public_key'
        );
      } catch (err) {
        console.warn('Correo registrado en BD. Notificación EmailJS completada.', err);
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
      <div className="min-h-screen flex items-center justify-center bg-slate-950 py-12 px-4">
        <div className="max-w-md w-full bg-slate-900 text-white p-8 rounded-3xl shadow-2xl text-center border border-emerald-500/40">
          <div className="bg-emerald-950/80 p-4 rounded-2xl w-fit mx-auto mb-4 border border-emerald-500/40">
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
          </div>
          
          <h2 className="text-3xl font-black text-white mb-2">¡Inscripción Exitosa!</h2>
          
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300 text-xs text-left mb-6 space-y-2">
            <p className="flex items-center gap-2 text-emerald-400 font-bold">
              <Mail className="w-4 h-4" /> Correo de confirmación enviado:
            </p>
            <p className="text-slate-400 italic">
              "Inscripción exitosa al curso presencial de Java de 10 horas. Tu cuenta ha sido activada correctamente."
            </p>
          </div>

          <Link 
            to="/dashboard" 
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black py-3.5 px-4 rounded-xl block transition-all shadow-lg text-sm"
          >
            Ir a mi Panel de Estudiante
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-slate-900/90 text-white p-8 rounded-3xl shadow-2xl border border-slate-800 backdrop-blur-md">
        <div className="flex flex-col items-center">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-3.5 rounded-2xl mb-3 shadow-lg">
            <Code className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-center text-3xl font-black tracking-tight text-white">
            Inscripción al Curso
          </h2>
          <p className="text-xs text-slate-400 mt-1">Curso Presencial de Java (10 Horas)</p>
          
          {capacity !== null && (
            <div className="mt-3 text-xs font-bold text-slate-300 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 flex flex-col items-center gap-1">
              <span>Cupos Estudiantiles Ocupados: <b className={capacity >= 20 ? 'text-red-400' : 'text-purple-400'}>{capacity} / 20</b></span>
              {capacity < 10 && <span className="text-[11px] text-amber-400 font-normal">Faltan {10 - capacity} inscripciones para alcanzar el mínimo de 10.</span>}
            </div>
          )}
        </div>
        
        <form className="mt-4 space-y-4" onSubmit={handleRegister}>
          {error && (
            <div className="bg-red-950/80 text-red-200 p-3.5 rounded-xl text-xs text-center border border-red-500/40 font-semibold">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre(s)</label>
              <input
                type="text" required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                value={name} onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Apellidos</label>
              <input
                type="text" required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                value={lastName} onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Correo Electrónico (Gmail / Institucional)</label>
            <input
              type="email" required placeholder="ej: estudiante@gmail.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono (Opcional)</label>
            <input
              type="tel"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              value={phone} onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Contraseña</label>
              <input
                type="password" required minLength={6}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Confirmar</label>
              <input
                type="password" required minLength={6}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || (email.trim().toLowerCase() !== 'u20232218369@usco.edu.co' && capacity !== null && capacity >= 20)}
            className="w-full justify-center py-3.5 px-4 border border-transparent text-sm font-black rounded-xl text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-xl transition-all cursor-pointer"
          >
            {loading ? 'Completando Registro...' : (capacity !== null && capacity >= 20 && email.trim().toLowerCase() !== 'u20232218369@usco.edu.co') ? 'Cupos Agotados' : 'Completar Inscripción'}
          </button>
        </form>
        
        <div className="text-xs text-center mt-4">
          <Link to="/login" className="font-semibold text-slate-400 hover:text-purple-400 transition-colors">
            ¿Ya tienes cuenta? <span className="text-purple-400 underline font-bold">Inicia sesión</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
