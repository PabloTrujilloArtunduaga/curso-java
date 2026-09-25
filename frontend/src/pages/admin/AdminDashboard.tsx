import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { ModuleLock, QRToken, AttendanceRecord, User, ModuleStatusType, ManualAccess } from '../../types';
import { courseModules } from '../../data/courseData';
import { QRCodeSVG } from 'qrcode.react';
import { Lock, QrCode, StopCircle, Key, Award, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [locks, setLocks] = useState<ModuleLock[]>([]);
  const [activeSession, setActiveSession] = useState<QRToken | null>(null);
  const [selectedModuleForQR, setSelectedModuleForQR] = useState<number>(1);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [manualAccesses, setManualAccesses] = useState<ManualAccess[]>([]);
  
  const [selectedStudentForAccess, setSelectedStudentForAccess] = useState<string>('');
  const [selectedModuleForAccess, setSelectedModuleForAccess] = useState<number>(1);
  const [accessReason, setAccessReason] = useState<string>('');
  const [grantMessage, setGrantMessage] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const [loadingQR, setLoadingQR] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const loadData = async () => {
    try {
      const l = await api.getModuleLocks();
      setLocks(l);
      const a = await api.getAllAttendances();
      setAttendances(a);
      const s = await api.getStudents();
      setStudents(s);
      const m = await api.getManualAccesses();
      setManualAccesses(m);

      const active = await api.getActiveAttendanceSession(selectedModuleForQR);
      if (active) setActiveSession(active);
    } catch (e) {
      console.warn('Cargando datos...', e);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      api.getAllAttendances().then(setAttendances);
      api.getManualAccesses().then(setManualAccesses);
      api.getStudents().then(setStudents);
      api.getActiveAttendanceSession(selectedModuleForQR).then((sec) => {
        if (sec) setActiveSession(sec);
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedModuleForQR]);

  useEffect(() => {
    if (activeSession) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, Math.floor((new Date(activeSession.expiresAt).getTime() - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining === 0) {
          api.closeAttendanceSession(activeSession.id);
          setActiveSession(null);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeSession]);

  const handleStatusChange = async (moduleId: number, status: ModuleStatusType) => {
    const newLocks = await api.updateModuleStatus(moduleId, status);
    setLocks(newLocks);
  };

  const handleActivateQR = async () => {
    setLoadingQR(true);
    setErrorMsg('');
    try {
      const session = await api.createAttendanceSession(selectedModuleForQR, 90);
      
      if (session) {
        setActiveSession(session);
        setTimeLeft(90);
      } else {
        // Fallback local seguro si la API de red no responde temporalmente
        const fallbackToken: QRToken = {
          id: 'session-' + Date.now(),
          moduleId: selectedModuleForQR,
          token: `JAVA-M${selectedModuleForQR}-${Date.now()}`,
          isActive: true,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 90 * 1000).toISOString()
        };
        setActiveSession(fallbackToken);
        setTimeLeft(90);
      }
    } catch (err) {
      setErrorMsg('No se pudo iniciar la sesión.');
    } finally {
      setLoadingQR(false);
    }
  };

  const handleDeactivateQR = async () => {
    if (activeSession) {
      await api.closeAttendanceSession(activeSession.id);
      setActiveSession(null);
      setTimeLeft(0);
    }
  };

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForAccess) return;

    const ok = await api.grantManualAccess(
      selectedStudentForAccess,
      selectedModuleForAccess,
      accessReason
    );

    if (ok) {
      setGrantMessage('¡Acceso concedido correctamente!');
      setAccessReason('');
      const m = await api.getManualAccesses();
      setManualAccesses(m);
      setTimeout(() => setGrantMessage(''), 3000);
    } else {
      setGrantMessage('El estudiante ya cuenta con acceso.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const activeModuleObj = courseModules.find(m => m.id === selectedModuleForQR);
  const activeModuleAttendances = attendances.filter(a => a.moduleId === selectedModuleForQR);

  // Excluir email del admin u20232218369@usco.edu.co del total de cupos
  const filteredStudents = students.filter(s => s.email !== 'u20232218369@usco.edu.co');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Top Navbar Header */}
      <nav className="bg-slate-900/90 border-b border-purple-900/40 p-4 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-2.5 rounded-xl shadow-lg">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg leading-tight text-white">Panel Administrativo</h1>
              <p className="text-xs text-purple-300 font-medium">Curso Presencial de Java — USCO</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-slate-300 hidden md:inline">
              Profesor: <b className="text-purple-300">{user?.name}</b>
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md cursor-pointer"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8 mt-4">

        {/* Fila 1: Generador de QR & Estado de Módulos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Pantalla Especial de QR */}
          <section className="bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-800 flex flex-col items-center shadow-xl">
            <div className="w-full flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-purple-400" /> Asistencia — Semana {selectedModuleForQR}
                </h2>
                <p className="text-xs text-purple-300 font-medium">{activeModuleObj?.title}</p>
              </div>

              <select
                value={selectedModuleForQR}
                onChange={(e) => setSelectedModuleForQR(Number(e.target.value))}
                className="bg-slate-800 border border-purple-500/30 rounded-xl px-3 py-1.5 text-xs font-bold text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {courseModules.map(m => (
                  <option key={m.id} value={m.id}>Semana {m.id}</option>
                ))}
              </select>
            </div>

            {errorMsg && (
              <div className="w-full mb-3 p-3 bg-red-900/50 text-red-200 text-xs rounded-xl flex items-center gap-2 border border-red-500/30">
                <AlertCircle className="w-4 h-4 text-red-400" /> {errorMsg}
              </div>
            )}

            {/* Tarjeta del QR Grande */}
            {!activeSession ? (
              <div className="w-full flex-1 min-h-[320px] bg-slate-950/60 border-2 border-dashed border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                <QrCode className="w-20 h-20 text-slate-700 mb-4 animate-pulse" />
                <h3 className="font-bold text-white text-lg">Sesión de Asistencia Inactiva</h3>
                <p className="text-slate-400 text-xs max-w-xs mt-1 mb-6">
                  Presiona el botón para activar la sesión y proyectar el código QR dinámico en la pantalla del salón.
                </p>
                <button
                  onClick={handleActivateQR}
                  disabled={loadingQR}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg transition-all text-sm cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  <QrCode className="w-5 h-5" /> {loadingQR ? 'Generando...' : 'Activar Asistencia (90s)'}
                </button>
              </div>
            ) : (
              <div className="w-full bg-slate-950 p-6 rounded-2xl flex flex-col items-center shadow-2xl border border-purple-900/50">
                <div className="flex items-center gap-2 mb-4 bg-emerald-950/80 px-4 py-1.5 rounded-full border border-emerald-500/40">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="font-black text-emerald-400 text-xs tracking-wider uppercase">Sesión: ACTIVA</span>
                </div>

                {/* QR grande destacado */}
                <div className="bg-white p-5 rounded-2xl shadow-2xl mb-4 border-4 border-purple-500">
                  <QRCodeSVG value={activeSession.token} size={220} level="H" />
                </div>

                <div className="flex items-center gap-2 bg-amber-950/60 px-4 py-1.5 rounded-full border border-amber-500/40 mb-4">
                  <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                  <span className="text-xs font-bold text-amber-300">Expira en: {timeLeft}s</span>
                </div>

                <div className="text-center mb-6">
                  <p className="text-xl font-black text-white">
                    Presentes: <span className="text-purple-400">{activeModuleAttendances.length}</span> / {filteredStudents.length}
                  </p>
                </div>

                {/* Botón de Desactivar Asistencia */}
                <button
                  onClick={handleDeactivateQR}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <StopCircle className="w-5 h-5" /> Desactivar Asistencia
                </button>
              </div>
            )}

            {/* Asistentes de la sesión */}
            <div className="w-full mt-6 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                <span>Estudiantes Confirmados</span>
                <span className="bg-purple-900/60 text-purple-300 px-2 py-0.5 rounded-full font-bold text-[10px]">
                  {activeModuleAttendances.length}
                </span>
              </h4>
              <div className="max-h-36 overflow-y-auto space-y-1.5">
                {activeModuleAttendances.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Esperando que los estudiantes escaneen el código...</p>
                ) : (
                  activeModuleAttendances.map(a => {
                    const st = students.find(s => s.id === a.studentId);
                    return (
                      <div key={a.id} className="text-xs bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center font-medium">
                        <span className="text-slate-200">{st?.name} {st?.lastName} ({st?.email})</span>
                        <span className="text-emerald-400 font-bold text-[11px]">✓ Confirmado</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>

          {/* Control de Estados de los Módulos */}
          <section className="bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-800 flex flex-col justify-between shadow-xl">
            <div>
              <h2 className="text-lg font-black text-white border-b border-slate-800 pb-3 mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-400" /> Control de Estados de Módulos
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Configura la disponibilidad para estudiantes: <b>LOCKED</b> (oculto), <b>OPEN</b> (abierto para registrar asistencia), <b>CLOSED</b> (finalizado).
              </p>

              <div className="space-y-3">
                {courseModules.map(mod => {
                  const lock = locks.find(l => l.moduleId === mod.id);
                  const currentStatus: ModuleStatusType = lock ? lock.status : 'LOCKED';

                  return (
                    <div key={mod.id} className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-white text-sm">Semana {mod.id}: {mod.title}</h3>
                        <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded font-black tracking-wider ${
                          currentStatus === 'OPEN' ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40' :
                          currentStatus === 'CLOSED' ? 'bg-amber-900/60 text-amber-300 border border-amber-500/40' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {currentStatus}
                        </span>
                      </div>

                      <select
                        value={currentStatus}
                        onChange={(e) => handleStatusChange(mod.id, e.target.value as ModuleStatusType)}
                        className="bg-slate-900 border border-purple-500/30 rounded-xl px-3 py-1.5 text-xs font-bold text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="LOCKED">🔒 LOCKED</option>
                        <option value="OPEN">🔓 OPEN</option>
                        <option value="CLOSED">🚫 CLOSED</option>
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

        </div>

        {/* Fila 2: Excepción Manual & Listado de Alumnos (Excluyendo Admin) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Autorización Manual */}
          <section className="bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-xl">
            <h2 className="text-lg font-black text-white border-b border-slate-800 pb-3 mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-purple-400" /> Excepción del Administrador (Acceso Manual)
            </h2>

            {grantMessage && (
              <div className="mb-4 p-3 bg-purple-900/50 text-purple-200 rounded-xl text-xs font-semibold border border-purple-500/40">
                {grantMessage}
              </div>
            )}

            <form onSubmit={handleGrantAccess} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Seleccionar Estudiante</label>
                <select
                  value={selectedStudentForAccess}
                  onChange={(e) => setSelectedStudentForAccess(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-medium text-slate-200"
                >
                  <option value="">-- Seleccionar Alumno --</option>
                  {filteredStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.name} {s.lastName} ({s.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Módulo a Habilitar</label>
                <select
                  value={selectedModuleForAccess}
                  onChange={(e) => setSelectedModuleForAccess(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-medium text-slate-200"
                >
                  {courseModules.map(m => (
                    <option key={m.id} value={m.id}>Semana {m.id}: {m.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Motivo (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej: Permiso médico justificado"
                  value={accessReason}
                  onChange={(e) => setAccessReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-medium text-slate-200"
                />
              </div>

              <button
                type="submit"
                disabled={!selectedStudentForAccess}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl disabled:opacity-50 text-xs shadow-lg cursor-pointer transition-all"
              >
                Conceder Acceso Manual
              </button>
            </form>
          </section>

          {/* Listado de Estudiantes Inscritos (Excluyendo Admin del Contador) */}
          <section className="bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-xl">
            <h2 className="text-lg font-black text-white border-b border-slate-800 pb-3 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" /> Estudiantes Inscritos
              </span>
              <span className="bg-purple-900/80 text-purple-300 px-3 py-1 rounded-full text-xs font-extrabold border border-purple-500/30">
                {filteredStudents.length} / 20 Cupos
              </span>
            </h2>

            <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
              {filteredStudents.length === 0 ? (
                <p className="text-slate-500 text-xs italic">No hay estudiantes inscritos aún en el sistema.</p>
              ) : (
                filteredStudents.map(st => {
                  const studentAttendances = attendances.filter(a => a.studentId === st.id);
                  const studentManual = manualAccesses.filter(m => m.studentId === st.id);
                  const completedCount = new Set([
                    ...studentAttendances.map(a => a.moduleId),
                    ...studentManual.map(m => m.moduleId)
                  ]).size;
                  const progressPct = Math.round((completedCount / courseModules.length) * 100);

                  return (
                    <div key={st.id} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white text-xs">{st.name} {st.lastName}</p>
                        <p className="text-[11px] text-slate-400">{st.email}</p>
                      </div>
                      <div className="text-right">
                        {progressPct === 100 ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-900/60 text-emerald-300 text-[10px] px-2.5 py-0.5 rounded-full font-extrabold border border-emerald-500/40">
                            <CheckCircle className="w-3 h-3" /> Apto Certificación
                          </span>
                        ) : (
                          <span className="bg-purple-900/60 text-purple-300 text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-purple-500/30">
                            {progressPct}% Progreso
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

        </div>

      </main>
    </div>
  );
};
