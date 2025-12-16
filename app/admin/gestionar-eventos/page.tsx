"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, Clock, Calendar, MapPin, Users, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Evento {
  id_evento: string
  nombre: string
  descripcion: string
  lugar: string
  fecha_inicio: string
  fecha_fin: string
  capacidad: number
  estado: string
  created_at: string
  organizador: {
    nombre: string
    apellido: string
    correo: string
  }
}

export default function GestionarEventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("pendientes")
  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    checkAuthAndLoadEventos()
  }, [])

  const checkAuthAndLoadEventos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      // Verificar que sea admin u organizador
      const { data: usuario } = await supabase
        .from("usuario")
        .select("rol")
        .eq("auth_id", user.id)
        .single()

      if (!usuario || (usuario.rol !== "ADMIN" && usuario.rol !== "ORGANIZADOR")) {
        router.push("/dashboard")
        return
      }

      // Cargar todos los eventos
      const { data: eventos, error } = await supabase
        .from("evento")
        .select(`
          *,
          organizador:usuario!evento_id_organizador_fkey(
            nombre,
            apellido,
            correo
          )
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error cargando eventos:", error)
      } else {
        setEventos(eventos || [])
      }
    } catch (err) {
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (eventoId: string, accion: "aprobar" | "rechazar") => {
    setProcessing(eventoId)
    try {
      const { error } = await supabase
        .from("evento")
        .update({ estado: accion === "aprobar" ? "APROBADO" : "RECHAZADO" })
        .eq("id_evento", eventoId)

      if (error) throw error

      // Recargar lista
      await checkAuthAndLoadEventos()
      
      alert(`Evento ${accion === "aprobar" ? "aprobado" : "rechazado"} exitosamente`)
    } catch (err: any) {
      console.error("Error:", err)
      alert(`Error al ${accion} el evento: ${err.message}`)
    } finally {
      setProcessing(null)
    }
  }

  if (loading) {
  const eventosPendientes = eventos.filter(e => e.estado === "PENDIENTE")
  const eventosAprobados = eventos.filter(e => e.estado === "APROBADO")
  const eventosRechazados = eventos.filter(e => e.estado === "RECHAZADO")

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando eventos...</p>
      </div>
    )
  }

  const renderEventosList = (eventosList: Evento[], showActions: boolean = true) => {
    if (eventosList.length === 0) {
      return (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No hay eventos en esta categoría
            </h3>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-6">
        {eventosListo.id_evento}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{evento.nombre}</CardTitle>
                      <CardDescription className="text-base">
                        {evento.descripcion}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">
                      <Clock className="w-3 h-3 mr-1" />
          <Card key={evento.id_evento}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{evento.nombre}</CardTitle>
                  <CardDescription className="text-base">
                    {evento.descripcion}
                  </CardDescription>
                </div>
                <Badge 
                  variant={
                    evento.estado === "PENDIENTE" ? "secondary" : 
                    evento.estado === "APROBADO" ? "default" : 
                    "destructive"
                  }
                >
                  <Clock className="w-3 h-3 mr-1" />
                  {evento.estado}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <Calendar className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Fecha</p>
                    <p className="text-muted-foreground">
                      {format(new Date(evento.fecha_inicio), "d 'de' MMMM, yyyy", { locale: es })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Lugar</p>
                    <p className="text-muted-foreground">{evento.lugar}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Users className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Capacidad</p>
                    <p className="text-muted-foreground">{evento.capacidad} personas</p>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm font-medium mb-1">Organizador</p>
                <p className="text-sm text-muted-foreground">
                  {evento.organizador?.nombre} {evento.organizador?.apellido} ({evento.organizador?.correo})
                </p>
              </div>

              {showActions && evento.estado === "PENDIENTE" && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleApproval(evento.id_evento, "aprobar")}
                    disabled={processing === evento.id_evento}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aprobar Evento
                  </Button>
                  <Button
                    onClick={() => handleApproval(evento.id_evento, "rechazar")}
                    disabled={processing === evento.id_evento}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rechazar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Gestión de Eventos</h1>
          <p className="text-muted-foreground">
            Revisa y administra todos los eventos del sistema
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pendientes">
              Pendientes ({eventosPendientes.length})
            </TabsTrigger>
            <TabsTrigger value="aprobados">
              Aprobados ({eventosAprobados.length})
            </TabsTrigger>
            <TabsTrigger value="rechazados">
              Rechazados ({eventosRechazados.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pendientes">
            {eventosPendientes.length > 0 && (
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Hay {eventosPendientes.length} evento(s) esperando aprobación
                </AlertDescription>
              </Alert>
            )}
            {renderEventosList(eventosPendientes, true)}
          </TabsContent>

          <TabsContent value="aprobados">
            {renderEventosList(eventosAprobados, false)}
          </TabsContent>

          <TabsContent value="rechazados">
            {renderEventosList(eventosRechazados, false)}
          </TabsContent>
        </Tabs>