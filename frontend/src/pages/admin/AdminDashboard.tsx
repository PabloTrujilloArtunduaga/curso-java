import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { ModuleLock, QRToken, AttendanceRecord, User, ModuleStatusType, ManualAccess } from '../../types';
import { courseModules } from '../../data/courseData';
import { QRCodeSVG } from 'qrcode.react';
import { Lock, QrCode, StopCircle, Key, Award, CheckCircle, Clock } from 'lucide-react';
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

  const loadData = async () => {
    const l = await api.getModuleLocks();
    setLocks(l);
    const a = await api.getAllAttendances();
    setAttendances(a);
    const s = await api.getStudents();
    setStudents(s);
    const m = await api.getManualAccesses();
    setManualAccesses(m);

    // Check active session for selected module
    const active = await api.getActiveAttendanceSession(selectedModuleForQR);
    setActiveSession(active);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      api.getAllAttendances().then(setAttendances);
      api.getManualAccesses().then(setManualAccesses);
      api.getStudents().then(setStudents);
      api.getActiveAttendanceSession(selectedModuleForQR).then(setActiveSession);
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
    const session = await api.createAttendanceSession(selectedModuleForQR, 90); // 90 segundos activo
    setActiveSession(session);
    setTimeLeft(90);
  };

  const handleDeactivateQR = async () => {
    if (activeSession) {
      await api.closeAttendanceSession(activeSession.id);
      setActiveSession(null);
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
      setGrantMessage('El estudiante ya cuenta con acceso a este módulo.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const activeModuleObj = courseModules.find(m => m.id === selectedModuleForQR);
  const activeModuleAttendances = attendances.filter(a => a.moduleId === selectedModuleForQR);

  return (
    <div className="min-h-screen bg-slate-100 pb-16">
      {/* Top Navbar Header */}
      <nav className="bg-slate-900 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Panel Administrativo</h1>
              <p className="text-xs text-slate-400">Curso Presencial de Java</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-300 hidden md:inline">
              Profesor: <b className="text-white">{user?.name}</b>
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8 mt-4">

        {/* Fila 1: Pantalla QR del Administrador & Gestión de Estados */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Pantalla Especial de QR (Punto 10 de los requerimientos) */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center">
            <div className="w-full flex justify-between items-center border-b pb-3 mb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-indigo-600" /> Asistencia — Semana {selectedModuleForQR}
                </h2>
                <p className="text-xs text-slate-500 font-medium">{activeModuleObj?.title}</p>
              </div>

              <select
                value={selectedModuleForQR}
                onChange={(e) => setSelectedModuleForQR(Number(e.target.value))}
                className="bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {courseModules.map(m => (
                  <option key={m.id} value={m.id}>Semana {m.id}</option>
                ))}
              </select>
            </div>

            {/* Tarjeta del QR Grande */}
            {!activeSession ? (
              <div className="w-full flex-1 min-h-[320px] bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                <QrCode className="w-20 h-20 text-slate-300 mb-4" />
                <h3 className="font-bold text-slate-700 text-lg">Sesión de Asistencia Inactiva</h3>
                <p className="text-slate-500 text-sm max-w-xs mt-1 mb-6">
                  Presiona el botón para activar la sesión y proyectar el código QR dinámico en pantalla.
                </p>
                <button
                  onClick={handleActivateQR}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all text-sm cursor-pointer flex items-center gap-2"
                >
                  <QrCode className="w-5 h-5" /> Activar Asistencia (90s)
                </button>
              </div>
            ) : (
              <div className="w-full bg-slate-900 text-white p-6 rounded-2xl flex flex-col items-center shadow-xl border border-slate-800">
                {/* Visualización exacta de la especificación */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="font-bold text-emerald-400 text-sm tracking-wide uppercase">Estado: ● ACTIVA</span>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-2xl mb-4 border-4 border-indigo-500">
                  <QRCodeSVG value={activeSession.token} size={220} level="H" />
                </div>

                <div className="flex items-center gap-2 bg-slate-800 px-4 py-1.5 rounded-full border border-slate-700 mb-4">
                  <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                  <span className="text-sm font-bold text-amber-300">Expira en: {timeLeft}s</span>
                </div>

                <div className="text-center mb-6">
                  <p className="text-2xl font-black text-white">
                    Presentes: <span className="text-indigo-400">{activeModuleAttendances.length}</span> / {students.length}
                  </p>
                </div>

                <button
                  onClick={handleDeactivateQR}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <StopCircle className="w-5 h-5" /> Desactivar Asistencia
                </button>
              </div>
            )}

            {/* Asistentes de la sesión en tiempo real */}
            <div className="w-full mt-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
                <span>Estudiantes que ya registraron</span>
                <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                  {activeModuleAttendances.length}
                </span>
              </h4>
              <div className="max-h-36 overflow-y-auto space-y-1.5">
                {activeModuleAttendances.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Ningún estudiante ha escaneado aún.</p>
                ) : (
                  activeModuleAttendances.map(a => {
                    const st = students.find(s => s.id === a.studentId);
                    return (
                      <div key={a.id} className="text-xs bg-white p-2 rounded-lg border border-slate-200 flex justify-between items-center font-medium">
                        <span>{st?.name} {st?.lastName} ({st?.email})</span>
                        <span className="text-emerald-600 font-bold">✓ Presente</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>

          {/* Estado de los 5 Módulos */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 border-b pb-3 mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-600" /> Control de Estados de los Módulos
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Cambia la visibilidad de los contenidos para los estudiantes (<b>LOCKED</b> = bloqueado, <b>OPEN</b> = abierto para clase, <b>CLOSED</b> = finalizado).
              </p>

              <div className="space-y-3">
                {courseModules.map(mod => {
                  const lock = locks.find(l => l.moduleId === mod.id);
                  const currentStatus: ModuleStatusType = lock ? lock.status : 'LOCKED';

                  return (
                    <div key={mod.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm">Semana {mod.id}: {mod.title}</h3>
                        <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded font-black tracking-wider ${
                          currentStatus === 'OPEN' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          currentStatus === 'CLOSED' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                          'bg-slate-200 text-slate-700'
                        }`}>
                          {currentStatus}
                        </span>
                      </div>

                      <select
                        value={currentStatus}
                        onChange={(e) => handleStatusChange(mod.id, e.target.value as ModuleStatusType)}
                        className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

        {/* Fila 2: Excepción Manual & Listado de Alumnos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Autorización Manual */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-extrabold text-slate-900 border-b pb-3 mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-600" /> Excepción del Administrador (Acceso Manual)
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Concede acceso manual a un estudiante para un módulo en caso de ausencia justificada.
            </p>

            {grantMessage && (
              <div className="mb-4 p-3 bg-indigo-50 text-indigo-800 rounded-xl text-xs font-semibold border border-indigo-200">
                {grantMessage}
              </div>
            )}

            <form onSubmit={handleGrantAccess} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Seleccionar Estudiante</label>
                <select
                  value={selectedStudentForAccess}
                  onChange={(e) => setSelectedStudentForAccess(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-medium"
                >
                  <option value="">-- Seleccionar Alumno --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} {s.lastName} ({s.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Módulo a Habilitar</label>
                <select
                  value={selectedModuleForAccess}
                  onChange={(e) => setSelectedModuleForAccess(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-medium"
                >
                  {courseModules.map(m => (
                    <option key={m.id} value={m.id}>Semana {m.id}: {m.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Motivo (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej: Permiso médico justificado"
                  value={accessReason}
                  onChange={(e) => setAccessReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={!selectedStudentForAccess}
                className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl hover:bg-slate-800 disabled:opacity-50 text-xs shadow-md cursor-pointer transition-all"
              >
                Conceder Acceso Manual
              </button>
            </form>
          </section>

          {/* Listado General de Alumnos & Cumplimiento */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-extrabold text-slate-900 border-b pb-3 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" /> Registro de Estudiantes ({students.length} / 20)
            </h2>

            <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
              {students.length === 0 ? (
                <p className="text-slate-400 text-xs italic">No hay estudiantes inscritos aún.</p>
              ) : (
                students.map(st => {
                  const studentAttendances = attendances.filter(a => a.studentId === st.id);
                  const studentManual = manualAccesses.filter(m => m.studentId === st.id);
                  const completedCount = new Set([
                    ...studentAttendances.map(a => a.moduleId),
                    ...studentManual.map(m => m.moduleId)
                  ]).size;
                  const progressPct = Math.round((completedCount / courseModules.length) * 100);

                  return (
                    <div key={st.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-800 text-xs">{st.name} {st.lastName}</p>
                        <p className="text-[11px] text-slate-500">{st.email}</p>
                      </div>
                      <div className="text-right">
                        {progressPct === 100 ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-extrabold">
                            <CheckCircle className="w-3 h-3" /> Apto Certificación
                          </span>
                        ) : (
                          <span className="bg-indigo-100 text-indigo-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
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
