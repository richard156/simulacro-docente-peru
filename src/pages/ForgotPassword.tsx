import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, Loader2, AlertCircle, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError('El correo electrónico es obligatorio')
      return
    }

    setIsLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err: any) {
      const message = err?.message ?? ''
      if (message.includes('Email not found')) {
        setError('No encontramos una cuenta con ese correo electrónico')
      } else {
        setError(message || 'Error al enviar el correo. Intenta de nuevo.')
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
            Recupera tu contraseña
          </p>
        </div>

        <Card className="shadow-xl border-0">
          {sent ? (
            <>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">Correo enviado</CardTitle>
                </div>
                <CardDescription className="text-sm text-gray-500">
                  Hemos enviado un enlace de recuperación a <strong className="text-gray-700">{email}</strong>.
                  Revisa tu bandeja de entrada y sigue las instrucciones.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
                  <p className="font-medium mb-1">¿No recibiste el correo?</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-600">
                    <li>Revisa tu carpeta de spam o correo no deseado</li>
                    <li>Espera unos minutos e intenta de nuevo</li>
                    <li>Verifica que el correo ingresado sea correcto</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4 pt-2">
                <Button
                  onClick={() => setSent(false)}
                  variant="outline"
                  className="w-full h-11"
                >
                  Intentar con otro correo
                </Button>
                <Link
                  to="/login"
                  className="text-sm text-center text-primary font-medium hover:underline"
                >
                  Volver a iniciar sesión
                </Link>
              </CardFooter>
            </>
          ) : (
            <>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-900">Recuperar contraseña</CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
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
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@correo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        className="h-11 pl-10"
                        autoComplete="email"
                        autoFocus
                      />
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
                        Enviando...
                      </>
                    ) : (
                      'Enviar enlace de recuperación'
                    )}
                  </Button>

                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Volver a iniciar sesión
                  </Link>
                </CardFooter>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
