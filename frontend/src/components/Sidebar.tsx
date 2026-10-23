import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { courseModules } from '../data/courseData';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Circle, Lock, ShieldCheck } from 'lucide-react';
import type { ModuleLock, AttendanceRecord } from '../types';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const [locks, setLocks] = useState<ModuleLock[]>([]);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    const loadSidebarData = async () => {
      const l = await api.getModuleLocks();
      setLocks(l);
      if (user) {
        const a = await api.getStudentAttendances();
        setAttendances(a);
      }
    };
    loadSidebarData();
  }, [user]);

  const isAdmin = user?.role === 'ADMIN';

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-[calc(100vh-4rem)] overflow-y-auto sticky top-16 hidden md:block shrink-0">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Plan de Estudio
          </span>
          {isAdmin && (
            <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-blue-100">
              <ShieldCheck className="w-3 h-3" /> Docente
            </span>
          )}
        </div>
        <nav className="space-y-1">
          {courseModules.map((module) => {
            const completed = attendances.some(a => a.moduleId === module.id);
            const lock = locks.find(l => l.moduleId === module.id);
            const isOpen = lock ? lock.status === 'OPEN' : false;
            const canAccess = isAdmin || isOpen;

            return (
              <NavLink
                key={module.id}
                to={`/module/${module.id}`}
                onClick={(e) => {
                  if (!canAccess) e.preventDefault();
                }}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                    !canAccess
                      ? 'text-slate-400 opacity-60 cursor-not-allowed hover:bg-transparent'
                      : isActive
                      ? 'bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                {!canAccess ? (
                  <Lock className="mr-2.5 h-4 w-4 text-slate-400 flex-shrink-0" />
                ) : completed ? (
                  <CheckCircle className="mr-2.5 h-4 w-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <Circle className="mr-2.5 h-4 w-4 text-slate-300 group-hover:text-slate-400 flex-shrink-0" />
                )}
                <div className="truncate flex flex-col">
                  <span className="truncate">Semana {module.id}</span>
                  <span className="text-[10px] font-normal text-slate-500 truncate">{module.title}</span>
                </div>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
