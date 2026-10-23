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
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 text-slate-600 font-semibold text-sm">
        Cargando contenido del módulo...
      </div>
    );
  }

  // REGLA SOLICITADA: El docente (rol ADMIN) puede ver los módulos SIN IMPORTAR su estado
  const isAdmin = user?.role === 'ADMIN';
  const canView = isAdmin || (status === 'OPEN' && hasAccess);

  if (!canView) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-slate-50 text-slate-900 px-4 text-center py-16">
        <div className="bg-white p-5 rounded-full border border-slate-200 shadow-xs mb-5">
          <Lock className="w-10 h-10 text-slate-400" />
        </div>
        <h1 className="text-2xl font-extrabold mb-2 text-slate-900">
          Acceso Restringido al Módulo {moduleId}
        </h1>
        <p className="text-slate-600 max-w-md mb-8 text-xs sm:text-sm leading-relaxed">
          {status === 'CLOSED' && 'Este módulo ha sido cerrado por el docente.'}
          {status === 'LOCKED' && 'El docente aún no ha habilitado el acceso a este módulo para la semana en curso.'}
          {status === 'OPEN' && !hasAccess && 'El módulo está habilitado, pero requieres haber registrado tu asistencia presencial mediante el código QR proyectado en clase.'}
        </p>
        <Link 
          to="/course" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-xs transition-all text-xs sm:text-sm"
        >
          Volver a la Lista de Módulos
        </Link>
      </div>
    );
  }

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar />
      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Header */}
        <div className="mb-8">
          <Link to="/course" className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700 mb-4 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Volver al catálogo de módulos
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-100">
              Semana {moduleData.id}
            </span>

            {isAdmin ? (
              <span className="inline-flex items-center rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 gap-1 border border-amber-200">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Vista del docente
              </span>
            ) : (
              <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 gap-1 border border-emerald-200">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Asistencia Confirmada
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{moduleData.title}</h1>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">{moduleData.description}</p>
        </div>

        {/* Objectives */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Target className="text-blue-600 w-4 h-4" /> Objetivos de aprendizaje
          </h2>
          <ul className="space-y-2.5">
            {moduleData.objectives.map((obj, i) => (
              <li key={i} className="flex items-start text-xs sm:text-sm">
                <span className="flex-shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-600 mr-2.5"></span>
                <span className="text-slate-700 leading-relaxed">{obj}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 mb-6 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
            <BookOpen className="text-blue-600 w-5 h-5" /> Contenido Teórico
          </h2>
          
          <div className="space-y-4 text-slate-700 text-xs sm:text-sm leading-relaxed">
            {moduleData.content.theory.split("\n\n").map((paragraph, idx) => (
              <p key={idx} className="text-slate-700">{paragraph}</p>
            ))}
          </div>

          {moduleData.content.codeExample && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Ejemplo Práctico en Java</h3>
              <CodeBlock code={moduleData.content.codeExample} language="java" />
            </div>
          )}
        </div>

        {/* Exercises */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <PenTool className="text-blue-600 w-4 h-4" /> Ejercicios de Práctica Presencial
          </h2>
          <ul className="space-y-3">
            {moduleData.content.exercises.map((ex, i) => (
              <li key={i} className="flex items-start bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="font-bold text-blue-700 mr-3 bg-blue-100/80 w-5 h-5 flex items-center justify-center rounded-full text-[11px] shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-slate-800 text-xs sm:text-sm pt-0.5 leading-relaxed">{ex}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
};
