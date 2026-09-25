import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Course } from './pages/Course';
import { Module } from './pages/Module';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Rutas Públicas */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Rutas para Estudiantes */}
              <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
                <Route path="/dashboard" element={<StudentDashboard />} />
                <Route path="/course" element={<Course />} />
                <Route path="/module/:id" element={<Module />} />
              </Route>

              {/* Rutas para Administradores */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
