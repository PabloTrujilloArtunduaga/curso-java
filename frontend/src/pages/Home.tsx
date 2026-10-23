import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Trophy, Users, QrCode, ArrowRight, CheckCircle, GraduationCap } from 'lucide-react';
import { courseModules } from '../data/courseData';

export const Home = () => {
  const { user } = useAuth();
  const [studentCount, setStudentCount] = useState<number>(0);

  useEffect(() => {
    api.getStudentsCount().then(setStudentCount);
  }, []);

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200/80 px-3.5 py-1.5 rounded-full text-xs font-semibold text-blue-700 mb-8 shadow-2xs">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span>Curso Presencial de Java (10 Horas) — Universidad Surcolombiana</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl text-slate-900 leading-tight mb-6">
            Aprende Java desde cero con arquitectura profesional
          </h1>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl leading-relaxed mb-10">
            5 semanas estructuradas con teoría rigurosa, ejercicios prácticos y proyecto integrador. Control de asistencia presencial mediante código QR dinámico y habilitación progresiva de contenidos.
          </p>

          {/* Medidor de Cupos en Vivo */}
          <div className="bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl mb-10 flex flex-wrap items-center justify-center gap-4 shadow-xs max-w-xl">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Inscripciones:</span>
            </div>
            <span className="text-base font-bold text-slate-900">
              {studentCount} / 20 Estudiantes
            </span>
            <span className="text-xs font-medium text-slate-500 border-l border-slate-200 pl-4">
              {studentCount < 10 ? `Faltan ${10 - studentCount} para el mínimo requerido` : '¡Grupo habilitado para iniciar!'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-auto">
            {!user ? (
              <>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3.5 rounded-xl shadow-xs transition-all text-sm flex items-center justify-center gap-2 group"
                >
                  Inscribirme al Curso <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-7 py-3.5 rounded-xl border border-slate-300 transition-all text-sm flex items-center justify-center shadow-xs"
                >
                  Ya soy Estudiante (Ingresar)
                </Link>
              </>
            ) : (
              <Link
                to={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3.5 rounded-xl shadow-xs transition-all text-sm flex items-center justify-center gap-2"
              >
                Ir a mi Panel de {user.role === 'ADMIN' ? 'Docente' : 'Estudiante'} <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

        </div>
      </section>

      {/* Características principales */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold text-blue-600 tracking-wider uppercase mb-2">Metodología Presencial</h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">Formación directa con validación en clase</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col">
              <div className="bg-blue-50 text-blue-600 p-3 rounded-xl w-fit border border-blue-100 mb-5">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Cupos Controlados</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Mínimo 10 y máximo 20 estudiantes por cohorte para asegurar atención personalizada, resolución de dudas en vivo y acompañamiento técnico directo.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col">
              <div className="bg-blue-50 text-blue-600 p-3 rounded-xl w-fit border border-blue-100 mb-5">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Asistencia QR Dinámica</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                El docente proyecta un código QR con expiración de 90 segundos durante la sesión presencial. El estudiante lo escanea para desbloquear el módulo correspondiente.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col">
              <div className="bg-blue-50 text-blue-600 p-3 rounded-xl w-fit border border-blue-100 mb-5">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Certificación al 100%</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Al completar la asistencia confirmada en las 5 semanas y desarrollar los proyectos requeridos, se emite constancia de culminación satisfactoria.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Plan de 5 semanas */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Plan de Estudio</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">5 Módulos progresivos de Java</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md">
              Cada semana profundiza en un pilar esencial, desde la sintaxis básica hasta la programación orientada a objetos y arquitectura de software.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {courseModules.map((module) => (
              <div key={module.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col justify-between">
                <div>
                  <span className="inline-block text-[10px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded mb-2">
                    Semana {module.id}
                  </span>
                  <h4 className="font-bold text-xs text-slate-900 mb-1">{module.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-3">{module.description}</p>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center gap-1 text-[11px] font-medium text-slate-600">
                  <CheckCircle className="w-3 h-3 text-blue-600" />
                  <span>2 Horas presenciales</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
