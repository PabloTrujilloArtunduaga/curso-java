import { useState, useEffect } from 'react';

export const useProgress = () => {
  const [completedModules, setCompletedModules] = useState<number[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('java_course_progress');
    if (stored) {
      try {
        setCompletedModules(JSON.parse(stored));
      } catch (e) {
        console.error("Error parsing progress", e);
      }
    }
  }, []);

  const toggleModuleCompletion = (moduleId: number) => {
    setCompletedModules(prev => {
      let updated: number[];
      if (prev.includes(moduleId)) {
        updated = prev.filter(id => id !== moduleId);
      } else {
        updated = [...prev, moduleId];
      }
      localStorage.setItem('java_course_progress', JSON.stringify(updated));
      return updated;
    });
  };

  const isModuleCompleted = (moduleId: number) => {
    return completedModules.includes(moduleId);
  };

  return {
    completedModules,
    toggleModuleCompletion,
    isModuleCompleted
  };
};
