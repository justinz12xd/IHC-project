"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Event {
  id_evento: string
  nombre: string
  descripcion: string
  fecha_inicio: string
  fecha_fin: string
  lugar: string
  estado: string
}

interface EventHistoryProps {
  userId: string
}

export function EventHistory({ userId }: EventHistoryProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadEventHistory() {
      try {
        // Obtener eventos en los que el usuario se ha registrado
        const { data: registrations, error: regError } = await supabase
          .from("registro_evento")
          .select(`
            id_evento,
            fecha_registro,
            asistio,
            evento:id_evento (
              id_evento,
              nombre,
              descripcion,
              fecha_inicio,
              fecha_fin,
              lugar,
              estado
            )
          `)
          .eq("id_usuario", userId)
          .order("fecha_registro", { ascending: false })

        if (regError) throw regError

        // Extraer eventos de los registros
        const eventsData = registrations
          ?.map((reg: any) => reg.evento)
          .filter((event: any) => event !== null) || []

        setEvents(eventsData)
      } catch (error) {
        console.error("Error loading event history:", error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      loadEventHistory()
    }
  }, [userId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de Eventos</CardTitle>
          <CardDescription>Cargando tu historial...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de Eventos</CardTitle>
          <CardDescription>Aún no te has registrado en ningún evento</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Eventos</CardTitle>
        <CardDescription>Eventos en los que has participado</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id_evento}
            className="flex items-start space-x-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-lg">{event.nombre}</h3>
                <Badge variant={
                  event.estado === "APROBADO" ? "default" :
                  event.estado === "FINALIZADO" ? "secondary" :
                  event.estado === "ACTIVO" ? "default" :
                  "outline"
                }>
                  {event.estado}
                </Badge>
              </div>
              
              {event.descripcion && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {event.descripcion}
                </p>
              )}
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(event.fecha_inicio), "d MMM yyyy", { locale: es })}
                  </span>
                </div>
                
                {event.lugar && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{event.lugar}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
