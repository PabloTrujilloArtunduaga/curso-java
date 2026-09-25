import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Trophy, Users, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export const Home = () => {
  const { user } = useAuth();
  const [studentCount, setStudentCount] = useState<number>(0);

  useEffect(() => {
    api.getStudentsCount().then(setStudentCount);
  }, []);

  return (
    <div className="bg-slate-950 text-white min-h-screen flex flex-col">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-purple-950/40 to-slate-950 py-24 sm:py-32">
        
        {/* Glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-purple-600/20 blur-[140px] rounded-full pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          
          <div className="inline-flex items-center gap-2 bg-purple-900/50 border border-purple-500/30 px-4 py-1.5 rounded-full text-xs font-black text-purple-300 mb-8 backdrop-blur-md shadow-lg">
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            <span>Curso Presencial de Java — Universidad Surcolombiana</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight max-w-4xl text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-purple-300 leading-tight mb-6">
            Aprende Java desde Cero con Arquitectura Profesional
          </h1>

          <p className="text-slate-300 text-lg sm:text-xl max-w-2xl leading-relaxed mb-10">
            Curso práctico de 10 horas en 5 semanas. Control de asistencia mediante QR dinámico, acceso progresivo y certificación oficial al completar el 100%.
          </p>

          {/* Medidor de Cupos en Vivo */}
          <div className="bg-slate-900/80 border border-purple-500/30 backdrop-blur-md px-6 py-3 rounded-2xl mb-10 flex items-center gap-4 shadow-xl">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Cupos Ocupados:</span>
            </div>
            <span className="text-lg font-black text-purple-300">
              {studentCount} / 20 Estudiantes
            </span>
            <span className="text-xs text-slate-400 font-medium border-l border-slate-700 pl-4">
              {studentCount < 10 ? `Faltan ${10 - studentCount} para el mínimo` : '¡Curso habilitado para iniciar!'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {!user ? (
              <>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black px-8 py-4 rounded-xl shadow-xl shadow-purple-600/25 transition-all text-base flex items-center justify-center gap-2 group"
                >
                  Inscribirme al Curso <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-bold px-8 py-4 rounded-xl border border-slate-700 transition-all text-base flex items-center justify-center"
                >
                  Ya soy Estudiante (Ingresar)
                </Link>
              </>
            ) : (
              <Link
                to={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black px-8 py-4 rounded-xl shadow-xl shadow-purple-600/25 transition-all text-base flex items-center justify-center gap-2"
              >
                Ir a mi Panel de {user.role === 'ADMIN' ? 'Profesor' : 'Estudiante'} <ArrowRight className="w-5 h-5" />
              </Link>
            )}
          </div>

        </div>
      </div>

      {/* Características principales */}
      <div className="py-20 bg-slate-900/60 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <h2 className="text-xs font-black text-purple-400 tracking-widest uppercase mb-2">Metodología Presencial</h2>
            <p className="text-3xl sm:text-4xl font-black text-white">¿Por qué este curso de Java?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-slate-900/80 backdrop-blur-md p-8 rounded-2xl border border-slate-800 shadow-xl hover:border-purple-500/40 transition-all">
              <div className="bg-purple-900/50 p-4 rounded-2xl w-fit border border-purple-500/30 mb-6">
                <Users className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Cupos Controlados</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Mínimo 10 y máximo 20 estudiantes por grupo presencial para asegurar un acompañamiento directo.
              </p>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-md p-8 rounded-2xl border border-slate-800 shadow-xl hover:border-purple-500/40 transition-all">
              <div className="bg-purple-900/50 p-4 rounded-2xl w-fit border border-purple-500/30 mb-6">
                <ShieldCheck className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Asistencia QR Dinámica</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                El profesor proyecta un código QR con expiración en clase. Tú lo escaneas con tu celular para registrar tu presencia.
              </p>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-md p-8 rounded-2xl border border-slate-800 shadow-xl hover:border-purple-500/40 transition-all">
              <div className="bg-purple-900/50 p-4 rounded-2xl w-fit border border-purple-500/30 mb-6">
                <Trophy className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Certificación al 100%</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Al completar la asistencia y práctica de las 5 semanas obtendrás tu constancia de finalización exitosa del curso.
              </p>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};
