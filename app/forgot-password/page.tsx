"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Mail, CheckCircle } from "lucide-react"
import { getStoredUsers } from "@/lib/auth/local-auth"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Simular verificación de email
    setTimeout(() => {
      const users = getStoredUsers()
      const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase())

      if (!userExists) {
        setError("No existe una cuenta con este correo electrónico")
        setLoading(false)
        return
      }

      // Simular envío de email (en producción, aquí se enviaría un email real)
      setIsSubmitted(true)
      setLoading(false)
    }, 1000)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Correo Enviado</CardTitle>
            <CardDescription>
              Revisa tu bandeja de entrada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                Hemos enviado un enlace de recuperación a <strong>{email}</strong>. 
                Por favor, revisa tu correo y sigue las instrucciones.
              </AlertDescription>
            </Alert>

            <p className="text-sm text-muted-foreground text-center">
              Si no recibes el correo en unos minutos, revisa tu carpeta de spam.
            </p>

            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al inicio de sesión
                </Link>
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full" 
                onClick={() => {
                  setIsSubmitted(false)
                  setEmail("")
                }}
              >
                Enviar a otro correo
              </Button>
            </div>

            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md">
              <p className="text-xs text-amber-800 dark:text-amber-200">
                <strong>Nota de desarrollo:</strong> Esta es una simulación. En producción, 
                se enviaría un correo real con un token seguro para restablecer la contraseña.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">¿Olvidaste tu contraseña?</CardTitle>
          <CardDescription>
            Ingresa tu correo electrónico y te enviaremos instrucciones para recuperar tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-required="true"
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar enlace de recuperación
                </>
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 text-sm">
              <Link 
                href="/login" 
                className="text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" />
                Volver al inicio de sesión
              </Link>
            </div>

            {/* Info de usuarios de prueba */}
            {process.env.NODE_ENV === "development" && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Correos de prueba disponibles:
                </p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>• admin@test.com</p>
                  <p>• organizer@test.com</p>
                  <p>• vendor@test.com</p>
                  <p>• user@test.com</p>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
