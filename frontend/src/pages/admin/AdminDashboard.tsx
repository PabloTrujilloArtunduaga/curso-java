import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { ModuleLock, QRToken, AttendanceRecord, User, ModuleStatusType, ManualAccess } from '../../types';
import { courseModules } from '../../data/courseData';
import { QRCodeSVG } from 'qrcode.react';
import { Lock, QrCode, StopCircle, Key, Award, CheckCircle, Clock, AlertCircle, ShieldCheck, UserCheck } from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth();
  
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
      
      if (session && session.token) {
        setActiveSession(session);
        setTimeLeft(90);
      } else {
        setActiveSession(null);
        setTimeLeft(0);
        setErrorMsg('El servidor no pudo generar una sesión de asistencia válida. Inténtalo de nuevo.');
      }
    } catch (err: any) {
      setActiveSession(null);
      setTimeLeft(0);
      setErrorMsg(err?.message || 'Error de conexión con el servidor al iniciar la sesión de asistencia.');
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

  const activeModuleObj = courseModules.find(m => m.id === selectedModuleForQR);
  const activeModuleAttendances = attendances.filter(a => a.moduleId === selectedModuleForQR);

  // Asegurar que solo usuarios con rol STUDENT sean contabilizados en cupos y listados
  const filteredStudents = students.filter(s => s.role === 'STUDENT' || (!s.role && s.email !== 'u20232218369@usco.edu.co'));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Page Header (replaces inner duplicate nav) */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                  <ShieldCheck className="w-3.5 h-3.5" /> Administrador del Curso
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500 font-medium">Docente: {user?.name}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Panel del docente
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Control de asistencia presencial por código QR, gestión de módulos y excepciones de acceso.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3">
              <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-center">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Inscritos</span>
                <span className="text-base font-extrabold text-slate-900">{filteredStudents.length} / 20</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-center">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Módulos Abiertos</span>
                <span className="text-base font-extrabold text-blue-600">
                  {locks.filter(l => l.status === 'OPEN').length} / 5
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Fila 1: Generador de QR & Estado de Módulos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Pantalla Especial de QR */}
          <section className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-full flex justify-between items-start border-b border-slate-100 pb-4 mb-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-blue-600" /> Asistencia Presencial — Semana {selectedModuleForQR}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">{activeModuleObj?.title}</p>
                </div>

                <select
                  value={selectedModuleForQR}
                  onChange={(e) => setSelectedModuleForQR(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                >
                  {courseModules.map(m => (
                    <option key={m.id} value={m.id}>Semana {m.id}</option>
                  ))}
                </select>
              </div>

              {errorMsg && (
                <div className="w-full mb-4 p-3 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-center gap-2 border border-rose-200 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Tarjeta del QR Grande */}
              {!activeSession ? (
                <div className="w-full min-h-[300px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                  <div className="bg-white p-3.5 rounded-full border border-slate-200 shadow-xs mb-3">
                    <QrCode className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">Sesión de Asistencia Inactiva</h3>
                  <p className="text-slate-500 text-xs max-w-xs mt-1 mb-5">
                    Activa la sesión para proyectar en pantalla el código QR dinámico de 90 segundos para la Semana {selectedModuleForQR}.
                  </p>
                  <button
                    onClick={handleActivateQR}
                    disabled={loadingQR}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-xs transition-all text-xs sm:text-sm cursor-pointer flex items-center gap-2 disabled:opacity-60"
                  >
                    <QrCode className="w-4 h-4" /> {loadingQR ? 'Generando...' : 'Activar Código QR (90s)'}
                  </button>
                </div>
              ) : (
                <div className="w-full bg-slate-50 border border-slate-200 p-6 rounded-2xl flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-4 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="font-bold text-emerald-700 text-xs tracking-wider uppercase">Sesión de Asistencia Activa</span>
                  </div>

                  {/* QR grande destacado */}
                  <div className="bg-white p-4 rounded-xl shadow-xs mb-4 border border-slate-200">
                    <QRCodeSVG value={activeSession.token} size={200} level="H" />
                  </div>

                  <div className="flex items-center gap-2 bg-amber-50 px-3.5 py-1 rounded-full border border-amber-200 mb-3">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-xs font-bold text-amber-800">Expira en: {timeLeft}s</span>
                  </div>

                  <div className="text-center mb-5">
                    <p className="text-sm font-bold text-slate-700">
                      Asistencia confirmada: <span className="text-blue-600 text-base">{activeModuleAttendances.length}</span> de {filteredStudents.length} estudiantes
                    </p>
                  </div>

                  <button
                    onClick={handleDeactivateQR}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2.5 rounded-xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <StopCircle className="w-4 h-4" /> Finalizar Sesión Anticipadamente
                  </button>
                </div>
              )}
            </div>

            {/* Asistentes de la sesión */}
            <div className="w-full mt-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-600">
                  Estudiantes Confirmados (Semana {selectedModuleForQR})
                </span>
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold text-[10px]">
                  {activeModuleAttendances.length}
                </span>
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {activeModuleAttendances.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    Ningún estudiante ha registrado asistencia en esta sesión todavía.
                  </p>
                ) : (
                  activeModuleAttendances.map(a => {
                    const st = students.find(s => s.id === a.studentId);
                    return (
                      <div key={a.id} className="text-xs bg-white p-2.5 rounded-lg border border-slate-200 flex justify-between items-center font-medium shadow-2xs">
                        <span className="text-slate-800 truncate">{st?.name} {st?.lastName} ({st?.email})</span>
                        <span className="text-emerald-600 font-semibold text-[11px] shrink-0 ml-2">✓ Confirmado</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>

          {/* Control de Estados de los Módulos */}
          <section className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="border-b border-slate-100 pb-4 mb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-blue-600" /> Control de Estados de Módulos
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Define la disponibilidad del contenido: <b>LOCKED</b> (oculto), <b>OPEN</b> (abierto para registrar asistencia), <b>CLOSED</b> (finalizado).
                </p>
              </div>

              <div className="space-y-3">
                {courseModules.map(mod => {
                  const lock = locks.find(l => l.moduleId === mod.id);
                  const currentStatus: ModuleStatusType = lock ? lock.status : 'LOCKED';

                  return (
                    <div key={mod.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">Semana {mod.id}:</span>
                          <span className="text-xs text-slate-700 font-medium">{mod.title}</span>
                        </div>
                        <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded font-bold tracking-wider ${
                          currentStatus === 'OPEN' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          currentStatus === 'CLOSED' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-slate-200/80 text-slate-600'
                        }`}>
                          {currentStatus === 'OPEN' ? 'DESBLOQUEABLE (OPEN)' : currentStatus === 'CLOSED' ? 'CERRADO (CLOSED)' : 'BLOQUEADO (LOCKED)'}
                        </span>
                      </div>

                      <select
                        value={currentStatus}
                        onChange={(e) => handleStatusChange(mod.id, e.target.value as ModuleStatusType)}
                        className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 self-start sm:self-auto"
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

            <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Como docente, puedes ingresar a todos los módulos sin restricción de estado.</span>
            </div>
          </section>

        </div>

        {/* Fila 2: Excepción Manual & Listado de Estudiantes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Autorización Manual */}
          <section className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs">
            <div className="border-b border-slate-100 pb-4 mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600" /> Excepción del docente (Acceso Manual)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Concede acceso extraordinario a un estudiante específico que justifique su inasistencia presencial.
              </p>
            </div>

            {grantMessage && (
              <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded-xl text-xs font-semibold border border-blue-200 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{grantMessage}</span>
              </div>
            )}

            <form onSubmit={handleGrantAccess} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Seleccionar Estudiante</label>
                <select
                  value={selectedStudentForAccess}
                  onChange={(e) => setSelectedStudentForAccess(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                >
                  <option value="">-- Seleccionar Estudiante --</option>
                  {filteredStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.name} {s.lastName} ({s.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Módulo a Habilitar</label>
                <select
                  value={selectedModuleForAccess}
                  onChange={(e) => setSelectedModuleForAccess(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                >
                  {courseModules.map(m => (
                    <option key={m.id} value={m.id}>Semana {m.id}: {m.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Motivo de la Excepción (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej: Permiso médico justificado o reposición de laboratorio"
                  value={accessReason}
                  onChange={(e) => setAccessReason(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                />
              </div>

              <button
                type="submit"
                disabled={!selectedStudentForAccess}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl disabled:opacity-50 text-xs shadow-xs cursor-pointer transition-all"
              >
                Conceder Acceso Manual
              </button>
            </form>
          </section>

          {/* Listado de Estudiantes Inscritos */}
          <section className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="border-b border-slate-100 pb-4 mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-600" /> Estudiantes Inscritos
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Seguimiento de avance individual y elegibilidad para certificación.</p>
                </div>
                <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-xs font-bold border border-slate-200">
                  {filteredStudents.length} / 20 Cupos
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                {filteredStudents.length === 0 ? (
                  <p className="text-slate-400 text-xs italic py-4">No hay estudiantes inscritos aún en el sistema.</p>
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
                      <div key={st.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center hover:bg-slate-100/60 transition-colors">
                        <div>
                          <p className="font-semibold text-slate-900 text-xs">{st.name} {st.lastName}</p>
                          <p className="text-[11px] text-slate-500">{st.email}</p>
                        </div>
                        <div className="text-right">
                          {progressPct === 100 ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[11px] px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                              <CheckCircle className="w-3 h-3" /> Apto Certificación
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-700 text-[11px] px-2.5 py-0.5 rounded-full font-semibold border border-slate-200">
                              {progressPct}% Progreso
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Mínimo para abrir curso: <b>10</b></span>
              <span>Límite máximo de admisión: <b>20</b></span>
            </div>
          </section>

        </div>

      </main>
    </div>
  );
};
