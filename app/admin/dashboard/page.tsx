"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, Clock, BarChart3, Users, Calendar, TrendingUp, Shield } from "lucide-react"
import { SecurityNotifications } from "@/components/security-notifications"

// Datos de ejemplo para mostrar la interfaz
const mockPendingEvents = [
  {
    id: "1",
    title: "Feria Agrícola de Otoño",
    organizer: {
      full_name: "Juan Pérez"
    },
    location: "Plaza Central",
    start_date: "2025-12-01T09:00:00Z",
    description: "Gran feria con productores locales",
    status: "pending_approval"
  },
  {
    id: "2", 
    title: "Mercado Orgánico Regional",
    organizer: {
      full_name: "María García"
    },
    location: "Centro de Convenciones",
    start_date: "2025-12-15T08:00:00Z",
    description: "Evento dedicado a productos orgánicos certificados",
    status: "pending_approval"
  }
]

const mockMetrics = {
  totalEvents: 45,
  approvedEvents: 38,
  rejectedEvents: 4,
  pendingEvents: 3,
  totalUsers: 1250,
  totalVendors: 89,
  totalOrganizers: 23
}

export default function AdminDashboardPage() {
  const approvalRate = ((mockMetrics.approvedEvents / (mockMetrics.approvedEvents + mockMetrics.rejectedEvents)) * 100).toFixed(1)

  const handleApproval = (eventId: string, action: 'approve' | 'reject') => {
    console.log(`${action} event ${eventId}`)
    // Aquí iría la lógica de aprobación/rechazo
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-linear-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Panel de Administración</h1>
              <p className="text-muted-foreground">Gestión y supervisión de la plataforma</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Eventos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockMetrics.totalEvents}</div>
              <p className="text-xs text-muted-foreground">
                {mockMetrics.pendingEvents} pendientes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasa de Aprobación</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvalRate}%</div>
              <p className="text-xs text-muted-foreground">
                {mockMetrics.approvedEvents} aprobados de {mockMetrics.approvedEvents + mockMetrics.rejectedEvents}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockMetrics.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                usuarios registrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendedores Activos</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockMetrics.totalVendors}</div>
              <p className="text-xs text-muted-foreground">
                vendedores verificados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Security Notifications */}
        <div className="mb-8">
          <SecurityNotifications />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">Eventos Pendientes</TabsTrigger>
            <TabsTrigger value="metrics">Métricas</TabsTrigger>
            <TabsTrigger value="users">Gestión de Usuarios</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Eventos Pendientes de Aprobación</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {mockPendingEvents.length} eventos esperando revisión
              </div>
            </div>

            {mockPendingEvents.length > 0 ? (
              <div className="space-y-4">
                {mockPendingEvents.map((event) => (
                  <Card key={event.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{event.title}</h3>
                            <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                              Pendiente
                            </span>
                          </div>
                          <p className="text-muted-foreground mb-1">
                            👤 Organizador: {event.organizer.full_name}
                          </p>
                          <p className="text-muted-foreground mb-1">
                            📍 Ubicación: {event.location}
                          </p>
                          <p className="text-sm text-muted-foreground mb-3">
                            📅 Fecha: {new Date(event.start_date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {event.description}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <Button 
                            size="sm" 
                            onClick={() => handleApproval(event.id, 'approve')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Aprobar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleApproval(event.id, 'reject')}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Rechazar
                          </Button>
                          <Button size="sm" variant="outline">
                            Ver Detalles
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No hay eventos pendientes
                  </h3>
                  <p className="text-muted-foreground">
                    Todos los eventos han sido revisados
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <h2 className="text-2xl font-bold">Métricas de la Plataforma</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Distribución de Eventos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        Aprobados
                      </span>
                      <span className="font-semibold">{mockMetrics.approvedEvents}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        Pendientes
                      </span>
                      <span className="font-semibold">{mockMetrics.pendingEvents}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        Rechazados
                      </span>
                      <span className="font-semibold">{mockMetrics.rejectedEvents}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribución de Usuarios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Usuarios Normales</span>
                      <span className="font-semibold">{mockMetrics.totalUsers - mockMetrics.totalVendors - mockMetrics.totalOrganizers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Vendedores</span>
                      <span className="font-semibold">{mockMetrics.totalVendors}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Organizadores</span>
                      <span className="font-semibold">{mockMetrics.totalOrganizers}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actividad Reciente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
                    <BarChart3 className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <p className="text-center text-muted-foreground mt-4">
                    Gráfico de actividad (próximamente)
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rendimiento del Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Eventos creados este mes</span>
                      <span className="font-semibold">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Nuevos usuarios</span>
                      <span className="font-semibold">+45</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Tiempo promedio de aprobación</span>
                      <span className="font-semibold">2.3 días</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
            
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Usuarios Registrados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">{mockMetrics.totalUsers}</div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Total de usuarios en la plataforma
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    Ver Todos los Usuarios
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Vendedores Verificados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">{mockMetrics.totalVendors}</div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Vendedores activos y verificados
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    Gestionar Vendedores
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Organizadores Activos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">{mockMetrics.totalOrganizers}</div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Organizadores con eventos creados
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    Ver Organizadores
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Acciones de Administración</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                    <Users className="h-6 w-6" />
                    <span>Exportar Usuarios</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                    <Calendar className="h-6 w-6" />
                    <span>Reportes de Eventos</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                    <BarChart3 className="h-6 w-6" />
                    <span>Analytics Avanzado</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                    <Shield className="h-6 w-6" />
                    <span>Configuración</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}