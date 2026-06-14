import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError('El correo electrónico es obligatorio')
      return
    }
    if (!password) {
      setError('La contraseña es obligatoria')
      return
    }

    setIsLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      const message = err?.message ?? ''
      if (message.includes('Invalid login credentials')) {
        setError('Correo o contraseña incorrectos')
      } else if (message.includes('Email not confirmed')) {
        setError('Por favor confirma tu correo electrónico antes de iniciar sesión')
      } else {
        setError(message || 'Error al iniciar sesión. Intenta de nuevo.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary shadow-lg shadow-primary/25 mb-4">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Simulacro Docente</h1>
          <p className="text-sm text-gray-500 mt-1">
            Inicia sesión para continuar practicando
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900">Iniciar Sesión</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Ingresa tus credenciales para acceder a tu cuenta
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="h-11"
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Contraseña
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="h-11 pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>

              <p className="text-sm text-center text-gray-500">
                ¿No tienes cuenta?{' '}
                <Link to="/register" className="text-primary font-medium hover:underline">
                  Regístrate aquí
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
