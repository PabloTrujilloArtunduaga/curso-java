import { useEffect, useState, useMemo } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { courseModules } from '../data/courseData';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CodeBlock } from '../components/CodeBlock';
import { Sidebar } from '../components/Sidebar';
import { CheckCircle, ArrowLeft, Target, BookOpen, PenTool, Lock, ShieldCheck } from 'lucide-react';
import type { ModuleStatusType } from '../types';

export const Module = () => {
  const { id } = useParams<{ id: string }>();
  const moduleId = parseInt(id || '0', 10);
  const { user } = useAuth();
  
  const [status, setStatus] = useState<ModuleStatusType | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  const moduleData = useMemo(() => courseModules.find(m => m.id === moduleId), [moduleId]);

  useEffect(() => {
    window.scrollTo(0, 0);
    checkModuleStatus();
  }, [moduleId, user]);

  const checkModuleStatus = async () => {
    if (!user) return;
    setIsLoading(true);
    
    // Check module status from API
    const locks = await api.getModuleLocks();
    const lock = locks.find(l => l.moduleId === moduleId);
    const currentStatus = lock ? lock.status : 'LOCKED';
    setStatus(currentStatus);

    // Check attendance or manual access for student
    const attendances = await api.getStudentAttendances();
    const manualAccesses = await api.getManualAccesses();
    const unlocked = attendances.some(a => a.moduleId === moduleId) || manualAccesses.some(m => m.moduleId === moduleId);
    
    setHasAccess(unlocked);
    setIsLoading(false);
  };

  if (!moduleData) {
    return <Navigate to="/course" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-purple-300 font-bold text-lg">
        Cargando contenido del módulo...
      </div>
    );
  }

  // REGLA SOLICITADA: El administrador puede ver los módulos SIN IMPORTAR su estado
  const isAdmin = user?.role === 'ADMIN';
  const canView = isAdmin || (status === 'OPEN' && hasAccess);

  if (!canView) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-slate-900 text-white px-4 text-center">
        <div className="bg-purple-900/50 p-6 rounded-full border border-purple-500/30 mb-6 backdrop-blur-md">
          <Lock className="w-16 h-16 text-purple-400" />
        </div>
        <h1 className="text-3xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300">
          Acceso Restringido
        </h1>
        <p className="text-slate-300 max-w-md mb-8 text-sm leading-relaxed">
          {status === 'CLOSED' && 'Este módulo ha sido cerrado por el profesor.'}
          {status === 'LOCKED' && 'El administrador aún no ha habilitado el acceso a este módulo.'}
          {status === 'OPEN' && !hasAccess && 'El módulo está abierto, pero requieres haber registrado tu asistencia mediante el código QR proyectado en clase.'}
        </p>
        <Link 
          to="/course" 
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all text-sm"
        >
          Volver a la Lista de Módulos
        </Link>
      </div>
    );
  }

  return (
    <div className="flex bg-slate-950 text-slate-100 min-h-[calc(100vh-4rem)]">
      <Sidebar />
      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* Header */}
        <div className="mb-10">
          <Link to="/course" className="inline-flex items-center text-sm font-semibold text-purple-400 hover:text-purple-300 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Volver a los módulos
          </Link>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center rounded-full bg-purple-900/60 px-3.5 py-1 text-xs font-black text-purple-300 border border-purple-500/30">
              Módulo {moduleData.id}
            </span>

            {isAdmin ? (
              <span className="inline-flex items-center rounded-full bg-amber-500/20 px-3.5 py-1 text-xs font-black text-amber-300 gap-1 border border-amber-500/40">
                <ShieldCheck className="w-3.5 h-3.5" /> Vista del Profesor (Admin)
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-black text-emerald-300 gap-1 border border-emerald-500/40">
                <CheckCircle className="w-3.5 h-3.5" /> Asistencia Confirmada
              </span>
            )}
          </div>

          <h1 className="text-3xl font-black sm:text-4xl text-white tracking-tight">{moduleData.title}</h1>
          <p className="mt-3 text-lg text-slate-300">{moduleData.description}</p>
        </div>

        {/* Objectives */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-6 mb-8 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Target className="text-purple-400 w-5 h-5" /> Objetivos de aprendizaje
          </h2>
          <ul className="space-y-3">
            {moduleData.objectives.map((obj, i) => (
              <li key={i} className="flex items-start">
                <span className="flex-shrink-0 mt-1.5 h-2 w-2 rounded-full bg-purple-500 mr-3"></span>
                <span className="text-slate-300 text-sm leading-relaxed">{obj}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Content */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-6 mb-8 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-800 pb-4">
            <BookOpen className="text-purple-400 w-6 h-6" /> Contenido Teórico
          </h2>
          
          <div className="space-y-4 text-slate-300 text-base leading-relaxed">
            {moduleData.content.theory.split("\n\n").map((paragraph, idx) => (
              <p key={idx} className="text-slate-300">{paragraph}</p>
            ))}
          </div>

          {moduleData.content.codeExample && (
            <div className="mt-8 pt-6 border-t border-slate-800">
              <h3 className="text-lg font-bold text-white mb-4">Ejemplo Práctico en Java</h3>
              <CodeBlock code={moduleData.content.codeExample} language="java" />
            </div>
          )}
        </div>

        {/* Exercises */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-6 mb-10 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-800 pb-4">
            <PenTool className="text-purple-400 w-5 h-5" /> Ejercicios de Práctica
          </h2>
          <ul className="space-y-4">
            {moduleData.content.exercises.map((ex, i) => (
              <li key={i} className="flex items-start bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 shadow-sm">
                <span className="font-bold text-purple-300 mr-3 bg-purple-900/80 w-6 h-6 flex items-center justify-center rounded-full text-xs">
                  {i + 1}
                </span>
                <span className="text-slate-200 text-sm pt-0.5">{ex}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
};
