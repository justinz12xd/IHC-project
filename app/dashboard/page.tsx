"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, QrCode, Clock, History } from "lucide-react"
import { EventHistory } from "@/components/event-history"
import { useAuth } from "@/hooks/use-auth"
import { createBrowserClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useLanguage } from "@/lib/i18n/language-context"

export default function DashboardPage() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const supabase = createBrowserClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [events, setEvents] = useState<any[]>([])
  const [registrations, setRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      setUserId(user.id)
      loadEvents()
      loadRegistrations()
    }
  }, [user])

  const loadEvents = async () => {
    try {
      console.log("[dashboard] 📥 Cargando eventos...")
      const { data, error } = await supabase
        .from('evento')
        .select('*')
        .eq('estado', 'APROBADO')
        .order('fecha_inicio', { ascending: true })

      if (error) {
        console.error("[dashboard] ❌ Error cargando eventos:", error)
        return
      }

      console.log("[dashboard] ✅ Eventos cargados:", data?.length || 0)
      setEvents(data || [])
    } catch (err) {
      console.error("[dashboard] ❌ Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadRegistrations = async () => {
    if (!user?.id) return
    
    try {
      // Aquí cargarías los registros del usuario si la tabla existe
      // Por ahora dejamos vacío
      setRegistrations([])
    } catch (err) {
      console.error("[dashboard] Error cargando registros:", err)
    }
  }
  
  // Filtrar eventos
  const upcomingEvents = events.filter(e => 
    new Date(e.fecha_inicio) >= new Date()
  )
  
  const registeredEventIds = registrations.map(r => r.event_id)
  const upcomingRegistered = upcomingEvents.filter(e => registeredEventIds.includes(e.id_evento))
  const attendedEvents = events.filter(e => 
    new Date(e.fecha_inicio) < new Date() && registeredEventIds.includes(e.id_evento)
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
        <CardTitle className="text-lg">{event.nombre}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {event.descripcion}
        </p>
        
        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{event.lugar}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{new Date(event.fecha_inicio).toLocaleDateString()}</span>
          </div>
          {event.capacidad && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Capacidad: {event.capacidad}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {attended && (
            <Button size="sm" variant="outline" className="flex-1">
              <QrCode className="h-4 w-4 mr-2" />
              {t("dashboard.viewCertificate")}
            </Button>
          )}
          {registered && !attended && (
            <Button size="sm" variant="outline" className="flex-1" asChild>
              <Link href={`/events/${event.id_evento}/qr`}>
                <QrCode className="h-4 w-4 mr-2" />
                {t("dashboard.myQR")}
              </Link>
            </Button>
          )}
          {!registered && !attended && (
            <Button size="sm" className="flex-1">
              {t("dashboard.register")}
            </Button>
          )}
          <Button size="sm" variant="outline" asChild>
            <Link href={`/events/${event.id_evento}`}>
              {t("dashboard.viewDetails")}
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
          <h1 className="text-4xl font-bold text-balance mb-2">{t("dashboard.title")}</h1>
          <p className="text-muted-foreground text-lg">{t("dashboard.subtitle")}</p>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 mb-8">
            <TabsTrigger value="upcoming">{t("dashboard.upcoming")}</TabsTrigger>
            <TabsTrigger value="registered">{t("dashboard.registered")}</TabsTrigger>
            <TabsTrigger value="attended">{t("dashboard.attended")}</TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              Historial
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Cargando eventos...</p>
              </div>
            ) : upcomingEvents && upcomingEvents.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id_evento} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/50 rounded-lg">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t("dashboard.noUpcoming")}</h3>
                <p className="text-muted-foreground">{t("dashboard.noUpcomingDesc")}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="registered" className="space-y-6">
            {upcomingRegistered && upcomingRegistered.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {upcomingRegistered.map((event) => (
                  <EventCard key={event.id_evento} event={event} registered />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/50 rounded-lg">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t("dashboard.noRegistered")}</h3>
                <p className="text-muted-foreground mb-4">{t("dashboard.noRegisteredDesc")}</p>
                <Button asChild>
                  <Link href="#upcoming">{t("home.features")}</Link>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="attended" className="space-y-6">
            {attendedEvents && attendedEvents.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {attendedEvents.map((event) => (
                  <EventCard key={event.id_evento} event={event} attended />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/50 rounded-lg">
                <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t("dashboard.noAttended")}</h3>
                <p className="text-muted-foreground">{t("dashboard.noAttendedDesc")}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            {userId ? (
              <EventHistory userId={userId} />
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">Cargando historial...</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
