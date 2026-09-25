import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { courseModules } from '../data/courseData';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Circle, Lock } from 'lucide-react';
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

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-[calc(100vh-4rem)] overflow-y-auto sticky top-16 hidden md:block">
      <div className="p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Curso de Java
        </h3>
        <nav className="space-y-1">
          {courseModules.map((module) => {
            const completed = attendances.some(a => a.moduleId === module.id);
            const lock = locks.find(l => l.moduleId === module.id);
            const isOpen = lock ? lock.status === 'OPEN' : false;
            
            return (
              <NavLink
                key={module.id}
                to={`/module/${module.id}`}
                onClick={(e) => {
                  if (!isOpen) e.preventDefault();
                }}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    !isOpen ? 'opacity-50 cursor-not-allowed text-gray-400' :
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`
                }
              >
                {!isOpen ? (
                  <Lock className="mr-3 h-5 w-5 flex-shrink-0" />
                ) : completed ? (
                  <CheckCircle className="mr-3 h-5 w-5 text-green-500 flex-shrink-0" />
                ) : (
                  <Circle className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 flex-shrink-0" />
                )}
                <span className="truncate">
                  Módulo {module.id}
                </span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
