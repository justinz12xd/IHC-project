"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, MapPin, Users, Clock, Search, Filter } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Label } from "@/components/ui/label"

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
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const supabase = createBrowserClient()

  useEffect(() => {
    loadEvents()
  }, [])

  useEffect(() => {
    filterEvents()
  }, [events, searchTerm, locationFilter, dateFilter])

  const filterEvents = () => {
    let filtered = [...events]

    // Filter by search term (nombre o descripción)
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (event) =>
          event.nombre.toLowerCase().includes(term) ||
          event.descripcion.toLowerCase().includes(term)
      )
    }

    // Filter by location
    if (locationFilter) {
      const location = locationFilter.toLowerCase()
      filtered = filtered.filter((event) =>
        event.lugar.toLowerCase().includes(location)
      )
    }

    // Filter by date
    if (dateFilter) {
      filtered = filtered.filter((event) =>
        event.fecha_inicio.startsWith(dateFilter)
      )
    }

    setFilteredEvents(filtered)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setLocationFilter("")
    setDateFilter("")
  }

  const loadEvents = async () => {
    try {
      console.log("[events] 📥 Cargando eventos...")
      
      // Obtener fecha de hoy (solo fecha, sin hora)
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      const fechaHoy = hoy.toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('evento')
        .select('*')
        .eq('estado', 'APROBADO')
        .gte('fecha_inicio', fechaHoy)
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

      {/* Search and Filter Section */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar eventos por nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                aria-label="Buscar eventos"
              />
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full sm:w-auto"
            >
              <Filter className="mr-2 h-4 w-4" />
              {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
            </Button>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid gap-4 sm:grid-cols-2 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="location-filter">Ubicación</Label>
                  <Input
                    id="location-filter"
                    placeholder="Filtrar por ubicación..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    aria-label="Filtrar por ubicación"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-filter">Fecha</Label>
                  <Input
                    id="date-filter"
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    aria-label="Filtrar por fecha"
                  />
                </div>
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="sm:col-span-2"
                >
                  Limpiar filtros
                </Button>
              </div>
            )}

            {/* Results Count */}
            <p className="text-sm text-muted-foreground">
              {filteredEvents.length} {filteredEvents.length === 1 ? "evento encontrado" : "eventos encontrados"}
            </p>
          </div>
        </CardContent>
      </Card>

      {filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">
              {events.length === 0
                ? "No hay eventos disponibles en este momento"
                : "No se encontraron eventos que coincidan con tu búsqueda"}
            </p>
            {events.length > 0 && (
              <Button variant="link" onClick={clearFilters} className="mt-2">
                Limpiar filtros
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
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
