import dotenv from 'dotenv';
dotenv.config();

export const INSECURE_DEFAULT_SECRET = 'super_secret_jwt_key_java_course_2026';

export interface AppConfig {
  JWT_SECRET: string;
  PORT: number;
  DATABASE_URL: string;
  ADMIN_EMAIL: string;
  NODE_ENV: string;
  CORS_ORIGIN: string;
}

export function validateEnv(envSource: Record<string, string | undefined> = process.env): AppConfig {
  const jwtSecret = envSource.JWT_SECRET?.trim();
  const nodeEnv = envSource.NODE_ENV || 'development';

  if (!jwtSecret) {
    throw new Error(
      '❌ [SEGURIDAD] Variable de entorno JWT_SECRET no configurada.\n' +
      'Por seguridad, debe configurar JWT_SECRET en su archivo .env.\n' +
      'Puede generar una clave segura de 32 bytes ejecutando:\n' +
      '  node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"\n'
    );
  }

  if (jwtSecret === INSECURE_DEFAULT_SECRET) {
    throw new Error(
      '❌ [SEGURIDAD] JWT_SECRET contiene el valor inseguro por defecto.\n' +
      'Debe reemplazarlo en el archivo .env por una clave aleatoria y secreta de al menos 32 caracteres.\n'
    );
  }

  if (jwtSecret.length < 32) {
    throw new Error(
      `❌ [SEGURIDAD] JWT_SECRET es demasiado corto (${jwtSecret.length} caracteres). Se requiere un mínimo de 32 caracteres para asegurar la entropía adecuada.\n`
    );
  }

  return {
    JWT_SECRET: jwtSecret,
    PORT: envSource.PORT ? parseInt(envSource.PORT, 10) : 3000,
    DATABASE_URL: envSource.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/javacourse',
    ADMIN_EMAIL: (envSource.ADMIN_EMAIL || 'u20232218369@usco.edu.co').trim().toLowerCase(),
    NODE_ENV: nodeEnv,
    CORS_ORIGIN: (envSource.CORS_ORIGIN || envSource.FRONTEND_URL || 'http://localhost:5173').trim()
  };
}

let cachedEnv: AppConfig | null = null;

export const getEnv = (): AppConfig => {
  if (!cachedEnv) {
    cachedEnv = validateEnv(process.env);
  }
  return cachedEnv;
};
