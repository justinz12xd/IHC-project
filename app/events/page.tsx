"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Clock } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Event {
  id_evento: number
  nombre: string
  descripcion: string
  lugar: string
  fecha_inicio: string
  fecha_fin: string
  capacidad: number
  estado: string
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      console.log("[events] 📥 Cargando eventos...")
      const { data, error } = await supabase
        .from('evento')
        .select('*')
        .eq('estado', 'APROBADO')
        .order('fecha_inicio', { ascending: true })

      if (error) {
        console.error("[events] ❌ Error cargando eventos:", error)
        return
      }

      console.log("[events] ✅ Eventos cargados:", data?.length || 0)
      setEvents(data || [])
    } catch (err) {
      console.error("[events] ❌ Error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <p className="text-muted-foreground">Cargando eventos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Eventos Disponibles</h1>
        <p className="text-muted-foreground">
          Explora todos los eventos próximos y regístrate
        </p>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">
              No hay eventos disponibles en este momento
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id_evento} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="line-clamp-2">{event.nombre}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {event.descripcion}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <span className="line-clamp-2">{event.lugar}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>
                      {format(new Date(event.fecha_inicio), "PPP", { locale: es })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>
                      {format(new Date(event.fecha_inicio), "p", { locale: es })} - {format(new Date(event.fecha_fin), "p", { locale: es })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>Capacidad: {event.capacidad} personas</span>
                  </div>
                </div>

                <Link href={`/events/${event.id_evento}`} className="block">
                  <Button className="w-full" variant="default">
                    Ver Detalles
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
