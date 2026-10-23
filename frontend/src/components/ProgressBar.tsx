import React from 'react';

interface ProgressBarProps {
  completed: number;
  total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ completed, total }) => {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="w-full" role="region" aria-label="Progreso general del curso">
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-xs font-semibold text-slate-700">Progreso general</span>
        <span className="text-xs font-bold text-blue-600">{percentage}%</span>
      </div>
      <div
        className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2">
        <span>{completed} de {total} módulos habilitados</span>
        {percentage === 100 && (
          <span className="text-emerald-600 font-semibold">¡Completado!</span>
        )}
      </div>
    </div>
  );
};
