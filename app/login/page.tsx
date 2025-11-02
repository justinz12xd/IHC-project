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
import Link from "next/link"
import { useLanguage } from "@/lib/i18n/language-context"

export default function LoginPage() {
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await loginUser(email, password)
      console.log("[login page] loginUser result:", result)

      if (result.success && result.user) {
        // Redirigir según el rol del usuario
        const redirectPath = getRedirectPath(result.user.role)
        router.push(redirectPath)
        router.refresh()
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
          <CardTitle className="text-2xl font-bold">{t("auth.loginTitle")}</CardTitle>
          <CardDescription>{t("auth.loginSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

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
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("auth.loggingIn") : t("auth.loginButton")}
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
