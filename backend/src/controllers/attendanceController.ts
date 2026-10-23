import { Response } from 'express';
import { query } from '../db/index.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';
import { cryptoNative } from '../utils/crypto.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const createSession = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rawModuleId = req.body.moduleId;
    const moduleId = Number(rawModuleId);
    const durationSeconds = req.body.durationSeconds !== undefined ? Number(req.body.durationSeconds) : 60;

    if (!Number.isInteger(moduleId) || moduleId < 1 || moduleId > 5) {
      return res.status(400).json({ message: 'Identificador de módulo inválido (debe ser del 1 al 5).' });
    }

    if (!Number.isInteger(durationSeconds) || durationSeconds < 10 || durationSeconds > 600) {
      return res.status(400).json({ message: 'La duración de la sesión debe ser un entero entre 10 y 600 segundos.' });
    }

    // Inactivate existing sessions for this module
    await query(`UPDATE attendance_sessions SET is_active = FALSE WHERE module_id = $1`, [moduleId]);

    const token = cryptoNative.randomUUID();
    const expiresAt = new Date(Date.now() + durationSeconds * 1000);

    const insertRes = await query(
      `INSERT INTO attendance_sessions (module_id, token, is_active, expires_at)
       VALUES ($1, $2, TRUE, $3)
       RETURNING id, module_id as "moduleId", token, is_active as "isActive", created_at as "createdAt", expires_at as "expiresAt"`,
      [moduleId, token, expiresAt]
    );

    return res.status(201).json(insertRes.rows[0]);
  } catch (error) {
    console.error('Error al crear sesión de asistencia:', error);
    return res.status(500).json({ message: 'Error interno al crear sesión.' });
  }
};

export const closeSession = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || !UUID_REGEX.test(id)) {
      return res.status(400).json({ message: 'Identificador de sesión inválido.' });
    }
    await query(`UPDATE attendance_sessions SET is_active = FALSE WHERE id = $1`, [id]);
    return res.json({ message: 'Sesión de asistencia desactivada.' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al cerrar sesión de asistencia.' });
  }
};

export const getActiveSession = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const moduleId = parseInt(req.params.moduleId, 10);
    if (isNaN(moduleId) || moduleId < 1 || moduleId > 5) {
      return res.status(400).json({ message: 'Identificador de módulo inválido.' });
    }

    const sessionRes = await query(
      `SELECT id, module_id as "moduleId", token, is_active as "isActive", created_at as "createdAt", expires_at as "expiresAt"
       FROM attendance_sessions
       WHERE module_id = $1 AND is_active = TRUE AND expires_at > CURRENT_TIMESTAMP
       ORDER BY created_at DESC LIMIT 1`,
      [moduleId]
    );

    if (sessionRes.rows.length === 0) {
      return res.json(null);
    }

    return res.json(sessionRes.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Error al buscar sesión activa.' });
  }
};

// STUDENT SCANS THE QR TOKEN
export const registerAttendance = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    const rawToken = req.body.token;

    if (!studentId || !UUID_REGEX.test(studentId)) {
      return res.status(401).json({ message: 'Identificador de estudiante inválido o no autenticado.' });
    }

    if (typeof rawToken !== 'string' || rawToken.trim().length < 10 || rawToken.trim().length > 255) {
      return res.status(400).json({ message: 'Token de asistencia requerido con formato válido.' });
    }

    const token = rawToken.trim();

    // 1. Verify token & active session
    const sessionRes = await query(
      `SELECT * FROM attendance_sessions WHERE token = $1`,
      [token]
    );

    if (sessionRes.rows.length === 0) {
      return res.status(404).json({ message: 'El código QR es inválido o no existe.' });
    }

    const session = sessionRes.rows[0];

    if (!session.is_active) {
      return res.status(400).json({ message: 'Esta sesión de asistencia ya fue desactivada por el docente.' });
    }

    if (new Date(session.expires_at) < new Date()) {
      return res.status(400).json({ message: 'Este código QR ha expirado.' });
    }

    // 2. Check if student already registered for this session or module
    const existingRes = await query(
      `SELECT id FROM attendances WHERE student_id = $1 AND module_id = $2`,
      [studentId, session.module_id]
    );

    if (existingRes.rows.length > 0) {
      return res.status(400).json({ message: 'Ya registraste tu asistencia para este módulo.' });
    }

    // 3. Register attendance
    await query(
      `INSERT INTO attendances (student_id, session_id, module_id) VALUES ($1, $2, $3)`,
      [studentId, session.id, session.module_id]
    );

    return res.status(201).json({ message: '✓ Asistencia registrada correctamente.' });

  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Ya registraste tu asistencia para este módulo.' });
    }
    console.error('Error al registrar asistencia:', error);
    return res.status(500).json({ message: 'Error al registrar asistencia.' });
  }
};

export const getAttendances = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role === 'ADMIN') {
      const allRes = await query(
        `SELECT a.id, a.student_id as "studentId", a.module_id as "moduleId", a.created_at as "timestamp",
                u.name as "studentName", u.email as "studentEmail"
         FROM attendances a
         JOIN users u ON a.student_id = u.id`
      );
      return res.json(allRes.rows);
    } else {
      const studentRes = await query(
        `SELECT id, student_id as "studentId", module_id as "moduleId", created_at as "timestamp"
         FROM attendances WHERE student_id = $1`,
        [req.user?.id]
      );
      return res.json(studentRes.rows);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener asistencias.' });
  }
};

export const grantManualAccess = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminId = req.user?.id;
    const { studentId, moduleId: rawModuleId, reason } = req.body;

    const moduleId = Number(rawModuleId);

    if (!studentId || typeof studentId !== 'string' || !UUID_REGEX.test(studentId)) {
      return res.status(400).json({ message: 'Identificador de estudiante inválido.' });
    }

    if (!Number.isInteger(moduleId) || moduleId < 1 || moduleId > 5) {
      return res.status(400).json({ message: 'Identificador de módulo inválido (debe ser del 1 al 5).' });
    }

    const cleanReason = typeof reason === 'string' ? reason.trim().slice(0, 500) : null;

    await query(
      `INSERT INTO manual_access (student_id, module_id, granted_by, reason)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (student_id, module_id) DO NOTHING`,
      [studentId, moduleId, adminId, cleanReason]
    );

    return res.json({ message: 'Acceso manual concedido correctamente.' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al conceder acceso manual.' });
  }
};

export const getManualAccesses = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role === 'ADMIN') {
      const allRes = await query(
        `SELECT id, student_id as "studentId", module_id as "moduleId", granted_by as "grantedBy", reason, created_at as "grantedAt"
         FROM manual_access`
      );
      return res.json(allRes.rows);
    } else {
      const studentRes = await query(
        `SELECT id, student_id as "studentId", module_id as "moduleId", granted_by as "grantedBy", reason, created_at as "grantedAt"
         FROM manual_access WHERE student_id = $1`,
        [req.user?.id]
      );
      return res.json(studentRes.rows);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener accesos manuales.' });
  }
};
