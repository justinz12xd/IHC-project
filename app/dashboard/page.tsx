"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, QrCode, Clock } from "lucide-react"
import Link from "next/link"

// Datos de ejemplo para mostrar la interfaz
const mockEvents = [
  {
    id: "1",
    title: "Feria Agrícola de Primavera",
    description: "Gran evento con los mejores productores locales",
    location: "Plaza Central",
    address: "Av. Principal 123",
    start_date: "2025-11-15T09:00:00Z",
    end_date: "2025-11-15T18:00:00Z",
    capacity: 100,
    current_registrations: 45,
    status: "approved",
    cover_image_url: null
  },
  {
    id: "2",
    title: "Mercado Orgánico Semanal",
    description: "Productos frescos y orgánicos directamente del productor",
    location: "Parque Municipal",
    address: "Calle Verde 456",
    start_date: "2025-11-22T08:00:00Z",
    end_date: "2025-11-22T16:00:00Z",
    capacity: 50,
    current_registrations: 12,
    status: "approved",
    cover_image_url: null
  },
  {
    id: "3",
    title: "Exposición de Productos Locales",
    description: "Muestra de la diversidad productiva de la región",
    location: "Centro de Convenciones",
    address: "Boulevard Norte 789",
    start_date: "2025-10-10T10:00:00Z",
    end_date: "2025-10-10T20:00:00Z",
    capacity: 80,
    current_registrations: 78,
    status: "completed",
    cover_image_url: null
  }
]

const mockRegistrations = [
  {
    id: "1",
    event_id: "1",
    user_id: "user1",
    checked_in: false,
    created_at: "2025-10-20T10:00:00Z"
  }
]

export default function DashboardPage() {
  // Filtrar eventos
  const upcomingEvents = mockEvents.filter(e => 
    e.status === "approved" && new Date(e.start_date) >= new Date()
  )
  
  const registeredEventIds = mockRegistrations.map(r => r.event_id)
  const upcomingRegistered = upcomingEvents.filter(e => registeredEventIds.includes(e.id))
  const attendedEvents = mockEvents.filter(e => 
    e.status === "completed" && registeredEventIds.includes(e.id)
  )

  const EventCard = ({ event, registered = false, attended = false }: { 
    event: any, 
    registered?: boolean, 
    attended?: boolean 
  }) => (
    <Card className="h-full">
      <CardHeader>
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
          <Calendar className="h-12 w-12 text-muted-foreground" />
        </div>
        <CardTitle className="text-lg">{event.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {event.description}
        </p>
        
        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{new Date(event.start_date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{event.current_registrations} / {event.capacity} registrados</span>
          </div>
        </div>

        <div className="flex gap-2">
          {attended && (
            <Button size="sm" variant="outline" className="flex-1">
              <QrCode className="h-4 w-4 mr-2" />
              Ver Certificado
            </Button>
          )}
          {registered && !attended && (
            <Button size="sm" variant="outline" className="flex-1" asChild>
              <Link href={`/events/${event.id}/qr`}>
                <QrCode className="h-4 w-4 mr-2" />
                Mi QR
              </Link>
            </Button>
          )}
          {!registered && !attended && (
            <Button size="sm" className="flex-1">
              Registrarse
            </Button>
          )}
          <Button size="sm" variant="outline" asChild>
            <Link href={`/events/${event.id}`}>
              Ver Detalles
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-balance mb-2">Eventos Agroproductivos</h1>
          <p className="text-muted-foreground text-lg">Descubre y regístrate en eventos de productores locales</p>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
            <TabsTrigger value="upcoming">Próximos</TabsTrigger>
            <TabsTrigger value="registered">Mis Registros</TabsTrigger>
            <TabsTrigger value="attended">Asistidos</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-6">
            {upcomingEvents && upcomingEvents.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/50 rounded-lg">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay eventos próximos disponibles</h3>
                <p className="text-muted-foreground">Los nuevos eventos aparecerán aquí cuando estén disponibles</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="registered" className="space-y-6">
            {upcomingRegistered && upcomingRegistered.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {upcomingRegistered.map((event) => (
                  <EventCard key={event.id} event={event} registered />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/50 rounded-lg">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tienes registros en eventos próximos</h3>
                <p className="text-muted-foreground mb-4">Explora los eventos disponibles y regístrate</p>
                <Button asChild>
                  <Link href="#upcoming">Ver Eventos Disponibles</Link>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="attended" className="space-y-6">
            {attendedEvents && attendedEvents.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {attendedEvents.map((event) => (
                  <EventCard key={event.id} event={event} attended />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/50 rounded-lg">
                <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aún no has asistido a ningún evento</h3>
                <p className="text-muted-foreground">Los eventos a los que asistas aparecerán aquí</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
