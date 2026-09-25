import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

export const pool = new Pool({
  connectionString: connectionString || 'postgresql://postgres:postgres@localhost:5432/javacourse',
  ssl: connectionString?.includes('neon.tech') ? { rejectUnauthorized: false } : false
});

export const query = async (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export const initDb = async () => {
  try {
    const initSqlPath = path.join(__dirname, 'init.sql');
    if (fs.existsSync(initSqlPath)) {
      const sql = fs.readFileSync(initSqlPath, 'utf8');
      await pool.query(sql);
      console.log('✅ Neon Database initialized successfully with schema!');
    }
  } catch (err: any) {
    console.warn('⚠️ Database initialization warning:', err.message || err);
    console.warn('Ensure your DATABASE_URL environment variable is set to a valid Neon PostgreSQL connection string.');
  }
};
