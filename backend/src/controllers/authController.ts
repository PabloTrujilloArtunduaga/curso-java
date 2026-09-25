import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db/index.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, lastName, phone } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Todos los campos obligatorios deben completarse.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const isAdminEmail = cleanEmail === 'u20232218369@usco.edu.co' || cleanEmail.includes('admin');
    const assignedRole = isAdminEmail ? 'ADMIN' : 'STUDENT';

    // Only count regular students towards capacity
    if (!isAdminEmail) {
      const countRes = await query(
        `SELECT COUNT(*) FROM users WHERE role = 'STUDENT' AND email != 'u20232218369@usco.edu.co'`
      );
      const studentCount = parseInt(countRes.rows[0].count, 10);

      if (studentCount >= 20) {
        return res.status(400).json({ message: 'El curso ha alcanzado la capacidad máxima de 20 estudiantes.' });
      }
    }

    // Check if email exists
    const existing = await query(`SELECT id FROM users WHERE email = $1`, [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'El correo electrónico ya se encuentra registrado.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertRes = await query(
      `INSERT INTO users (email, password, name, last_name, phone, role) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, email, name, last_name, phone, role, created_at`,
      [cleanEmail, hashedPassword, name, lastName || null, phone || null, assignedRole]
    );

    const user = insertRes.rows[0];

    const jwtSecret = process.env.JWT_SECRET || 'super_secret_jwt_key_java_course_2026';
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      jwtSecret,
      { expiresIn: '7d' }
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

    if (!email || !password) {
      return res.status(400).json({ message: 'Por favor ingresa correo y contraseña.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const userRes = await query(`SELECT * FROM users WHERE email = $1`, [cleanEmail]);
    
    if (userRes.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales incorrectas.' });
    }

    const user = userRes.rows[0];

    // If it's the admin email, ensure role is ADMIN in DB
    if (cleanEmail === 'u20232218369@usco.edu.co' && user.role !== 'ADMIN') {
      await query(`UPDATE users SET role = 'ADMIN' WHERE id = $1`, [user.id]);
      user.role = 'ADMIN';
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales incorrectas.' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'super_secret_jwt_key_java_course_2026';
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      jwtSecret,
      { expiresIn: '7d' }
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
