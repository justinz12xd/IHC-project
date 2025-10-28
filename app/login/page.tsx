"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { loginUser, getRedirectPath, initializeTestUsers } from "@/lib/auth/local-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Inicializar usuarios de prueba
  useEffect(() => {
    initializeTestUsers()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = loginUser(email, password)
      console.log("[login page] loginUser result:", result)

      if (result.success && result.user) {
        // Redirigir según el rol del usuario
        const redirectPath = getRedirectPath(result.user.role)
        router.push(redirectPath)
      } else {
        setError(result.error || "Error al iniciar sesión")
      }
    } catch (err: any) {
      console.error("Login error:", err)
      setError("Error inesperado. Por favor, intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
          <CardDescription>Ingresa tus credenciales para acceder a la plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                aria-required="true"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Regístrate aquí
              </Link>
            </p>

            {/* Usuarios de prueba - Solo para desarrollo */}
            {process.env.NODE_ENV === "development" && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="text-xs font-medium text-muted-foreground mb-2">Usuarios de prueba:</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>admin@test.com / 123456 (Admin)</p>
                  <p>organizer@test.com / 123456 (Organizador)</p>
                  <p>vendor@test.com / 123456 (Vendedor)</p>
                  <p>user@test.com / 123456 (Usuario)</p>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
