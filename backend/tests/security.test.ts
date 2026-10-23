import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { validateEnv } from '../dist/config/env.js';
import { resolveInitSqlPath } from '../dist/db/index.js';
import { authenticateToken, requireRole } from '../dist/middlewares/auth.js';
import { register } from '../dist/controllers/authController.js';
import { updateModuleStatus } from '../dist/controllers/moduleController.js';
import {
  createSession,
  closeSession,
  registerAttendance,
  grantManualAccess
} from '../dist/controllers/attendanceController.js';
import type { Request, Response, NextFunction } from 'express';

const SECURE_TEST_SECRET = 'a_very_secure_test_jwt_secret_with_more_than_32_characters_12345';
const TEST_ADMIN_EMAIL = 'u20232218369@usco.edu.co';

function createMockRes() {
  let statusCode = 200;
  let jsonBody: any = null;
  const res: any = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(body: any) {
      jsonBody = body;
      return this;
    },
    getStatus: () => statusCode,
    getBody: () => jsonBody
  };
  return res;
}

describe('1. Environment Configuration & JWT Secret Validation (Real Env Module)', () => {
  it('should reject missing JWT_SECRET', () => {
    assert.throws(
      () => validateEnv({}),
      /JWT_SECRET no configurada/
    );
  });

  it('should reject insecure default JWT_SECRET', () => {
    assert.throws(
      () => validateEnv({ JWT_SECRET: 'super_secret_jwt_key_java_course_2026' }),
      /JWT_SECRET contiene el valor inseguro por defecto/
    );
  });

  it('should reject JWT_SECRET shorter than 32 characters', () => {
    assert.throws(
      () => validateEnv({ JWT_SECRET: 'too_short_secret' }),
      /JWT_SECRET es demasiado corto/
    );
  });

  it('should accept a secure JWT_SECRET of >= 32 characters and normalize ADMIN_EMAIL', () => {
    const env = validateEnv({
      JWT_SECRET: SECURE_TEST_SECRET,
      ADMIN_EMAIL: '  Instructor@USCO.edu.co  '
    });
    assert.equal(env.JWT_SECRET, SECURE_TEST_SECRET);
    assert.equal(env.ADMIN_EMAIL, 'instructor@usco.edu.co');
    assert.equal(env.PORT, 3000);
  });
});

describe('2. Authentication Middleware & Token Verification (Real Auth Middleware)', () => {
  before(() => {
    process.env.JWT_SECRET = SECURE_TEST_SECRET;
  });

  it('should reject requests without Authorization header (401)', () => {
    const req = { headers: {} } as Request;
    const res = createMockRes();
    let nextCalled = false;
    const next: NextFunction = () => { nextCalled = true; };

    authenticateToken(req, res as unknown as Response, next);
    assert.equal(res.getStatus(), 401);
    assert.match(res.getBody().message, /Token.*no proporcionado/);
    assert.equal(nextCalled, false);
  });

  it('should reject forged token signed with "none" algorithm (403)', () => {
    const noneHeader = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({ id: '550e8400-e29b-41d4-a716-446655440000', email: 'test@usco.edu.co', role: 'ADMIN' })).toString('base64url');
    const forgedToken = `${noneHeader}.${payload}.`;

    const req = {
      headers: { authorization: `Bearer ${forgedToken}` }
    } as Request;
    const res = createMockRes();
    let nextCalled = false;
    const next: NextFunction = () => { nextCalled = true; };

    authenticateToken(req, res as unknown as Response, next);
    assert.equal(res.getStatus(), 403);
    assert.match(res.getBody().message, /inválido o expirado/);
    assert.equal(nextCalled, false);
  });

  it('should reject token signed with different key (403)', () => {
    const foreignToken = jwt.sign(
      { id: '550e8400-e29b-41d4-a716-446655440000', email: 'test@usco.edu.co', role: 'STUDENT' },
      'another_secret_key_used_by_attacker_that_is_32_chars_long',
      { algorithm: 'HS256' }
    );

    const req = {
      headers: { authorization: `Bearer ${foreignToken}` }
    } as Request;
    const res = createMockRes();
    let nextCalled = false;
    const next: NextFunction = () => { nextCalled = true; };

    authenticateToken(req, res as unknown as Response, next);
    assert.equal(res.getStatus(), 403);
    assert.equal(nextCalled, false);
  });

  it('should reject token with malformed or invalid role (403)', () => {
    const invalidRoleToken = jwt.sign(
      { id: '550e8400-e29b-41d4-a716-446655440000', email: 'test@usco.edu.co', role: 'SUPERUSER' },
      SECURE_TEST_SECRET,
      { algorithm: 'HS256' }
    );

    const req = {
      headers: { authorization: `Bearer ${invalidRoleToken}` }
    } as Request;
    const res = createMockRes();
    let nextCalled = false;
    const next: NextFunction = () => { nextCalled = true; };

    authenticateToken(req, res as unknown as Response, next);
    assert.equal(res.getStatus(), 403);
    assert.match(res.getBody().message, /rol no válido/);
    assert.equal(nextCalled, false);
  });

  it('should accept valid token signed with configured JWT_SECRET and populate req.user', () => {
    const validToken = jwt.sign(
      { id: '550e8400-e29b-41d4-a716-446655440000', email: 'estudiante@usco.edu.co', role: 'STUDENT', name: 'Estudiante Prueba' },
      SECURE_TEST_SECRET,
      { algorithm: 'HS256', expiresIn: '1h' }
    );

    const req = {
      headers: { authorization: `Bearer ${validToken}` }
    } as any;
    const res = createMockRes();
    let nextCalled = false;
    const next: NextFunction = () => { nextCalled = true; };

    authenticateToken(req, res as unknown as Response, next);
    assert.equal(res.getStatus(), 200);
    assert.equal(nextCalled, true);
    assert.equal(req.user?.id, '550e8400-e29b-41d4-a716-446655440000');
    assert.equal(req.user?.role, 'STUDENT');
  });
});

describe('3. Role-Based Authorization Middleware (Real requireRole Middleware)', () => {
  it('should deny STUDENT access to ADMIN-only route (403)', () => {
    const req = {
      user: { id: '550e8400-e29b-41d4-a716-446655440000', email: 'student@usco.edu.co', role: 'STUDENT', name: 'Estudiante' }
    } as any;
    const res = createMockRes();
    let nextCalled = false;
    const next: NextFunction = () => { nextCalled = true; };

    requireRole('ADMIN')(req, res as unknown as Response, next);
    assert.equal(res.getStatus(), 403);
    assert.match(res.getBody().message, /Acceso denegado/);
    assert.equal(nextCalled, false);
  });

  it('should allow ADMIN access to ADMIN-only route', () => {
    const req = {
      user: { id: '550e8400-e29b-41d4-a716-446655440001', email: 'admin@usco.edu.co', role: 'ADMIN', name: 'Docente' }
    } as any;
    const res = createMockRes();
    let nextCalled = false;
    const next: NextFunction = () => { nextCalled = true; };

    requireRole('ADMIN')(req, res as unknown as Response, next);
    assert.equal(res.getStatus(), 200);
    assert.equal(nextCalled, true);
  });
});

describe('4. Public Registration Security & Defense-in-Depth (Real authController.register)', () => {
  before(() => {
    process.env.JWT_SECRET = SECURE_TEST_SECRET;
    process.env.ADMIN_EMAIL = TEST_ADMIN_EMAIL;
  });

  it('should reject public registration attempting to use ADMIN_EMAIL (Account Takeover protection)', async () => {
    const req = {
      body: {
        email: '  U20232218369@USCO.EDU.CO  ',
        password: 'passwordSeguro123',
        name: 'Atacante'
      }
    } as Request;
    const res = createMockRes();

    await register(req, res as unknown as Response);
    assert.equal(res.getStatus(), 400);
    assert.match(res.getBody().message, /reservado para el docente/);
  });

  it('should reject registration with password shorter than 6 characters', async () => {
    const req = {
      body: {
        email: 'estudiante@usco.edu.co',
        password: '12345',
        name: 'Estudiante'
      }
    } as Request;
    const res = createMockRes();

    await register(req, res as unknown as Response);
    assert.equal(res.getStatus(), 400);
    assert.match(res.getBody().message, /al menos 6 caracteres/);
  });

  it('should reject registration with invalid email format', async () => {
    const req = {
      body: {
        email: 'correo-no-valido',
        password: 'password123',
        name: 'Estudiante'
      }
    } as Request;
    const res = createMockRes();

    await register(req, res as unknown as Response);
    assert.equal(res.getStatus(), 400);
    assert.match(res.getBody().message, /correo electrónico inválido/i);
  });

  it('should reject registration when required fields are missing', async () => {
    const req = {
      body: {
        email: 'estudiante@usco.edu.co'
      }
    } as Request;
    const res = createMockRes();

    await register(req, res as unknown as Response);
    assert.equal(res.getStatus(), 400);
    assert.match(res.getBody().message, /campos obligatorios/);
  });
});

describe('5. Module Controller Input Validation (Real moduleController.updateModuleStatus)', () => {
  it('should reject module ID out of range [1, 5] (e.g. 0 or 6)', async () => {
    const req = {
      params: { id: '0' },
      body: { status: 'OPEN' }
    } as any;
    const res = createMockRes();

    await updateModuleStatus(req, res as unknown as Response);
    assert.equal(res.getStatus(), 400);
    assert.match(res.getBody().message, /módulo inválido.*1 al 5/i);
  });

  it('should reject non-integer or SQL injection module IDs', async () => {
    const req = {
      params: { id: '1; DROP TABLE users;' },
      body: { status: 'OPEN' }
    } as any;
    const res = createMockRes();

    await updateModuleStatus(req, res as unknown as Response);
    assert.equal(res.getStatus(), 400);
    assert.match(res.getBody().message, /módulo inválido.*1 al 5/i);
  });

  it('should reject invalid module status values', async () => {
    const req = {
      params: { id: '3' },
      body: { status: 'INVALID_STATUS' }
    } as any;
    const res = createMockRes();

    await updateModuleStatus(req, res as unknown as Response);
    assert.equal(res.getStatus(), 400);
    assert.match(res.getBody().message, /Estado de módulo no válido/);
  });
});

describe('6. Attendance Controller Input Validation (Real attendanceController Handlers)', () => {
  it('should reject createSession with invalid module ID', async () => {
    const req = {
      body: { moduleId: 99, durationSeconds: 60 }
    } as any;
    const res = createMockRes();

    await createSession(req, res as unknown as Response);
    assert.equal(res.getStatus(), 400);
    assert.match(res.getBody().message, /módulo inválido.*1 al 5/i);
  });

  it('should reject createSession with duration outside [10, 600]', async () => {
    const req = {
      body: { moduleId: 2, durationSeconds: 5 }
    } as any;
    const res = createMockRes();

    await createSession(req, res as unknown as Response);
    assert.equal(res.getStatus(), 400);
    assert.match(res.getBody().message, /entre 10 y 600 segundos/);
  });

  it('should reject closeSession with non-UUID identifier', async () => {
    const req = {
      params: { id: 'not-a-valid-uuid' }
    } as any;
    const res = createMockRes();

    await closeSession(req, res as unknown as Response);
    assert.equal(res.getStatus(), 400);
    assert.match(res.getBody().message, /Identificador de sesión inválido/);
  });

  it('should reject registerAttendance with token shorter than 10 characters', async () => {
    const req = {
      body: { token: 'short' },
      user: { id: '550e8400-e29b-41d4-a716-446655440000' }
    } as any;
    const res = createMockRes();

    await registerAttendance(req, res as unknown as Response);
    assert.equal(res.getStatus(), 400);
    assert.match(res.getBody().message, /Token de asistencia requerido con formato válido/);
  });

  it('should reject registerAttendance if studentId is not a valid UUID', async () => {
    const req = {
      body: { token: 'VALID_TOKEN_123456789' },
      user: { id: 'invalid-student-id' }
    } as any;
    const res = createMockRes();

    await registerAttendance(req, res as unknown as Response);
    assert.equal(res.getStatus(), 401);
    assert.match(res.getBody().message, /no autenticado|estudiante inválido/i);
  });

  it('should reject grantManualAccess with non-UUID studentId', async () => {
    const req = {
      body: {
        studentId: 'malicious-string',
        moduleId: 2,
        reason: 'Permiso'
      }
    } as any;
    const res = createMockRes();

    await grantManualAccess(req, res as unknown as Response);
    assert.equal(res.getStatus(), 400);
    assert.match(res.getBody().message, /Identificador de estudiante inválido/);
  });

  it('should reject grantManualAccess with invalid module ID', async () => {
    const req = {
      body: {
        studentId: '550e8400-e29b-41d4-a716-446655440000',
        moduleId: 10,
        reason: 'Permiso'
      }
    } as any;
    const res = createMockRes();

    await grantManualAccess(req, res as unknown as Response);
    assert.equal(res.getStatus(), 400);
    assert.match(res.getBody().message, /módulo inválido.*1 al 5/i);
  });
});

describe('7. Database Initialization & ESM Asset Resolution', () => {
  it('should successfully resolve the path to init.sql without __dirname errors', () => {
    const resolvedPath = resolveInitSqlPath();
    assert.notEqual(resolvedPath, null);
    assert.match(resolvedPath!, /init\.sql$/);
  });
});

describe('8. CORS & Staging Environment Configuration', () => {
  it('should provide default CORS_ORIGIN as http://localhost:5173 when not specified', () => {
    const config = validateEnv({
      JWT_SECRET: SECURE_TEST_SECRET
    });
    assert.equal(config.CORS_ORIGIN, 'http://localhost:5173');
  });

  it('should accept custom CORS_ORIGIN and normalize whitespace', () => {
    const config = validateEnv({
      JWT_SECRET: SECURE_TEST_SECRET,
      CORS_ORIGIN: '  https://curso-java.vercel.app  '
    });
    assert.equal(config.CORS_ORIGIN, 'https://curso-java.vercel.app');
  });

  it('should fallback to FRONTEND_URL if CORS_ORIGIN is not provided', () => {
    const config = validateEnv({
      JWT_SECRET: SECURE_TEST_SECRET,
      FRONTEND_URL: 'https://staging.vercel.app'
    });
    assert.equal(config.CORS_ORIGIN, 'https://staging.vercel.app');
  });

  it('should correctly allow configured origins and block unauthorized origins', () => {
    const allowed = 'https://curso-java.vercel.app, https://preview-123.vercel.app';
    const origins = allowed.split(',').map(o => o.trim().replace(/\/$/, ''));

    assert.equal(origins.includes('https://curso-java.vercel.app'), true);
    assert.equal(origins.includes('https://preview-123.vercel.app'), true);
    assert.equal(origins.includes('https://malicious-site.com'), false);
  });
});
