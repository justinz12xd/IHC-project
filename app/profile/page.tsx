"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { updateUserProfile, changePassword } from "@/lib/auth/local-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Lock, Bell, Shield } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useLanguage } from "@/lib/i18n/language-context"

export default function ProfilePage() {
  const { t } = useLanguage()
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  
  // Estado para edición de perfil
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  
  // Estado para cambio de contraseña
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
    }
    if (user) {
      setFullName(user.fullName || "")
      setPhone(user.phone || "")
    }
  }, [user, isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const roleLabels = {
    normal: "Usuario",
    vendor: "Vendedor",
    organizer: "Organizador",
    admin: "Administrador",
  }

  const handleSaveProfile = () => {
    setProfileMessage(null)
    const result = updateUserProfile({ fullName, phone })
    
    if (result.success) {
      setProfileMessage({ type: "success", text: t("profile.updated") })
      setIsEditing(false)
    } else {
      setProfileMessage({ type: "error", text: result.error || "Error al actualizar perfil" })
    }
  }

  const handleChangePassword = () => {
    setPasswordMessage(null)
    
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Las contraseñas no coinciden" })
      return
    }
    
    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "La contraseña debe tener al menos 6 caracteres" })
      return
    }
    
    const result = changePassword(currentPassword, newPassword)
    
    if (result.success) {
      setPasswordMessage({ type: "success", text: t("profile.passwordUpdated") })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } else {
      setPasswordMessage({ type: "error", text: result.error || "Error al cambiar contraseña" })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">{t("profile.title")}</h1>
            <p className="text-muted-foreground text-lg">{t("profile.subtitle")}</p>
          </div>

          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{t("profile.personal")}</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Lock className="h-4 w-4" />
                <span className="hidden sm:inline">{t("profile.security")}</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">{t("profile.notifications")}</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">{t("profile.privacy")}</span>
              </TabsTrigger>
            </TabsList>

            {/* Información Personal */}
            <TabsContent value="personal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t("profile.personalInfo")}</CardTitle>
                  <CardDescription>{t("profile.personalInfoDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {profileMessage && (
                    <Alert variant={profileMessage.type === "error" ? "destructive" : "default"}>
                      <AlertDescription>{profileMessage.text}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">{t("auth.email")}</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Input id="email" type="email" value={user.email} disabled className="bg-muted" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>El correo electrónico no puede ser modificado</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName">{t("auth.fullName")}</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={!isEditing}
                      placeholder={t("auth.fullName")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("auth.phone")} ({t("common.optional")})</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={!isEditing}
                      placeholder="+51 999 999 999"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">{t("auth.role")}</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-sm">
                        {roleLabels[user.role as keyof typeof roleLabels] || "Usuario"}
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      {t("profile.memberSince")}{" "}
                      {new Date(user.createdAt).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {!isEditing ? (
                      <Button onClick={() => setIsEditing(true)}>{t("profile.editProfile")}</Button>
                    ) : (
                      <>
                        <Button onClick={handleSaveProfile}>{t("profile.saveChanges")}</Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false)
                            setFullName(user.fullName || "")
                            setPhone(user.phone || "")
                            setProfileMessage(null)
                          }}
                        >
                          {t("common.cancel")}
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Seguridad */}
            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t("profile.changePassword")}</CardTitle>
                  <CardDescription>{t("profile.changePasswordDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {passwordMessage && (
                    <Alert variant={passwordMessage.type === "error" ? "destructive" : "default"}>
                      <AlertDescription>{passwordMessage.text}</AlertDescription>
                    </Alert>
                  )}

                                    <div className="space-y-2">
                    <Label htmlFor="currentPassword">{t("auth.currentPassword")}</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder={t("auth.currentPassword")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">{t("auth.newPassword")}</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={t("auth.newPassword")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t("auth.confirmPassword")}
                    />
                  </div>

                  <Button onClick={handleChangePassword}>{t("profile.changePassword")}</Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notificaciones */}
            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Preferencias de Notificaciones</CardTitle>
                  <CardDescription>Gestiona cómo y cuándo recibes notificaciones</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      🚧 Esta funcionalidad estará disponible próximamente
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacidad */}
            <TabsContent value="privacy" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Privacidad y Datos</CardTitle>
                  <CardDescription>Controla tu información y privacidad</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      🚧 Esta funcionalidad estará disponible próximamente
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
