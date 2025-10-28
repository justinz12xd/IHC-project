"use client"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function AuthStatus() {
  const { user, isAuthenticated, loading, logout } = useAuth()

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Cargando...</p>
        </CardContent>
      </Card>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No hay usuario autenticado</p>
        </CardContent>
      </Card>
    )
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive"
      case "organizer":
        return "default"
      case "vendor":
        return "secondary"
      case "normal":
      default:
        return "outline"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador"
      case "organizer":
        return "Organizador"
      case "vendor":
        return "Vendedor"
      case "normal":
      default:
        return "Usuario"
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Estado de Autenticación</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="font-medium">{user.fullName}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        
        <div>
          <Badge variant={getRoleBadgeVariant(user.role)}>
            {getRoleLabel(user.role)}
          </Badge>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>ID: {user.id}</p>
          <p>Registrado: {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>

        <Button onClick={logout} variant="outline" className="w-full">
          Cerrar Sesión
        </Button>
      </CardContent>
    </Card>
  )
}