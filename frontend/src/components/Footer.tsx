import React from 'react';
import { Code } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="bg-blue-600 p-1.5 rounded-md">
              <Code className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900 tracking-tight">JavaEdu</span>
          </div>
          <p className="text-sm text-gray-500 text-center md:text-left">
            &copy; {new Date().getFullYear()} Curso de Java. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
