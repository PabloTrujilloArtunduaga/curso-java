export type Role = 'ADMIN' | 'STUDENT';
export type ModuleStatusType = 'LOCKED' | 'OPEN' | 'CLOSED';

export interface User {
  id: string;
  email: string;
  name: string;
  lastName?: string;
  phone?: string;
  role: Role;
}

export interface ModuleLock {
  moduleId: number;
  title?: string;
  description?: string;
  status: ModuleStatusType;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  moduleId: number;
  timestamp: string; // ISO String from DB
  studentName?: string;
  studentEmail?: string;
}

export interface QRToken {
  id: string;
  moduleId: number;
  token: string;
  isActive: boolean;
  createdAt: string;
  expiresAt: string;
}

export interface ManualAccess {
  id: string;
  studentId: string;
  moduleId: number;
  grantedBy: string;
  grantedAt: string;
  reason: string;
}
