# 🎓 Plataforma de Curso de Java

Plataforma web para la gestión de un curso de **Fundamentos de Programación en Java**, diseñada para administrar módulos, estudiantes, progreso y asistencia mediante códigos QR dinámicos.

El sistema está orientado a una experiencia multiplataforma, permitiendo que el **administrador/profesor gestione el curso desde un computador** y que los **estudiantes puedan acceder desde sus dispositivos móviles**.

---

## 🚀 Características principales

### 👨‍🏫 Administración

El administrador puede:

* Iniciar sesión como administrador.
* Visualizar los estudiantes registrados.
* Gestionar los módulos del curso.
* Abrir y cerrar módulos.
* Activar y desactivar la asistencia.
* Generar y mostrar el código QR de asistencia.
* Consultar los estudiantes que registraron asistencia.
* Consultar estudiantes ausentes.
* Otorgar acceso manual a módulos cuando sea necesario.
* Consultar el progreso de los estudiantes.
* Gestionar el estado general del curso.

### 👨‍🎓 Estudiantes

Los estudiantes pueden:

* Registrarse en la plataforma.
* Iniciar sesión.
* Esperar la activación de su cuenta por parte del administrador.
* Consultar los módulos disponibles.
* Visualizar el contenido de los módulos habilitados.
* Registrar asistencia escaneando el QR mostrado por el administrador.
* Consultar su asistencia.
* Consultar su progreso en el curso.
* Completar las actividades del curso.

---

# 📱 Sistema de asistencia QR

La asistencia utiliza un sistema de **QR generado por el administrador**.

> ⚠️ El estudiante **NO genera el código QR**.

El flujo funciona de la siguiente manera:

```text
ADMINISTRADOR
     │
     ▼
Selecciona módulo
     │
     ▼
Activa asistencia
     │
     ▼
Servidor crea sesión de asistencia
     │
     ▼
Se genera QR temporal
     │
     ▼
Administrador muestra QR
     │
     ▼
ESTUDIANTE escanea QR
     │
     ▼
Servidor valida:
 ├── Usuario autenticado
 ├── Sesión activa
 ├── Token válido
 ├── Token no expirado
 └── No existe asistencia duplicada
     │
     ▼
Se registra asistencia
     │
     ▼
Administrador visualiza asistencia
```

El administrador también puede **desactivar la asistencia**, haciendo que el QR deje de ser válido.

### 🔐 Medidas de seguridad

El sistema está diseñado para reducir registros fraudulentos mediante:

* Autenticación de usuarios.
* QR generado desde el servidor.
* Tokens temporales.
* Expiración de sesiones de asistencia.
* Validación de asistencia en el backend.
* Restricción de una asistencia por estudiante y sesión.
* Validación del estado de la sesión.
* Registro de fecha y hora.
* Restricciones en la base de datos.
* Separación de permisos entre administrador y estudiante.

> El código QR por sí solo no garantiza que sea imposible compartirlo. Las medidas anteriores buscan reducir y controlar usos indebidos mediante validaciones en el servidor y en la base de datos.

---

# 📚 Estructura del curso

El curso está compuesto por **5 módulos**, con una duración total de **10 horas**.

| Módulo | Tema principal                   | Duración |
| ------ | -------------------------------- | -------: |
| 1      | Fundamentos de Java              |  2 horas |
| 2      | Estructuras de control           |  2 horas |
| 3      | Métodos y estructuras de datos   |  2 horas |
| 4      | Programación orientada a objetos |  2 horas |
| 5      | Proyecto final                   |  2 horas |

### Módulo 1 — Fundamentos de Java

* JDK
* JVM
* JRE
* IDE
* Estructura de un programa Java
* `main`
* Variables
* Tipos de datos
* Operadores
* Entrada y salida

**Práctica:**

* Calculadora
* Programa de información personal

### Módulo 2 — Estructuras de control

* `if`
* `else`
* `switch`
* `for`
* `while`
* `do while`
* `break`
* `continue`

**Práctica:**

* Menú interactivo
* Ejercicios con condiciones y ciclos

### Módulo 3 — Métodos y estructuras

* Métodos
* Parámetros
* Retorno
* Sobrecarga
* Arrays
* `ArrayList`
* `String`

**Práctica:**

* Sistema sencillo de gestión de estudiantes

### Módulo 4 — Programación orientada a objetos

* Clases
* Objetos
* Atributos
* Métodos
* Constructores
* `this`
* Getters y setters
* Encapsulamiento
* Herencia
* Polimorfismo

**Práctica:**

* Desarrollo de un sistema utilizando POO

### Módulo 5 — Proyecto final

* Excepciones
* Organización del código
* Buenas prácticas
* Integración de conocimientos
* Pruebas
* Presentación

**Producto final:**

Programa funcional desarrollado en Java.

---

# 📊 Progreso

La plataforma permite realizar seguimiento del progreso de cada estudiante.

El progreso se representa mediante un porcentaje:

```text
0% ─────────────────────────── 100%
```

Cuando un estudiante completa todos los requisitos del curso:

```text
100%
```

se marca el curso como completado y queda registrado para la gestión del **certificado físico**.

---

# 🏗️ Arquitectura

El proyecto utiliza una arquitectura separada entre frontend, backend y base de datos.

```text
┌───────────────────────────────┐
│           FRONTEND            │
│                               │
│ React + TypeScript + Vite     │
│ Tailwind CSS                  │
│ React Router                  │
└───────────────┬───────────────┘
                │
                │ HTTP / REST API
                ▼
┌───────────────────────────────┐
│            BACKEND            │
│                               │
│ Node.js + Express             │
│ TypeScript                    │
│ Autenticación                 │
│ Validaciones                  │
│ Reglas de negocio             │
└───────────────┬───────────────┘
                │
                │ PostgreSQL
                ▼
┌───────────────────────────────┐
│          NEON DATABASE        │
│                               │
│ PostgreSQL                    │
│ Usuarios                      │
│ Módulos                       │
│ Asistencias                   │
│ Sesiones QR                   │
│ Progreso                      │
└───────────────────────────────┘
```

El frontend **no se conecta directamente a Neon**.

Las credenciales de la base de datos permanecen únicamente en el backend.

---

# 🛠️ Tecnologías

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Lucide React

## Backend

* Node.js
* Express
* TypeScript

## Base de datos

* PostgreSQL
* Neon Database

## Control de versiones

* Git
* GitHub

---

# 📁 Estructura propuesta

```text
java-course-platform/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── database/
│   │   ├── types/
│   │   └── server.ts
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── database/
│   └── schema.sql
│
├── .gitignore
└── README.md
```

La estructura puede cambiar durante el desarrollo según las necesidades de implementación.

---

# 🔑 Roles

El sistema utiliza únicamente dos roles:

```text
ADMIN
STUDENT
```

### ADMIN

Tiene permisos para:

* Gestionar módulos.
* Activar/desactivar asistencia.
* Generar sesiones QR.
* Consultar asistencias.
* Gestionar estudiantes.
* Consultar progreso.
* Gestionar accesos manuales.

### STUDENT

Puede:

* Registrarse.
* Iniciar sesión.
* Consultar módulos disponibles.
* Registrar asistencia.
* Consultar su progreso.

Los estudiantes no pueden activar ni desactivar sesiones de asistencia.

---

# 🗄️ Base de datos

La aplicación utiliza **Neon Database**, basada en PostgreSQL.

Las tablas serán diseñadas para manejar información como:

```text
users
profiles
modules
attendance_sessions
attendances
manual_access
progress
```

Entre las reglas de integridad previstas se encuentran:

* Claves primarias.
* Claves foráneas.
* `NOT NULL`.
* Restricciones `UNIQUE`.
* Índices.
* Fechas y horas de registro.
* Restricción de asistencia duplicada.

El esquema definitivo debe mantenerse sincronizado con la implementación real del backend.

---

# 🔐 Variables de entorno

## Backend

Crear un archivo `.env`:

```env
PORT=3000

DATABASE_URL=tu_connection_string_de_neon

JWT_SECRET=tu_clave_secreta
```

## Frontend

Crear un archivo `.env`:

```env
VITE_API_URL=http://localhost:3000
```

> Nunca subir archivos `.env` al repositorio.

---

# ⚙️ Instalación

## 1. Clonar el repositorio

```bash
git clone URL_DEL_REPOSITORIO
```

Entrar al proyecto:

```bash
cd java-course-platform
```

---

## 2. Instalar dependencias del frontend

```bash
cd frontend
npm install
```

Ejecutar:

```bash
npm run dev
```

---

## 3. Instalar dependencias del backend

En otra terminal:

```bash
cd backend
npm install
```

Ejecutar:

```bash
npm run dev
```

---

# 🧪 Desarrollo

El desarrollo se realizará progresivamente:

```text
1. Configuración inicial
        ↓
2. Frontend
        ↓
3. Componentes y diseño
        ↓
4. Backend
        ↓
5. Neon Database
        ↓
6. Modelo de datos
        ↓
7. Autenticación
        ↓
8. Roles
        ↓
9. Módulos
        ↓
10. Sesiones de asistencia
        ↓
11. Generación de QR
        ↓
12. Escaneo de QR
        ↓
13. Validación de asistencia
        ↓
14. Dashboard administrativo
        ↓
15. Progreso
        ↓
16. Pruebas
        ↓
17. Despliegue
```

Cada etapa debe ser comprobada antes de continuar con la siguiente.

---

# 🎨 Diseño

La interfaz utiliza **Tailwind CSS** como sistema principal de estilos.

Características:

* Diseño responsive.
* Mobile-first para estudiantes.
* Interfaz de escritorio para administración.
* Componentes reutilizables.
* Estados de carga.
* Estados de error.
* Estados vacíos.
* Modales.
* Tablas.
* Tarjetas.
* Indicadores de estado.
* Barra de progreso.
* Diseño accesible.

Documentación oficial:

https://tailwindcss.com/

---

# 🚧 Estado del proyecto

> 🟡 **En desarrollo**

Actualmente el proyecto se encuentra en etapa de construcción.

### Roadmap

* [ ] Configuración del frontend
* [ ] Configuración de Tailwind CSS
* [ ] Diseño de interfaz
* [ ] Configuración del backend
* [ ] Configuración de Neon
* [ ] Diseño de base de datos
* [ ] Registro de estudiantes
* [ ] Inicio de sesión
* [ ] Roles
* [ ] Gestión de módulos
* [ ] Activación de asistencia
* [ ] Generación de QR
* [ ] Escaneo de QR
* [ ] Registro de asistencia
* [ ] Dashboard administrativo
* [ ] Seguimiento de progreso
* [ ] Pruebas
* [ ] Despliegue

---

# 🔒 Seguridad

Las operaciones importantes se ejecutan en el backend.

El frontend no debe contener:

* Contraseñas.
* `DATABASE_URL`.
* Secretos del servidor.
* Claves privadas.
* Credenciales administrativas.

La validación de permisos debe realizarse en el servidor y no únicamente mediante elementos visuales del frontend.

---

# 📌 Objetivo del proyecto

El objetivo es desarrollar una plataforma educativa web que permita gestionar un curso básico de programación en Java, facilitando:

* Administración de estudiantes.
* Organización del contenido.
* Control de módulos.
* Registro de asistencia.
* Seguimiento del progreso.
* Gestión de actividades.
* Administración mediante QR.

El proyecto también busca servir como una aplicación práctica para aplicar conocimientos de:

* Desarrollo frontend.
* Desarrollo backend.
* TypeScript.
* APIs REST.
* PostgreSQL.
* Bases de datos en la nube.
* Autenticación.
* Control de acceso.
* Desarrollo responsive.
* Arquitectura de software.
* Git y GitHub.

---

# 📄 Licencia

Este proyecto se encuentra actualmente en desarrollo académico/personal.

La licencia definitiva será definida posteriormente.

---

# 👨‍💻 Autor

**Proyecto académico de Ingeniería de Software**

Desarrollado utilizando tecnologías web modernas y PostgreSQL en Neon.
