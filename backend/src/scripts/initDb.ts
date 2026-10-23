import { initDb, pool } from '../db/index.js';

async function run() {
  console.log('🔄 Iniciando despliegue de esquema en la base de datos Neon PostgreSQL...');
  try {
    await initDb({ throwOnError: true });
    console.log('✅ Esquema desplegado exitosamente.');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fatal al inicializar la base de datos:', error);
    await pool.end().catch(() => {});
    process.exit(1);
  }
}

run();
