import { Outlet, Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  History,
  User,
  LogOut,
  GraduationCap,
  Menu,
  X,
  Shield,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/exams', label: 'Exámenes', icon: FileText },
  { to: '/history', label: 'Historial', icon: History },
  { to: '/profile', label: 'Perfil', icon: User },
]

export function DashboardLayout() {
  const location = useLocation()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isAdmin = user?.role === 'admin'

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // Si falla el logout, igual redirigir
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar móvil overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 left-0 z-50 h-full w-64 bg-white border-r shadow-sm transition-transform duration-300',
        'lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-sm">
                Simulacro Docente
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navegación */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.to
                const Icon = item.icon
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <Icon className={cn(
                      'h-5 w-5',
                      isActive ? 'text-primary' : 'text-gray-400'
                    )} />
                    {item.label}
                  </Link>
                )
              })}

              {/* Admin link - solo visible para admins */}
              {isAdmin && (
                <>
                  <div className="pt-3 pb-1">
                    <div className="h-px bg-gray-200" />
                  </div>
                  <Link
                    to="/admin"
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                      location.pathname.startsWith('/admin')
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <Shield className={cn(
                      'h-5 w-5',
                      location.pathname.startsWith('/admin') ? 'text-primary' : 'text-gray-400'
                    )} />
                    Admin Panel
                  </Link>
                </>
              )}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="p-3 border-t">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-3 text-gray-600 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="lg:pl-64">
        {/* Header móvil */}
        <header className="sticky top-0 z-30 bg-white border-b shadow-sm lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 hover:text-gray-900"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900 text-sm">
                Simulacro Docente
              </span>
            </div>
            <div className="w-6" /> {/* Spacer */}
          </div>
        </header>

        {/* Contenido */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
