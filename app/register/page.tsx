"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { registerUser, getRedirectPath, initializeTestUsers } from "@/lib/auth/local-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useLanguage } from "@/lib/i18n/language-context"

export default function RegisterPage() {
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState<"normal" | "vendor" | "organizer">("normal")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Inicializar usuarios de prueba
  useEffect(() => {
    initializeTestUsers()
  }, [])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = registerUser({
        email,
        password,
        fullName,
        role,
      })
      console.log("[register page] registerUser result:", result)
      
      if (result.success && result.user) {
        // Pequeño delay para asegurar que el evento auth-change se procese
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Redirigir según el rol
        const redirectPath = getRedirectPath(role)
        router.push(redirectPath)
        
        // Forzar recarga del estado después de la redirección
        router.refresh()
      } else {
        setError(result.error || "Error al registrarse")
      }
    } catch (err: any) {
      console.error("Unexpected registration error:", err)
      setError("Error inesperado. Por favor, intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">{t("auth.registerTitle")}</CardTitle>
          <CardDescription>{t("auth.registerSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">{t("auth.fullName")}</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Juan Pérez"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                aria-required="true"
              />
            </div>

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
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                aria-required="true"
                aria-describedby="password-hint"
              />
              <p id="password-hint" className="text-xs text-muted-foreground">
                Mínimo 6 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">{t("auth.role")}</Label>
              <Select value={role} onValueChange={(value: any) => setRole(value)}>
                <SelectTrigger id="role" aria-label="Seleccionar tipo de cuenta">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">{t("roles.user")}</SelectItem>
                  <SelectItem value="vendor">{t("roles.vendor")}</SelectItem>
                  <SelectItem value="organizer">{t("roles.organizer")}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {role === "normal" && t("roles.userDesc")}
                {role === "vendor" && t("roles.vendorDesc")}
                {role === "organizer" && t("roles.organizerDesc")}
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("auth.creatingAccount") : t("auth.registerButton")}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {t("auth.hasAccount")}{" "}
              <Link href="/login" className="text-primary hover:underline">
                {t("auth.loginHere")}
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
