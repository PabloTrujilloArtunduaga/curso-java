import { useState, useEffect } from 'react';
import { courseModules } from '../data/courseData';
import { ModuleCard } from '../components/ModuleCard';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { ModuleLock, AttendanceRecord, ManualAccess } from '../types';
import { ProgressBar } from '../components/ProgressBar';
import { Lock, AlertTriangle } from 'lucide-react';

export const Course = () => {
  const { user } = useAuth();
  const [locks, setLocks] = useState<ModuleLock[]>([]);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [manualAccesses, setManualAccesses] = useState<ManualAccess[]>([]);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    const l = await api.getModuleLocks();
    setLocks(l);
    if (user) {
      const a = await api.getStudentAttendances();
      setAttendances(a);
      const m = await api.getManualAccesses();
      setManualAccesses(m);
    }
  };

  const isModuleUnlocked = (moduleId: number) => {
    return attendances.some(a => a.moduleId === moduleId) || manualAccesses.some(m => m.moduleId === moduleId);
  };

  const getModuleStatus = (moduleId: number) => {
    const lock = locks.find(l => l.moduleId === moduleId);
    return lock ? lock.status : 'LOCKED';
  };

  const getAccessibleCount = () => {
    return courseModules.filter(m => getModuleStatus(m.id) === 'OPEN' && isModuleUnlocked(m.id)).length;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-50 min-h-screen">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
          Módulos del Curso
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-3xl">
          El administrador habilitará los módulos progresivamente. Debes registrar tu asistencia mediante QR presencial para poder acceder al contenido de cada módulo abierto.
        </p>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 max-w-2xl">
          <ProgressBar completed={getAccessibleCount()} total={courseModules.length} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courseModules.map((module) => {
          const status = getModuleStatus(module.id);
          const unlocked = isModuleUnlocked(module.id);
          
          // Un módulo está disponible para el alumno si está OPEN y el alumno lo desbloqueó
          const canAccess = status === 'OPEN' && unlocked;

          return (
            <div key={module.id} className="relative h-full">
              {!canAccess && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-xl border border-gray-200 p-6 text-center">
                  <div className="bg-white p-4 rounded-full shadow-md mb-3">
                    {status === 'CLOSED' ? (
                      <AlertTriangle className="w-8 h-8 text-yellow-500" />
                    ) : (
                      <Lock className="w-8 h-8 text-gray-500" />
                    )}
                  </div>
                  
                  <p className="font-bold text-gray-800 text-lg mb-1">
                    {status === 'CLOSED' ? 'Módulo Cerrado' : 'Acceso Denegado'}
                  </p>
                  
                  <p className="text-sm text-gray-600">
                    {status === 'LOCKED' && 'Próximamente. El profesor aún no ha abierto este módulo.'}
                    {status === 'CLOSED' && 'Este módulo ha sido cerrado por el profesor.'}
                    {status === 'OPEN' && !unlocked && 'El módulo está abierto, pero requieres registrar asistencia o solicitar acceso manual.'}
                  </p>
                </div>
              )}
              
              {/* Para ModuleCard pasamos isCompleted (si lo desbloqueó y lo vio) */}
              {/* Aquí isCompleted se traduce a 'unlocked' para mostrar el check visual */}
              <div className="h-full">
                <ModuleCard
                  module={module}
                  isCompleted={unlocked}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
