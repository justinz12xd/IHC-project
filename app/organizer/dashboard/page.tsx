"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Calendar, Users, CheckCircle, Clock, XCircle, BarChart3 } from "lucide-react"
import Link from "next/link"

// Datos de ejemplo para mostrar la interfaz
const mockEvents = [
  {
    id: "1",
    title: "Feria Agrícola de Primavera",
    location: "Plaza Central",
    start_date: "2025-11-15T09:00:00Z",
    end_date: "2025-11-15T18:00:00Z",
    status: "approved",
    current_registrations: 45,
    capacity: 100
  },
  {
    id: "2",
    title: "Mercado Orgánico Semanal",
    location: "Parque Municipal",
    start_date: "2025-11-22T08:00:00Z", 
    end_date: "2025-11-22T16:00:00Z",
    status: "pending_approval",
    current_registrations: 12,
    capacity: 50
  },
  {
    id: "3",
    title: "Exposición de Productos Locales",
    location: "Centro de Convenciones",
    start_date: "2025-10-10T10:00:00Z",
    end_date: "2025-10-10T20:00:00Z", 
    status: "completed",
    current_registrations: 78,
    capacity: 80
  }
]

export default function OrganizerDashboardPage() {
  // Datos calculados
  const totalEvents = mockEvents.length
  const approvedEvents = mockEvents.filter(e => e.status === "approved").length
  const pendingEvents = mockEvents.filter(e => e.status === "pending_approval").length
  const completedEvents = mockEvents.filter(e => e.status === "completed").length
  const upcomingEvents = mockEvents.filter(e => new Date(e.start_date) >= new Date())
  const pastEvents = mockEvents.filter(e => new Date(e.start_date) < new Date())
  const totalRegistrations = mockEvents.reduce((sum, e) => sum + e.current_registrations, 0)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Aprobado</span>
      case "pending_approval":
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pendiente</span>
      case "completed":
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Completado</span>
      case "draft":
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Borrador</span>
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-linear-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Panel de Organizador</h1>
              <p className="text-muted-foreground">Gestiona tus eventos y asistentes</p>
            </div>
          </div>
          
          <Button asChild>
            <Link href="/organizer/events/new">
              <Plus className="w-4 h-4 mr-2" />
              Crear Nuevo Evento
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEvents}</div>
              <p className="text-xs text-muted-foreground">
                {approvedEvents} aprobados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eventos Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingEvents}</div>
              <p className="text-xs text-muted-foreground">
                esperando aprobación
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Registros</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRegistrations}</div>
              <p className="text-xs text-muted-foreground">
                en todos los eventos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eventos Completados</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedEvents}</div>
              <p className="text-xs text-muted-foreground">
                eventos finalizados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming">Próximos Eventos</TabsTrigger>
            <TabsTrigger value="past">Eventos Anteriores</TabsTrigger>
            <TabsTrigger value="all">Todos los Eventos</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Próximos Eventos</h2>
              <Button asChild>
                <Link href="/organizer/events/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Evento
                </Link>
              </Button>
            </div>

            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <Card key={event.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{event.title}</h3>
                            {getStatusBadge(event.status)}
                          </div>
                          <p className="text-muted-foreground mb-1">
                            📍 {event.location}
                          </p>
                          <p className="text-sm text-muted-foreground mb-2">
                            📅 {new Date(event.start_date).toLocaleDateString()} • 
                            🕒 {new Date(event.start_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-muted-foreground">
                              👥 {event.current_registrations} / {event.capacity} registrados
                            </span>
                            <div className="w-24 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{width: `${(event.current_registrations / event.capacity) * 100}%`}}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <Button size="sm" asChild>
                            <Link href={`/organizer/events/${event.id}`}>
                              Ver Detalles
                            </Link>
                          </Button>
                          {event.status === "approved" && (
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/organizer/events/${event.id}/scan`}>
                                Escanear QR
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No tienes eventos próximos
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Crea tu primer evento para comenzar
                  </p>
                  <Button asChild>
                    <Link href="/organizer/events/new">
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Evento
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-6">
            <h2 className="text-2xl font-bold">Eventos Anteriores</h2>
            
            {pastEvents.length > 0 ? (
              <div className="space-y-4">
                {pastEvents.map((event) => (
                  <Card key={event.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{event.title}</h3>
                            {getStatusBadge(event.status)}
                          </div>
                          <p className="text-muted-foreground mb-1">
                            📍 {event.location}
                          </p>
                          <p className="text-sm text-muted-foreground mb-2">
                            📅 {new Date(event.start_date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            👥 {event.current_registrations} asistentes registrados
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <Button size="sm" variant="outline">
                            Ver Reporte
                          </Button>
                          <Button size="sm" variant="outline">
                            Exportar Datos
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
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No tienes eventos anteriores
                  </h3>
                  <p className="text-muted-foreground">
                    Los eventos completados aparecerán aquí
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-6">
            <h2 className="text-2xl font-bold">Todos los Eventos</h2>
            
            <div className="space-y-4">
              {mockEvents.map((event) => (
                <Card key={event.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{event.title}</h3>
                          {getStatusBadge(event.status)}
                        </div>
                        <p className="text-muted-foreground mb-1">
                          📍 {event.location}
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">
                          📅 {new Date(event.start_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          👥 {event.current_registrations} / {event.capacity} registrados
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Button size="sm" asChild>
                          <Link href={`/organizer/events/${event.id}`}>
                            Ver Detalles
                          </Link>
                        </Button>
                        {event.status === "approved" && new Date(event.start_date) >= new Date() && (
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/organizer/events/${event.id}/scan`}>
                              Escanear QR
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}