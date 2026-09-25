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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
            Módulo {module.id}
          </div>
          {isCompleted ? (
            <CheckCircle className="h-6 w-6 text-green-500" />
          ) : (
            <Circle className="h-6 w-6 text-gray-300" />
          )}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{module.title}</h3>
        <p className="text-sm text-gray-600 mb-4">{module.description}</p>
        
        <div className="mt-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Temas principales:</h4>
          <ul className="space-y-1">
            {module.topics.slice(0, 4).map((topic, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span className="truncate">{topic}</span>
              </li>
            ))}
            {module.topics.length > 4 && (
              <li className="text-sm text-gray-500 italic mt-1">
                + {module.topics.length - 4} temas más...
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <Link
          to={`/module/${module.id}`}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isCompleted ? 'Repasar módulo' : 'Comenzar módulo'}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
