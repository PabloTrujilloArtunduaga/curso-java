import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy, Users, CheckCircle, ShieldCheck } from 'lucide-react';

export const Home = () => {
  const { user } = useAuth();

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-blue-900 overflow-hidden">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover opacity-20"
            src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Código Java en pantalla"
          />
          <div className="absolute inset-0 bg-blue-900 mix-blend-multiply" />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl mb-6">
            Aprende Java desde Cero
          </h1>
          <p className="mt-6 text-xl text-blue-100 max-w-3xl">
            Domina uno de los lenguajes de programación más demandados del mundo en nuestro curso presencial. Cupos limitados a 20 estudiantes.
          </p>
          <div className="mt-10 flex gap-4">
            {!user ? (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-900 bg-white hover:bg-gray-50 shadow-lg transition-transform hover:scale-105"
                >
                  Inscribirse Ahora
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-blue-800 transition-colors"
                >
                  Ya soy alumno
                </Link>
              </>
            ) : (
              <Link
                to={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-900 bg-white hover:bg-gray-50 shadow-lg"
              >
                Ir a mi Panel
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Características */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Metodología</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              ¿Por qué tomar este curso?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Clases Presenciales</h3>
              <p className="text-gray-600">Grupos reducidos de máximo 20 personas para garantizar atención personalizada.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
                <ShieldCheck className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Asistencia Segura QR</h3>
              <p className="text-gray-600">Sistema moderno anti-fraude. Tu celular genera un código único que el profesor escanea.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
                <Trophy className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Certificación Final</h3>
              <p className="text-gray-600">Al completar todos los módulos teóricos y prácticos obtendrás tu certificado avalado.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Requisitos / Info extra */}
      <div className="py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight sm:text-3xl">
                Requisitos de Inscripción
              </h3>
              <p className="mt-4 text-lg text-gray-500">
                Para mantener la calidad académica, el curso tiene condiciones específicas para los aplicantes.
              </p>
              <dl className="mt-8 space-y-6">
                <div className="flex">
                  <CheckCircle className="flex-shrink-0 h-6 w-6 text-green-500" aria-hidden="true" />
                  <div className="ml-3">
                    <dt className="text-lg font-medium text-gray-900">Correo Institucional</dt>
                    <dd className="mt-1 text-gray-500">Obligatorio usar correo con dominio @usco.edu.co.</dd>
                  </div>
                </div>
                <div className="flex">
                  <CheckCircle className="flex-shrink-0 h-6 w-6 text-green-500" aria-hidden="true" />
                  <div className="ml-3">
                    <dt className="text-lg font-medium text-gray-900">Cupo Limitado</dt>
                    <dd className="mt-1 text-gray-500">Solo se habilitan 20 espacios por cohorte.</dd>
                  </div>
                </div>
                <div className="flex">
                  <CheckCircle className="flex-shrink-0 h-6 w-6 text-green-500" aria-hidden="true" />
                  <div className="ml-3">
                    <dt className="text-lg font-medium text-gray-900">Dispositivo Móvil</dt>
                    <dd className="mt-1 text-gray-500">Necesitarás tu celular para generar el QR de asistencia en cada clase presencial.</dd>
                  </div>
                </div>
              </dl>
            </div>
            <div className="mt-12 lg:mt-0 relative">
              <img
                className="rounded-xl shadow-2xl"
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
                alt="Estudiantes trabajando en computadoras"
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
