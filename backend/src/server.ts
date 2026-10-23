import express, { Request, Response } from 'express';
import cors from 'cors';
import { getEnv } from './config/env.js';
import apiRouter from './routes/api.js';
import { initDb, pool } from './db/index.js';

// Validar variables de entorno críticas al arranque
const env = getEnv();

const app = express();
const PORT = env.PORT;

// Configuración restringida de CORS
const configuredOrigins = env.CORS_ORIGIN
  .split(',')
  .map(origin => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Permitir solicitudes sin header Origin (como curl, tests locales, llamadas internas de servidor)
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.trim().replace(/\/$/, '');

    // En desarrollo, permitir cualquier puerto de localhost
    if (env.NODE_ENV === 'development' && /^http:\/\/localhost(:\d+)?$/.test(normalizedOrigin)) {
      return callback(null, true);
    }

    if (configuredOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS bloqueado: origen ${origin} no está autorizado.`));
  },
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Initialize Neon Database schema
initDb().catch((err) => {
  console.warn('⚠️ Error no crítico durante la inicialización de la base de datos:', err.message || err);
});

// API Router
app.use('/api', apiRouter);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Manejo de apagado limpio (Graceful Shutdown) para Render y contenedores Linux
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Recibida señal ${signal}. Iniciando apagado ordenado...`);

  const forceExitTimer = setTimeout(() => {
    console.error('⚠️ Apagado forzado por tiempo límite (10s).');
    process.exit(1);
  }, 10000);
  forceExitTimer.unref();

  server.close(async (err) => {
    if (err) {
      console.error('❌ Error al cerrar el servidor HTTP:', err);
    } else {
      console.log('✅ Servidor HTTP cerrado correctamente.');
    }

    try {
      await pool.end();
      console.log('✅ Pool de conexiones PostgreSQL cerrado correctamente.');
      clearTimeout(forceExitTimer);
      process.exit(0);
    } catch (poolErr) {
      console.error('❌ Error al cerrar el pool PostgreSQL:', poolErr);
      clearTimeout(forceExitTimer);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
