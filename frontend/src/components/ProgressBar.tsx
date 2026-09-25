import React from 'react';

interface ProgressBarProps {
  completed: number;
  total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ completed, total }) => {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">Progreso del curso</span>
        <span className="text-sm font-medium text-gray-700">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        {completed} de {total} módulos completados
      </p>
    </div>
  );
};
