-- NEON DATABASE POSTGRESQL SCHEMA FOR JAVA COURSE PLATFORM

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  phone VARCHAR(50),
  role VARCHAR(20) NOT NULL DEFAULT 'STUDENT', -- 'ADMIN' or 'STUDENT'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Modules Table
CREATE TABLE IF NOT EXISTS modules (
  id INT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'LOCKED', -- 'LOCKED', 'OPEN', 'CLOSED'
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial 5 modules if not present
INSERT INTO modules (id, title, description, status) VALUES
  (1, 'Fundamentos de Java', 'JDK, JVM, JRE, Variables, Tipos de Datos y Operadores', 'LOCKED'),
  (2, 'Control de flujo', 'Estructuras Condicionales y Ciclos Iterativos', 'LOCKED'),
  (3, 'Métodos y estructuras', 'Modularización, Arrays y ArrayList', 'LOCKED'),
  (4, 'Programación Orientada a Objetos', 'Clases, Objetos, Encapsulamiento, Herencia y Polimorfismo', 'LOCKED'),
  (5, 'Proyecto final', 'Manejo de Excepciones, Buenas Prácticas y Entrega Final', 'LOCKED')
ON CONFLICT (id) DO NOTHING;

-- 4. Attendance Sessions Table (Managed by Admin per Module)
CREATE TABLE IF NOT EXISTS attendance_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id INT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 5. Attendances Table (Recorded when Student scans QR)
CREATE TABLE IF NOT EXISTS attendances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  module_id INT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_student_session UNIQUE (student_id, session_id),
  CONSTRAINT unique_student_module UNIQUE (student_id, module_id)
);

-- 6. Manual Access Table (Admin overriding attendance for a student)
CREATE TABLE IF NOT EXISTS manual_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module_id INT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_student_manual_module UNIQUE (student_id, module_id)
);
