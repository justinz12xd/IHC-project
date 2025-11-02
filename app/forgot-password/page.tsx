"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Mail, CheckCircle } from "lucide-react"
import { resetPassword } from "@/lib/auth/supabase-auth"
import { useLanguage } from "@/lib/i18n/language-context"

export default function ForgotPasswordPage() {
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await resetPassword(email)
      
      if (result.success) {
        setIsSubmitted(true)
      } else {
        setError(result.error || "Error al enviar el correo de recuperación")
      }
    } catch (err: any) {
      console.error("Password reset error:", err)
      setError("Error inesperado. Por favor, intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">{t("auth.checkYourEmail")}</CardTitle>
            <CardDescription>
              {t("auth.checkInbox")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                {t("auth.passwordResetSent")} <strong>{email}</strong>. 
                {t("auth.checkEmailInstructions")}
              </AlertDescription>
            </Alert>

            <p className="text-sm text-muted-foreground text-center">
              {t("auth.checkSpam")}
            </p>

            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("auth.backToLogin")}
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
                {t("auth.sendToAnotherEmail")}
              </Button>
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
          <CardTitle className="text-2xl font-bold">{t("auth.forgotPassword")}</CardTitle>
          <CardDescription>
            {t("auth.forgotPasswordSubtitle")}
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
              <Label htmlFor="email">{t("auth.email")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-required="true"
                  disabled={loading}
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {t("auth.resetPasswordInstructions")}
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("auth.sending") : t("auth.sendResetLink")}
            </Button>

            <div className="flex items-center justify-center gap-2 text-sm">
              <Link 
                href="/login" 
                className="text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" />
                {t("auth.backToLogin")}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
