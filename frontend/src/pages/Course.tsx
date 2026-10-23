import { useState, useEffect } from 'react';
import { courseModules } from '../data/courseData';
import { ModuleCard } from '../components/ModuleCard';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { ModuleLock, AttendanceRecord, ManualAccess } from '../types';
import { ProgressBar } from '../components/ProgressBar';
import { Lock, AlertTriangle, BookOpen, ShieldCheck } from 'lucide-react';

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

  const isAdmin = user?.role === 'ADMIN';

  const getAccessibleCount = () => {
    if (isAdmin) return courseModules.length;
    return courseModules.filter(m => getModuleStatus(m.id) === 'OPEN' && isModuleUnlocked(m.id)).length;
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Course Header Banner */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                  <BookOpen className="w-3.5 h-3.5" /> Plan Curricular
                </span>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800">
                    <ShieldCheck className="w-3.5 h-3.5" /> Modo Docente (Acceso Total)
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Módulos del Curso de Java
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                El docente habilita los módulos progresivamente cada semana. Para ingresar a cada contenido debes registrar tu asistencia presencial mediante el código QR proyectado en clase.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 max-w-sm w-full shadow-2xs">
              <ProgressBar completed={getAccessibleCount()} total={courseModules.length} />
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courseModules.map((module) => {
            const status = getModuleStatus(module.id);
            const unlocked = isModuleUnlocked(module.id);

            // Un módulo está disponible para el alumno si está OPEN y el alumno lo desbloqueó (o es docente)
            const canAccess = isAdmin || (status === 'OPEN' && unlocked);

            return (
              <div key={module.id} className="relative h-full">
                {!canAccess && (
                  <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center rounded-xl p-6 text-center text-white shadow-xs">
                    <div className="bg-slate-800 p-3.5 rounded-full border border-slate-700 shadow-md mb-3">
                      {status === 'CLOSED' ? (
                        <AlertTriangle className="w-6 h-6 text-amber-400" />
                      ) : (
                        <Lock className="w-6 h-6 text-slate-300" />
                      )}
                    </div>

                    <p className="font-bold text-white text-base mb-1">
                      {status === 'CLOSED' ? 'Módulo Cerrado' : 'Acceso Restringido'}
                    </p>

                    <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
                      {status === 'LOCKED' && 'Próximamente. El docente aún no ha abierto este módulo.'}
                      {status === 'CLOSED' && 'Este módulo ha sido cerrado por el docente.'}
                      {status === 'OPEN' && !unlocked && 'El módulo está habilitado, pero requieres registrar tu asistencia presencial con el código QR.'}
                    </p>
                  </div>
                )}

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
      </main>
    </div>
  );
};
