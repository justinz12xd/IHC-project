"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { loginUser, getRedirectPath } from "@/lib/auth/supabase-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { FormProgress } from "@/components/form-progress"
import Link from "next/link"
import { useLanguage } from "@/lib/i18n/language-context"

const REMEMBERED_EMAIL_KEY = "remembered_email"

export default function LoginPage() {
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockCountdown, setBlockCountdown] = useState(0)
  const router = useRouter()

  // Cargar email recordado al montar el componente
  useEffect(() => {
    const savedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY)
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  // Manejar countdown del bloqueo
  useEffect(() => {
    if (blockCountdown > 0) {
      const timer = setInterval(() => {
        setBlockCountdown(prev => {
          if (prev <= 1) {
            setIsBlocked(false)
            setError("")
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      return () => clearInterval(timer)
    }
  }, [blockCountdown])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await loginUser(email, password)
      console.log("[login page] loginUser result:", result)

      if (result.success && result.user) {
        // Guardar o eliminar email según "Recordar usuario"
        if (rememberMe) {
          localStorage.setItem(REMEMBERED_EMAIL_KEY, email)
        } else {
          localStorage.removeItem(REMEMBERED_EMAIL_KEY)
        }

        // Redirigir según el rol del usuario
        const redirectPath = getRedirectPath(result.user.role)
        router.push(redirectPath)
        router.refresh()
      } else {
        // Manejar bloqueo
        if (result.isBlocked && result.remainingTime) {
          setIsBlocked(true)
          setBlockCountdown(result.remainingTime)
        }
        
        setError(result.error || "Error al iniciar sesión")
        
        // Registrar intento fallido para notificación al admin
        await recordFailedLoginAttempt(email)
      }
    } catch (err: any) {
      console.error("Login error:", err)
      setError("Error inesperado. Por favor, intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  // Función para registrar intentos fallidos
  async function recordFailedLoginAttempt(email: string) {
    try {
      // Guardar en localStorage para tracking temporal
      const attempts = JSON.parse(localStorage.getItem("failed_login_attempts") || "[]")
      attempts.push({
        email,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      })
      
      // Mantener solo los últimos 10 intentos
      if (attempts.length > 10) {
        attempts.shift()
      }
      
      localStorage.setItem("failed_login_attempts", JSON.stringify(attempts))
    } catch (error) {
      console.error("Error recording failed attempt:", error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">{t("auth.loginTitle")}</CardTitle>
          <CardDescription>{t("auth.loginSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {error}
                  {isBlocked && blockCountdown > 0 && (
                    <div className="mt-2 font-mono text-lg">
                      Tiempo restante: {blockCountdown}s
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <FormProgress
              fields={[
                { name: 'email', value: email, required: true, label: 'Correo electrónico' },
                { name: 'password', value: password, required: true, label: 'Contraseña' },
              ]}
            />

            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                  {t("auth.forgotPassword")}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                aria-required="true"
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label
                htmlFor="remember"
                className="text-sm font-normal cursor-pointer"
              >
                Recordar mi correo electrónico
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={loading || isBlocked}>
              {loading ? t("auth.loggingIn") : isBlocked ? `Bloqueado (${blockCountdown}s)` : t("auth.loginButton")}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {t("auth.noAccount")}{" "}
              <Link href="/register" className="text-primary hover:underline">
                {t("auth.registerHere")}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
