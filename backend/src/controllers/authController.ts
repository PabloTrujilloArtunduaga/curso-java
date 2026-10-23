import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, pool } from '../db/index.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';
import { getEnv } from '../config/env.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, lastName, phone } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Todos los campos obligatorios deben completarse.' });
    }

    if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ message: 'Formato de correo electrónico inválido.' });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'El nombre es obligatorio.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim().slice(0, 100);
    const cleanLastName = typeof lastName === 'string' ? lastName.trim().slice(0, 100) : null;
    const cleanPhone = typeof phone === 'string' ? phone.trim().slice(0, 50) : null;

    const { ADMIN_EMAIL, JWT_SECRET } = getEnv();

    // Protección contra apropiación de la cuenta del docente
    if (cleanEmail === ADMIN_EMAIL) {
      return res.status(400).json({
        message: 'Este correo está reservado para el docente del curso y debe ser aprovisionado mediante el procedimiento seguro del servidor.'
      });
    }

    // Ningún registro público puede asignarse el rol ADMIN; siempre es STUDENT
    const assignedRole = 'STUDENT';

    // Verificación atómica de cupo e inserción con transacción y advisory lock para prevenir race conditions
    const client = await pool.connect();
    let user;
    try {
      await client.query('BEGIN');
      // Adquirir bloqueo consultivo a nivel de transacción para serializar concurrentes en el cupo
      await client.query('SELECT pg_advisory_xact_lock(2026102201)');

      // Verificar cupo de estudiantes
      const countRes = await client.query(
        `SELECT COUNT(*) FROM users WHERE role = 'STUDENT'`
      );
      const studentCount = parseInt(countRes.rows[0].count, 10);

      if (studentCount >= 20) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'El curso ha alcanzado la capacidad máxima de 20 estudiantes.' });
      }

      // Verificar si el correo ya existe
      const existing = await client.query(`SELECT id FROM users WHERE email = $1`, [cleanEmail]);
      if (existing.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'El correo electrónico ya se encuentra registrado.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const insertRes = await client.query(
        `INSERT INTO users (email, password, name, last_name, phone, role)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, email, name, last_name, phone, role, created_at`,
        [cleanEmail, hashedPassword, cleanName, cleanLastName, cleanPhone, assignedRole]
      );

      await client.query('COMMIT');
      user = insertRes.rows[0];
    } catch (txError) {
      await client.query('ROLLBACK').catch(() => {});
      throw txError;
    } finally {
      client.release();
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d', algorithm: 'HS256' }
    );

    return res.status(201).json({
      message: 'Registro exitoso.',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error: any) {
    console.error('Error en register:', error);
    return res.status(500).json({ message: 'Error interno en el servidor.' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Por favor ingresa correo y contraseña.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const userRes = await query(`SELECT * FROM users WHERE email = $1`, [cleanEmail]);
    
    if (userRes.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales incorrectas.' });
    }

    const user = userRes.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales incorrectas.' });
    }

    const { JWT_SECRET } = getEnv();
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d', algorithm: 'HS256' }
    );

    return res.json({
      message: 'Inicio de sesión exitoso.',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error: any) {
    console.error('Error en login:', error);
    return res.status(500).json({ message: 'Error interno en el servidor.' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'No autenticado' });

    const userRes = await query(`SELECT id, email, name, last_name, phone, role FROM users WHERE id = $1`, [req.user.id]);
    if (userRes.rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

    const user = userRes.rows[0];
    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener usuario' });
  }
};
