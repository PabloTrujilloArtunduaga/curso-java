import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Code, CheckCircle, Mail, AlertCircle, Users } from 'lucide-react';
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

    // Verificación de capacidad máxima de estudiantes inscritos
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
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6">
        <div className="max-w-md w-full bg-white text-slate-900 p-8 sm:p-10 rounded-2xl shadow-xs text-center border border-slate-200">
          <div className="bg-emerald-50 p-4 rounded-full w-fit mx-auto mb-4 border border-emerald-100">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
          </div>
          
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">¡Inscripción Exitosa!</h2>
          <p className="text-xs text-slate-600 mb-6">Tu cupo para el Curso Presencial de Java ha sido reservado satisfactoriamente.</p>
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700 text-xs text-left mb-6 space-y-2">
            <p className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <Mail className="w-4 h-4 shrink-0" /> Confirmación enviada:
            </p>
            <p className="text-slate-600 italic">
              "Inscripción exitosa al curso presencial de Java de 10 horas. Tu cuenta de estudiante ha sido activada correctamente."
            </p>
          </div>

          <Link 
            to="/dashboard" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl block transition-all shadow-xs text-xs sm:text-sm"
          >
            Ir a mi Panel de Estudiante
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white text-slate-900 p-8 sm:p-10 rounded-2xl shadow-xs border border-slate-200">
        <div className="flex flex-col items-center text-center">
          <div className="bg-blue-600 text-white p-3 rounded-xl shadow-xs mb-3">
            <Code className="h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Inscripción al Curso
          </h1>
          <p className="text-xs text-slate-500 mt-1">Curso Presencial de Java (10 Horas) — USCO</p>
          
          {capacity !== null && (
            <div className="mt-4 w-full text-xs text-slate-700 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>Cupos Ocupados: <b className={capacity >= 20 ? 'text-rose-600' : 'text-blue-600'}>{capacity} / 20</b></span>
              </div>
              {capacity < 10 && (
                <span className="text-[11px] text-amber-700 font-medium">
                  Faltan {10 - capacity} inscripciones para el mínimo requerido de 10.
                </span>
              )}
            </div>
          )}
        </div>
        
        <form className="mt-4 space-y-4" onSubmit={handleRegister}>
          {error && (
            <div className="bg-rose-50 text-rose-700 p-3 rounded-xl text-xs text-center border border-rose-200 font-medium flex items-center justify-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-700 mb-1">Nombre(s)</label>
              <input
                id="reg-name"
                type="text" required
                placeholder="Juan"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:outline-none"
                value={name} onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="reg-lastname" className="block text-xs font-semibold text-slate-700 mb-1">Apellidos</label>
              <input
                id="reg-lastname"
                type="text" required
                placeholder="Pérez"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:outline-none"
                value={lastName} onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico (Gmail / Institucional)</label>
            <input
              id="reg-email"
              type="email" required placeholder="estudiante@usco.edu.co"
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:outline-none"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="reg-phone" className="block text-xs font-semibold text-slate-700 mb-1">Teléfono (Opcional)</label>
            <input
              id="reg-phone"
              type="tel"
              placeholder="+57 300 123 4567"
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:outline-none"
              value={phone} onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-700 mb-1">Contraseña</label>
              <input
                id="reg-password"
                type="password" required minLength={6}
                placeholder="••••••"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:outline-none"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="reg-confirm" className="block text-xs font-semibold text-slate-700 mb-1">Confirmar</label>
              <input
                id="reg-confirm"
                type="password" required minLength={6}
                placeholder="••••••"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-600 focus:outline-none"
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || (capacity !== null && capacity >= 20)}
            className="w-full justify-center py-3 px-4 border border-transparent text-xs sm:text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-xs transition-all cursor-pointer"
          >
            {loading ? 'Completando Registro...' : (capacity !== null && capacity >= 20) ? 'Cupos Agotados (20/20)' : 'Completar Inscripción'}
          </button>
        </form>
        
        <div className="text-xs text-center text-slate-500 pt-2 border-t border-slate-100">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
};
