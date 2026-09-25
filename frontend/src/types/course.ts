export interface CourseModule {
  id: number;
  title: string;
  description: string;
  objectives: string[];
  topics: string[];
  content: {
    theory: string;
    codeExample?: string;
    explanation?: string;
    exercises: string[];
    practicalProject: string;
  };
}
