import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, ShoppingBag, BarChart3, Shield, Store, Briefcase, User } from "lucide-react"
import { AuthStatus } from "@/components/auth-status"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-balance">
            Plataforma de Gestión de Eventos Agroproductivos
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground text-pretty">
            Conecta productores, organizadores y asistentes en un solo lugar. Gestiona eventos, productos y ventas de
            manera eficiente.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg">
              <Link href="/register">Comenzar Ahora</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
          </div>
        </div>

       


        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          <div className="bg-card p-6 rounded-lg border space-y-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <h3 className="font-semibold text-lg">Gestión de Eventos</h3>
            <p className="text-sm text-muted-foreground">Crea y administra eventos agroproductivos con facilidad</p>
          </div>

          <div className="bg-card p-6 rounded-lg border space-y-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <h3 className="font-semibold text-lg">Catálogo de Productos</h3>
            <p className="text-sm text-muted-foreground">
              Muestra tus productos con descripciones detalladas e historias
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border space-y-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <h3 className="font-semibold text-lg">Control de Asistencia</h3>
            <p className="text-sm text-muted-foreground">Sistema de QR para registro y seguimiento de asistentes</p>
          </div>

          <div className="bg-card p-6 rounded-lg border space-y-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <h3 className="font-semibold text-lg">Reportes y Métricas</h3>
            <p className="text-sm text-muted-foreground">Analiza ventas, asistencias y rendimiento de eventos</p>
          </div>
        </div>

        {/* Roles Section */}
        <div className="mt-20 space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold">Roles y Funcionalidades</h2>
            <p className="text-muted-foreground text-lg">La plataforma ofrece diferentes experiencias según tu rol</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Usuario Normal */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-500" aria-hidden="true" />
                  </div>
                  <div>
                    <CardTitle>Usuario Normal</CardTitle>
                    <CardDescription>Asiste a eventos y descubre productos</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Ver y registrarse en eventos próximos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Explorar catálogos de vendedores</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Marcar asistencia con código QR</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Historial de eventos asistidos</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Vendedor */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <Store className="w-5 h-5 text-green-500" aria-hidden="true" />
                  </div>
                  <div>
                    <CardTitle>Vendedor</CardTitle>
                    <CardDescription>Vende productos en eventos</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Crear y gestionar catálogo de productos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Gestionar inventario por evento</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Registrar asistencia con QR</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Ver estadísticas de ventas</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Organizador */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-purple-500" aria-hidden="true" />
                  </div>
                  <div>
                    <CardTitle>Organizador</CardTitle>
                    <CardDescription>Crea y gestiona eventos</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Crear y publicar eventos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Aprobar vendedores para eventos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Escanear QR de asistentes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Generar reportes y exportar datos</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Administrador */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-red-500" aria-hidden="true" />
                  </div>
                  <div>
                    <CardTitle>Administrador</CardTitle>
                    <CardDescription>Supervisa la plataforma</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Aprobar o rechazar eventos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Validar documentación de eventos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Proporcionar feedback a organizadores</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Ver métricas globales de la plataforma</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Endpoints Guide */}


        {/* CTA Section */}
        <div className="mt-20 text-center space-y-6 bg-card p-12 rounded-lg border">
          <h2 className="text-3xl font-bold">¿Listo para comenzar?</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Únete a nuestra plataforma y comienza a gestionar eventos agroproductivos de manera profesional
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg">
              <Link href="/register">Crear Cuenta</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Ya tengo cuenta</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
