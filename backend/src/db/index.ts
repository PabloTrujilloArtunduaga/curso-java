import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

export const pool = new Pool({
  connectionString: connectionString || 'postgresql://postgres:postgres@localhost:5432/javacourse',
  ssl: connectionString?.includes('neon.tech') ? { rejectUnauthorized: false } : false
});

export const query = async (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export const getClient = async (): Promise<PoolClient> => {
  return pool.connect();
};

export function resolveInitSqlPath(): string | null {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.join(currentDir, 'init.sql'),
    path.resolve(currentDir, '../../src/db/init.sql'),
    path.resolve(process.cwd(), 'src/db/init.sql'),
    path.resolve(process.cwd(), 'dist/db/init.sql'),
    path.resolve(process.cwd(), 'backend/src/db/init.sql'),
    path.resolve(process.cwd(), 'backend/dist/db/init.sql')
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

export const initDb = async (options: { throwOnError?: boolean } = {}) => {
  try {
    const initSqlPath = resolveInitSqlPath();
    if (initSqlPath) {
      const sql = fs.readFileSync(initSqlPath, 'utf8');
      await pool.query(sql);
      console.log(`✅ Neon Database initialized successfully with schema from: ${initSqlPath}`);
    } else {
      const msg = '⚠️ No se encontró el archivo init.sql en ninguna de las rutas esperadas.';
      console.warn(msg);
      if (options.throwOnError) {
        throw new Error(msg);
      }
    }
  } catch (err: any) {
    console.warn('⚠️ Database initialization warning:', err.message || err);
    console.warn('Ensure your DATABASE_URL environment variable is set to a valid Neon PostgreSQL connection string.');
    if (options.throwOnError) {
      throw err;
    }
  }
};
