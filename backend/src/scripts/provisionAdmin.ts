import bcrypt from 'bcryptjs';
import { query, pool } from '../db/index.js';
import { getEnv } from '../config/env.js';

async function provisionAdmin() {
  try {
    const env = getEnv();
    const adminEmail = (process.env.ADMIN_EMAIL || env.ADMIN_EMAIL).trim().toLowerCase();
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD?.trim();

    if (!adminPassword || adminPassword.length < 8) {
      console.error('❌ [ERROR] Debe especificar la variable ADMIN_INITIAL_PASSWORD (mínimo 8 caracteres) para aprovisionar la cuenta del docente.');
      console.error('Ejemplo de uso seguro:');
      console.error('  ADMIN_INITIAL_PASSWORD="ClaveSeguraDocente123!" npm run provision:admin');
      process.exit(1);
    }

    const name = process.env.ADMIN_NAME || 'Docente';
    const lastName = process.env.ADMIN_LAST_NAME || 'Curso Java';

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const existingRes = await query('SELECT id, email, role FROM users WHERE email = $1', [adminEmail]);

    if (existingRes.rows.length > 0) {
      const user = existingRes.rows[0];
      await query(
        'UPDATE users SET role = $1, password = $2, name = $3, last_name = $4 WHERE id = $5',
        ['ADMIN', hashedPassword, name, lastName, user.id]
      );
      console.log(`✅ Cuenta del docente (${adminEmail}) actualizada exitosamente con rol técnico ADMIN.`);
    } else {
      await query(
        `INSERT INTO users (email, password, name, last_name, role)
         VALUES ($1, $2, $3, $4, 'ADMIN')`,
        [adminEmail, hashedPassword, name, lastName]
      );
      console.log(`✅ Cuenta del docente (${adminEmail}) creada exitosamente con rol técnico ADMIN.`);
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el aprovisionamiento de la cuenta del docente:', error);
    process.exit(1);
  }
}

provisionAdmin();
