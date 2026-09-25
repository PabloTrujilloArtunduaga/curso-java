import type { ModuleLock, AttendanceRecord, User, ModuleStatusType, ManualAccess, QRToken } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const api = {
  // Modules
  getModuleLocks: async (): Promise<ModuleLock[]> => {
    try {
      const res = await fetch(`${API_BASE}/modules`, { headers: getHeaders() });
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  updateModuleStatus: async (moduleId: number, status: ModuleStatusType): Promise<ModuleLock[]> => {
    try {
      const res = await fetch(`${API_BASE}/modules/${moduleId}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  // Attendance Sessions (Admin generates QR token)
  createAttendanceSession: async (moduleId: number, durationSeconds: number = 60): Promise<QRToken | null> => {
    try {
      const res = await fetch(`${API_BASE}/attendance-sessions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ moduleId, durationSeconds })
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  closeAttendanceSession: async (sessionId: string): Promise<void> => {
    try {
      await fetch(`${API_BASE}/attendance-sessions/${sessionId}/close`, {
        method: 'PATCH',
        headers: getHeaders()
      });
    } catch (e) {
      console.error(e);
    }
  },

  getActiveAttendanceSession: async (moduleId: number): Promise<QRToken | null> => {
    try {
      const res = await fetch(`${API_BASE}/attendance-sessions/active/${moduleId}`, { headers: getHeaders() });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  // Attendance Registration (Student scans Admin's QR token)
  registerAttendance: async (token: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`${API_BASE}/attendance/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ token })
      });
      const data = await res.json();
      return { success: res.ok, message: data.message };
    } catch (e) {
      return { success: false, message: 'Error de conexión con el servidor.' };
    }
  },

  getStudentAttendances: async (): Promise<AttendanceRecord[]> => {
    try {
      const res = await fetch(`${API_BASE}/attendance`, { headers: getHeaders() });
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      return [];
    }
  },

  getAllAttendances: async (): Promise<AttendanceRecord[]> => {
    try {
      const res = await fetch(`${API_BASE}/attendance`, { headers: getHeaders() });
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      return [];
    }
  },

  // Manual Access
  grantManualAccess: async (studentId: string, moduleId: number, reason?: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/manual-access`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ studentId, moduleId, reason })
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  getManualAccesses: async (): Promise<ManualAccess[]> => {
    try {
      const res = await fetch(`${API_BASE}/manual-access`, { headers: getHeaders() });
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      return [];
    }
  },

  // Students & Counts
  getStudents: async (): Promise<User[]> => {
    try {
      const res = await fetch(`${API_BASE}/students`, { headers: getHeaders() });
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      return [];
    }
  },

  getStudentsCount: async (): Promise<number> => {
    try {
      const res = await fetch(`${API_BASE}/students/count`);
      if (!res.ok) return 0;
      const data = await res.json();
      return data.count || 0;
    } catch (e) {
      return 0;
    }
  }
};
