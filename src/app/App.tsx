import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { ForgotPassword } from '@/pages/ForgotPassword'
import { Dashboard } from '@/pages/Dashboard'
import { ExamCatalog } from '@/pages/ExamCatalog'
import { ExamSimulation } from '@/pages/ExamSimulation'
import { ExamResults } from '@/pages/ExamResults'
import { AdminDashboard } from '@/pages/AdminDashboard'
import { AdminExamCreate } from '@/pages/AdminExamCreate'
import { AdminExamCases } from '@/pages/AdminExamCases'
import { AdminCaseCreate } from '@/pages/AdminCaseCreate'
import { AdminCaseEdit } from '@/pages/AdminCaseEdit'
import { AdminQuestionsCreate } from '@/pages/AdminQuestionsCreate'
import { AdminPDFUpload } from '@/pages/AdminPDFUpload'
import { AdminUsers } from '@/pages/AdminUsers'
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'

// Componente para rutas protegidas
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-gray-500 text-sm">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// Componente para redirigir si ya está autenticado
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-gray-500 text-sm">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Rutas públicas (solo para no autenticados) */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />

        {/* Ruta raíz redirige según autenticación */}
        <Route path="/" element={<RootRedirect />} />

        {/* Rutas protegidas con DashboardLayout */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/exams" element={<ExamCatalog />} />
          <Route path="/history" element={
            <div className="flex items-center justify-center h-64 text-gray-400">
              <p>Historial - Próximamente</p>
            </div>
          } />
          <Route path="/profile" element={
            <div className="flex items-center justify-center h-64 text-gray-400">
              <p>Perfil - Próximamente</p>
            </div>
          } />
        </Route>

        {/* Rutas protegidas sin DashboardLayout (pantalla completa) */}
        <Route
          path="/exam/:examId"
          element={
            <ProtectedRoute>
              <ExamSimulation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/results/:attemptId"
          element={
            <ProtectedRoute>
              <ExamResults />
            </ProtectedRoute>
          }
        />

        {/* Rutas de administración */}
        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/exam/create" element={<AdminExamCreate />} />
          <Route path="/admin/exam/edit/:examId" element={<AdminExamCreate />} />
          <Route path="/admin/exam/:examId/cases" element={<AdminExamCases />} />
          <Route path="/admin/exam/:examId/case/create" element={<AdminCaseCreate />} />
          <Route path="/admin/exam/:examId/cases/:caseId/edit" element={<AdminCaseEdit />} />
          <Route path="/admin/exam/:examId/cases/:caseId/questions" element={<AdminQuestionsCreate />} />
          <Route path="/admin/pdf/upload" element={<AdminPDFUpload />} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route>

        {/* Ruta 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}

// Componente que redirige según estado de autenticación
function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-gray-500 text-sm">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  return isAuthenticated
    ? <Navigate to="/dashboard" replace />
    : <Navigate to="/login" replace />
}
