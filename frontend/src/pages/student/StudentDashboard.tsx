import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { AttendanceRecord, ManualAccess, ModuleLock } from '../../types';
import { courseModules } from '../../data/courseData';
import { QrCode, CheckCircle, Clock, BookOpen, AlertCircle, Camera, Award, Lock } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { ProgressBar } from '../../components/ProgressBar';
import { Scanner } from '@yudiel/react-qr-scanner';

export const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [manualAccesses, setManualAccesses] = useState<ManualAccess[]>([]);
  const [moduleLocks, setModuleLocks] = useState<ModuleLock[]>([]);
  
  const [showCamera, setShowCamera] = useState(false);
  const [scanMessage, setScanMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    const records = await api.getStudentAttendances();
    setAttendances(records);
    const manual = await api.getManualAccesses();
    setManualAccesses(manual);
    const locks = await api.getModuleLocks();
    setModuleLocks(locks);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const processScannedToken = async (scannedToken: string) => {
    if (!scannedToken.trim()) return;
    setShowCamera(false);
    setScanMessage(null);

    const res = await api.registerAttendance(scannedToken.trim());
    
    if (res.success) {
      setScanMessage({ type: 'success', text: res.message });
      loadData();
    } else {
      setScanMessage({ type: 'error', text: res.message });
    }
  };

  const unlockedModules = new Set([
    ...attendances.map(a => a.moduleId),
    ...manualAccesses.map(m => m.moduleId)
  ]);
  
  const accessibleModulesCount = courseModules.filter(m => {
    const lock = moduleLocks.find(l => l.moduleId === m.id);
    const isOpen = lock?.status === 'OPEN';
    return isOpen && unlockedModules.has(m.id);
  }).length;

  const totalProgressPct = Math.round((unlockedModules.size / courseModules.length) * 100);
  const isCertified = unlockedModules.size === courseModules.length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-12">
      {/* Student Navbar */}
      <nav className="bg-white text-slate-800 p-4 shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-extrabold text-slate-900 text-base">Panel Estudiantil</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-600">Hola, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="text-xs font-bold text-slate-500 hover:text-red-600 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-5xl mx-auto p-4 sm:p-6 w-full space-y-6">

        {/* Notificación de Certificación Final */}
        {isCertified && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 rounded-2xl shadow-lg border border-emerald-400 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                <Award className="w-10 h-10 text-white animate-bounce" />
              </div>
              <div>
                <h2 className="text-xl font-black">¡Felicitaciones! Curso Completado</h2>
                <p className="text-emerald-100 text-sm">El estudiante cumple con todas las condiciones para certificación.</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Columna Izquierda: Progreso de Módulos */}
          <div className="md:col-span-2 space-y-6">
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" /> Progreso del Curso Java
              </h2>
              
              <ProgressBar completed={accessibleModulesCount} total={courseModules.length} />

              <div className="mt-6 flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Porcentaje de Avance</p>
                  <p className="text-2xl font-black text-indigo-600">{totalProgressPct}%</p>
                </div>
                <Link
                  to="/course"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all"
                >
                  Ver Contenidos del Curso
                </Link>
              </div>
            </div>

            {/* Módulos y Estado */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <h2 className="text-lg font-extrabold text-slate-900 mb-2 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" /> Mis Módulos
              </h2>

              <div className="space-y-3">
                {courseModules.map((mod) => {
                  const lock = moduleLocks.find(l => l.moduleId === mod.id);
                  const status = lock ? lock.status : 'LOCKED';
                  const isUnlocked = unlockedModules.has(mod.id);
                  const canAccess = status === 'OPEN' && isUnlocked;

                  return (
                    <div
                      key={mod.id}
                      className={`p-4 rounded-xl border transition-all flex justify-between items-center ${
                        canAccess ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                          Semana {mod.id}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm">{mod.title}</h3>
                        <p className="text-xs text-slate-500">{mod.description}</p>
                      </div>

                      <div>
                        {canAccess ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                            <CheckCircle className="w-3.5 h-3.5" /> Disponible
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-200 px-3 py-1 rounded-full">
                            <Lock className="w-3.5 h-3.5" /> {status === 'OPEN' ? 'Asistencia Requerida' : status}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Columna Derecha: Lector QR para Registrar Asistencia */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center">
            <h2 className="text-lg font-extrabold text-slate-900 mb-2 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-indigo-600" /> Registrar Asistencia
            </h2>
            <p className="text-xs text-slate-500 text-center mb-6">
              Escanea el código QR proyectado por el profesor en la pantalla para registrar tu presencia.
            </p>

            {!showCamera ? (
              <button
                onClick={() => setShowCamera(true)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-6 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all font-bold shadow-lg cursor-pointer"
              >
                <Camera className="w-10 h-10" />
                <span className="text-sm">Abrir Cámara para Escanear QR</span>
              </button>
            ) : (
              <div className="w-full border-4 border-indigo-600 rounded-2xl overflow-hidden bg-black relative shadow-xl">
                <Scanner
                  onScan={(result) => processScannedToken(result[0].rawValue)}
                  components={{
                    onOff: true,
                    torch: true,
                    finder: true
                  }}
                />
                <button
                  onClick={() => setShowCamera(false)}
                  className="absolute top-2 right-2 bg-red-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow-md z-50 hover:bg-red-700"
                >
                  Cerrar Cámara
                </button>
              </div>
            )}

            {scanMessage && (
              <div className={`mt-6 w-full p-4 rounded-xl flex items-start gap-2 border font-semibold text-xs ${
                scanMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}>
                {scanMessage.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
                )}
                <span>{scanMessage.text}</span>
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
};
