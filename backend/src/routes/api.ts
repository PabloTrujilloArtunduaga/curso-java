import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { getModules, updateModuleStatus } from '../controllers/moduleController.js';
import {
  createSession,
  closeSession,
  getActiveSession,
  registerAttendance,
  getAttendances,
  grantManualAccess,
  getManualAccesses
} from '../controllers/attendanceController.js';
import { getStudents, getStudentsCount } from '../controllers/studentController.js';
import { authenticateToken, requireRole } from '../middlewares/auth.js';

const router = Router();

// Public Auth Routes
router.post('/auth/register', register);
router.post('/auth/login', login);

// Protected User Routes
router.get('/auth/me', authenticateToken, getMe);

// Modules
router.get('/modules', authenticateToken, getModules);
router.patch('/modules/:id/status', authenticateToken, requireRole('ADMIN'), updateModuleStatus);

// Attendance Sessions (Admin manages, Student reads active)
router.post('/attendance-sessions', authenticateToken, requireRole('ADMIN'), createSession);
router.patch('/attendance-sessions/:id/close', authenticateToken, requireRole('ADMIN'), closeSession);
router.get('/attendance-sessions/active/:moduleId', authenticateToken, getActiveSession);

// Student Registers Attendance via scanning Admin's QR Token
router.post('/attendance/register', authenticateToken, requireRole('STUDENT'), registerAttendance);

// Attendance Records
router.get('/attendance', authenticateToken, getAttendances);
router.post('/manual-access', authenticateToken, requireRole('ADMIN'), grantManualAccess);
router.get('/manual-access', authenticateToken, getManualAccesses);

// Student listing
router.get('/students', authenticateToken, requireRole('ADMIN'), getStudents);
router.get('/students/count', getStudentsCount); // Public capacity check for registration

export default router;
