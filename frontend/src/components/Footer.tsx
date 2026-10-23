import React from 'react';
import { Code } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2.5">
            <div className="bg-slate-900 text-white p-1 rounded-md">
              <Code className="h-4 w-4" />
            </div>
            <span className="font-semibold text-slate-800 tracking-tight">JavaEdu</span>
            <span className="text-slate-300">|</span>
            <span>Universidad Surcolombiana</span>
          </div>
          <p className="text-center sm:text-right text-slate-500">
            &copy; {new Date().getFullYear()} Curso Presencial de Java (10 Horas). Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
