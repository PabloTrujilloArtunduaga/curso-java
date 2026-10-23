import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { AttendanceRecord, ManualAccess, ModuleLock } from '../../types';
import { courseModules } from '../../data/courseData';
import { QrCode, CheckCircle, Clock, BookOpen, AlertCircle, Camera, Award, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProgressBar } from '../../components/ProgressBar';
import { Scanner } from '@yudiel/react-qr-scanner';

export const StudentDashboard = () => {
  const { user } = useAuth();
  
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
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Student Page Header (replaces duplicate inner nav) */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                  <BookOpen className="w-3.5 h-3.5" /> Estudiante Inscrito
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500 font-medium">Hola, {user?.name}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Mi Panel de Estudiante
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Progreso académico, asistencia presencial y habilitación progresiva de módulos de Java.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-center">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Módulos Aprobados</span>
                <span className="text-base font-extrabold text-slate-900">{unlockedModules.size} / {courseModules.length}</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-center">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Avance Total</span>
                <span className="text-base font-extrabold text-blue-600">{totalProgressPct}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Notificación de Certificación Final */}
        {isCertified && (
          <div className="bg-emerald-50 border border-emerald-200 text-slate-900 p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-600 text-white p-3 rounded-xl shadow-xs shrink-0">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-emerald-900">¡Felicitaciones! Has completado el 100% del curso</h2>
                <p className="text-emerald-700 text-xs mt-0.5">Cumples con los requisitos de asistencia y práctica presencial para la expedición de tu certificado oficial.</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold shrink-0">
              <CheckCircle className="w-4 h-4" /> Certificación Aprobada
            </span>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Columna Izquierda: Progreso de Módulos */}
          <div className="md:col-span-2 space-y-6">
            
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" /> Progreso Académico
                </h2>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  {unlockedModules.size} de {courseModules.length} Módulos
                </span>
              </div>
              
              <ProgressBar completed={unlockedModules.size} total={courseModules.length} />

              <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Estado de Acceso</p>
                  <p className="text-xs text-slate-700 mt-0.5">
                    {accessibleModulesCount === 0
                      ? 'No hay módulos abiertos actualmente con tu asistencia confirmada.'
                      : `${accessibleModulesCount} módulo(s) disponible(s) para lectura y ejercicios.`}
                  </p>
                </div>
                <Link
                  to="/course"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0"
                >
                  <span>Ver Módulos</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Lista de Módulos y Estado */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3 mb-2 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" /> Plan de Módulos Presenciales
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Estado de habilitación semanal y asistencia</p>
                </div>
              </div>

              <div className="space-y-3">
                {courseModules.map((mod) => {
                  const lock = moduleLocks.find(l => l.moduleId === mod.id);
                  const status = lock ? lock.status : 'LOCKED';
                  const isUnlocked = unlockedModules.has(mod.id);
                  const canAccess = status === 'OPEN' && isUnlocked;

                  return (
                    <div
                      key={mod.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        canAccess
                          ? 'bg-emerald-50/60 border-emerald-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                            Semana {mod.id}
                          </span>
                          <h3 className="font-bold text-slate-900 text-xs sm:text-sm">{mod.title}</h3>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-1">{mod.description}</p>
                      </div>

                      <div className="shrink-0">
                        {canAccess ? (
                          <Link
                            to={`/module/${mod.id}`}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-white px-3 py-1.5 rounded-lg border border-emerald-300 shadow-2xs hover:bg-emerald-50 transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Entrar al Módulo</span>
                          </Link>
                        ) : isUnlocked ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                            <Clock className="w-3.5 h-3.5" /> Asistencia lista ({status})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                            <Lock className="w-3.5 h-3.5" /> {status === 'OPEN' ? 'Requiere Asistencia' : 'Bloqueado'}
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
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center">
            <div className="bg-blue-50 text-blue-600 p-3 rounded-xl mb-3 border border-blue-100">
              <QrCode className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-slate-900 mb-1 text-center">
              Escanear Asistencia
            </h2>
            <p className="text-xs text-slate-500 text-center mb-6 leading-relaxed">
              Apunta la cámara de tu dispositivo hacia el código QR proyectado por el docente en clase para registrar tu presencia.
            </p>

            {!showCamera ? (
              <button
                onClick={() => setShowCamera(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all font-semibold shadow-xs cursor-pointer group"
              >
                <div className="bg-white/10 p-2.5 rounded-xl group-hover:scale-105 transition-transform">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs sm:text-sm">Abrir Cámara para Escanear</span>
              </button>
            ) : (
              <div className="w-full border-2 border-blue-600 rounded-2xl overflow-hidden bg-black relative shadow-xs">
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
                  className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white text-xs px-3 py-1 rounded-full font-bold shadow-xs z-50 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            )}

            {scanMessage && (
              <div className={`mt-5 w-full p-3.5 rounded-xl flex items-start gap-2 border font-medium text-xs ${
                scanMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}>
                {scanMessage.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                )}
                <span>{scanMessage.text}</span>
              </div>
            )}

            <div className="w-full mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500 text-center">
              Cada código QR es dinámico y expira a los 90 segundos de ser proyectado.
            </div>
          </div>

        </div>

      </main>
    </div>
  );
};
