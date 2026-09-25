import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { AttendanceRecord, ManualAccess, ModuleLock } from '../../types';
import { courseModules } from '../../data/courseData';
import { QrCode, CheckCircle, Clock, BookOpen, AlertCircle, Camera, Award, Lock, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-12">
      {/* Student Navbar */}
      <nav className="bg-slate-900/90 border-b border-purple-900/40 p-4 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-xl shadow-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-black text-white text-base">Panel del Estudiante</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-purple-300">Hola, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-md cursor-pointer"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-5xl mx-auto p-4 sm:p-6 w-full space-y-6">

        {/* Notificación de Certificación Final */}
        {isCertified && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-2xl shadow-2xl border border-emerald-400 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                <Award className="w-10 h-10 text-white animate-bounce" />
              </div>
              <div>
                <h2 className="text-xl font-black">¡Felicitaciones! Curso Completado</h2>
                <p className="text-emerald-100 text-xs mt-0.5">El estudiante cumple con todas las condiciones para certificación.</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Columna Izquierda: Progreso de Módulos */}
          <div className="md:col-span-2 space-y-6">
            
            <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-xl">
              <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" /> Mi Progreso en Java
              </h2>
              
              <ProgressBar completed={accessibleModulesCount} total={courseModules.length} />

              <div className="mt-6 flex justify-between items-center bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <div>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Avance General</p>
                  <p className="text-2xl font-black text-purple-400">{totalProgressPct}%</p>
                </div>
                <Link
                  to="/course"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg transition-all"
                >
                  Ver Módulos del Curso
                </Link>
              </div>
            </div>

            {/* Lista de Módulos y Estado */}
            <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
              <h2 className="text-lg font-black text-white mb-2 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" /> Módulos del Curso
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
                        canAccess ? 'bg-emerald-950/40 border-emerald-500/40' : 'bg-slate-950/70 border-slate-800'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          Semana {mod.id}
                        </span>
                        <h3 className="font-bold text-white text-sm">{mod.title}</h3>
                        <p className="text-xs text-slate-400">{mod.description}</p>
                      </div>

                      <div>
                        {canAccess ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 bg-emerald-900/60 px-3 py-1 rounded-full border border-emerald-500/40">
                            <CheckCircle className="w-3.5 h-3.5" /> Disponible
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                            <Lock className="w-3.5 h-3.5" /> {status === 'OPEN' ? 'Requiere Asistencia' : status}
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
          <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col items-center">
            <h2 className="text-lg font-black text-white mb-2 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-purple-400" /> Escanear Asistencia
            </h2>
            <p className="text-xs text-slate-400 text-center mb-6">
              Apunta la cámara de tu celular hacia el código QR proyectado por el profesor en la pantalla.
            </p>

            {!showCamera ? (
              <button
                onClick={() => setShowCamera(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white p-6 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all font-bold shadow-xl cursor-pointer"
              >
                <Camera className="w-10 h-10" />
                <span className="text-sm">Abrir Cámara para Escanear</span>
              </button>
            ) : (
              <div className="w-full border-4 border-purple-500 rounded-2xl overflow-hidden bg-black relative shadow-2xl">
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
                  Cerrar
                </button>
              </div>
            )}

            {scanMessage && (
              <div className={`mt-6 w-full p-4 rounded-xl flex items-start gap-2 border font-semibold text-xs ${
                scanMessage.type === 'success'
                  ? 'bg-emerald-950/80 text-emerald-200 border-emerald-500/40'
                  : 'bg-red-950/80 text-red-200 border-red-500/40'
              }`}>
                {scanMessage.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
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
