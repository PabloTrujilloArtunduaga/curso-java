import { useEffect, useState, useMemo } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { courseModules } from '../data/courseData';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CodeBlock } from '../components/CodeBlock';
import { Sidebar } from '../components/Sidebar';
import { CheckCircle, ArrowLeft, Target, BookOpen, PenTool, Lock } from 'lucide-react';
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
    
    // Check if open
    const locks = await api.getModuleLocks();
    const lock = locks.find(l => l.moduleId === moduleId);
    const currentStatus = lock ? lock.status : 'LOCKED';
    setStatus(currentStatus);

    // Check attendance or manual access
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
    return <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">Cargando contenido...</div>;
  }

  // Admin bypass (opcional, pero según requerimientos el admin ve el panel, los estudiantes consumen)
  const canView = status === 'OPEN' && hasAccess;

  if (!canView) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <Lock className="w-16 h-16 text-gray-400 mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Acceso Restringido</h1>
        <p className="text-gray-600 max-w-md mb-6">
          {status === 'CLOSED' && 'Este módulo ha sido cerrado por el profesor.'}
          {status === 'LOCKED' && 'El administrador aún no ha habilitado el acceso a este módulo.'}
          {status === 'OPEN' && !hasAccess && 'El módulo está abierto, pero requieres haber registrado asistencia en clase o tener un permiso especial del administrador.'}
        </p>
        <Link to="/course" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Volver a los módulos
        </Link>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-[calc(100vh-4rem)]">
      <Sidebar />
      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Header */}
        <div className="mb-10">
          <Link to="/course" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver a los módulos
          </Link>
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-800 border border-blue-200">
                Módulo {moduleData.id}
              </span>
              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-800 gap-1 border border-green-200">
                <CheckCircle className="w-4 h-4" /> Acceso Concedido
              </span>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl tracking-tight">{moduleData.title}</h1>
          <p className="mt-4 text-lg text-gray-600">{moduleData.description}</p>
        </div>

        {/* Objectives */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="text-blue-600 w-5 h-5" /> Objetivos de aprendizaje
          </h2>
          <ul className="space-y-3">
            {moduleData.objectives.map((obj, i) => (
              <li key={i} className="flex items-start">
                <span className="flex-shrink-0 mt-1 h-2 w-2 rounded-full bg-blue-500 mr-3"></span>
                <span className="text-gray-700">{obj}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Content */}
        <div className="prose prose-blue max-w-none mb-10">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-4">
              <BookOpen className="text-blue-600 w-6 h-6" /> Contenido Teórico
            </h2>
            {moduleData.content.theory.split("\n\n").map((paragraph, idx) => (
              <p key={idx} className="text-gray-700 leading-relaxed text-lg mb-4">{paragraph}</p>
            ))}
            
            {moduleData.content.codeExample && (
              <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Ejemplo Práctico</h3>
                <CodeBlock code={moduleData.content.codeExample} language="java" />
              </div>
            )}
          </div>
        </div>

        {/* Exercises */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-4">
            <PenTool className="text-blue-600 w-5 h-5" /> Práctica Sugerida
          </h2>
          <ul className="space-y-4 mb-8">
            {moduleData.content.exercises.map((ex, i) => (
              <li key={i} className="flex items-start bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                <span className="font-bold text-blue-600 mr-3 bg-blue-100 w-6 h-6 flex items-center justify-center rounded-full text-xs">
                  {i + 1}
                </span>
                <span className="text-gray-700 pt-0.5">{ex}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
};
