"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, ShoppingCart, Calendar, Settings } from "lucide-react"

export default function TemporaryHomePage() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">🚧 Modo de Desarrollo - Sin Autenticación</h1>
          <p className="text-muted-foreground text-lg">
            Todas las rutas están disponibles sin restricciones para testing
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Users className="h-12 w-12 mx-auto mb-2 text-blue-500" />
              <CardTitle>Usuario Normal</CardTitle>
              <CardDescription>Ver eventos y registrarse</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/profile">Perfil</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <CardTitle>Vendedor</CardTitle>
              <CardDescription>Gestionar productos e inventario</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full">
                <Link href="/vendor/dashboard">Dashboard</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/vendor/profile">Perfil</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/vendor/products/new">Productos</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Calendar className="h-12 w-12 mx-auto mb-2 text-purple-500" />
              <CardTitle>Organizador</CardTitle>
              <CardDescription>Crear y gestionar eventos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full">
                <Link href="/organizer/dashboard">Dashboard</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/organizer/events/new">Nuevo Evento</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Settings className="h-12 w-12 mx-auto mb-2 text-red-500" />
              <CardTitle>Administrador</CardTitle>
              <CardDescription>Aprobar eventos y métricas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/dashboard">Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Páginas de Autenticación</CardTitle>
              <CardDescription>Para probar el sistema de localStorage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/register">Registro</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información del Estado</CardTitle>
              <CardDescription>Estado actual del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                ✅ Middleware desactivado
              </p>
              <p className="text-sm text-muted-foreground">
                ✅ Redirecciones automáticas comentadas
              </p>
              <p className="text-sm text-muted-foreground">
                ⚠️ Algunas páginas pueden mostrar errores por falta de datos
              </p>
              <p className="text-sm text-muted-foreground">
                🔧 Sistema localStorage en desarrollo
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Para reactivar la autenticación, descomenta el código en middleware.ts y las páginas individuales
          </p>
        </div>
      </div>
    </div>
  )
}