import React from 'react';
import { Link } from 'react-router-dom';
import type { CourseModule } from '../types/course';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';

interface ModuleCardProps {
  module: CourseModule;
  isCompleted: boolean;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({ module, isCompleted }) => {
  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-200 flex flex-col h-full overflow-hidden">
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-100">
            Semana {module.id}
          </span>
          {isCompleted ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <CheckCircle className="h-4 w-4" />
              <span>Desbloqueado</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
              <Circle className="h-4 w-4" />
              <span>Pendiente</span>
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">{module.title}</h3>
        <p className="text-xs text-slate-600 mb-4 line-clamp-2 leading-relaxed">{module.description}</p>
        
        <div className="mt-auto pt-4 border-t border-slate-100">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Temas principales:</h4>
          <ul className="space-y-1.5">
            {module.topics.slice(0, 3).map((topic, index) => (
              <li key={index} className="text-xs text-slate-700 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0"></span>
                <span className="truncate">{topic}</span>
              </li>
            ))}
            {module.topics.length > 3 && (
              <li className="text-[11px] text-slate-400 italic pl-3.5">
                +{module.topics.length - 3} temas adicionales
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200">
        <Link
          to={`/module/${module.id}`}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-xs"
        >
          {isCompleted ? 'Repasar módulo' : 'Comenzar módulo'}
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
