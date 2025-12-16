"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, MapPin, Users, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Evento {
  id_evento: string
  nombre: string
  descripcion: string
  fecha_inicio: string
  fecha_fin: string
  lugar: string
  capacidad: number
  estado: string
}

export default function RegistrarseEventoPage() {
  const params = useParams()
  const eventoId = params?.id as string
  
  const [evento, setEvento] = useState<Evento | null>(null)
  const [registrosCount, setRegistrosCount] = useState(0)
  const [aceptaPoliticas, setAceptaPoliticas] = useState(false)
  const [deseaNotificaciones, setDeseaNotificaciones] = useState(true)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingEvento, setLoadingEvento] = useState(true)
  const [usuarioId, setUsuarioId] = useState<string | null>(null)
  const [yaRegistrado, setYaRegistrado] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    if (eventoId) {
      checkAuthAndLoadEvento()
    }
  }, [eventoId])

  const checkAuthAndLoadEvento = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      // Obtener el id del usuario
      const { data: usuario, error: usuarioError } = await supabase
        .from("usuario")
        .select("id_usuario, rol")
        .eq("auth_id", user.id)
        .single()

      if (usuarioError || !usuario) {
        setError("Usuario no encontrado")
        return
      }

      setUsuarioId(usuario.id_usuario)

      // Verificar si ya está registrado
      const { data: registroExistente } = await supabase
        .from("registro_evento")
        .select("id_registro")
        .eq("id_usuario", usuario.id_usuario)
        .eq("id_evento", eventoId)
        .single()

      if (registroExistente) {
        setYaRegistrado(true)
      }

      // Cargar datos del evento
      const { data: eventoData, error: eventoError } = await supabase
        .from("evento")
        .select("*")
        .eq("id_evento", eventoId)
        .eq("estado", "APROBADO")
        .single()

      if (eventoError || !eventoData) {
        setError("Evento no encontrado o no disponible")
        return
      }

      setEvento(eventoData)

      // Contar registros actuales
      const { count, error: countError } = await supabase
        .from("registro_evento")
        .select("*", { count: "exact", head: true })
        .eq("id_evento", eventoId)

      if (!countError) {
        setRegistrosCount(count || 0)
      }
    } catch (err: any) {
      console.error("Error:", err)
      setError(err.message || "Error al cargar el evento")
    } finally {
      setLoadingEvento(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!aceptaPoliticas) {
      setError("Debes aceptar las políticas de participación")
      return
    }

    if (yaRegistrado) {
      setError("Ya estás registrado en este evento")
      return
    }

    if (!usuarioId || !eventoId) {
      setError("No se pudo identificar tu usuario")
      return
    }

    // Verificar capacidad
    if (evento && registrosCount >= evento.capacidad) {
      setError("El evento ha alcanzado su capacidad máxima")
      return
    }

    setLoading(true)

    try {
      // Crear registro
      const { error: insertError } = await supabase
        .from("registro_evento")
        .insert({
          id_usuario: usuarioId,
          id_evento: eventoId,
          asistio: false,
        })

      if (insertError) throw insertError

      // Redirigir con mensaje de éxito
      router.push(`/events/${eventoId}?registro=exitoso`)
      router.refresh()
    } catch (err: any) {
      console.error("Error al registrarse:", err)
      if (err.code === "23505") {
        setError("Ya estás registrado en este evento")
      } else {
        setError(err.message || "Error al confirmar asistencia")
      }
    } finally {
      setLoading(false)
    }
  }

  if (loadingEvento) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando evento...</p>
      </div>
    )
  }

  if (!evento) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Evento no encontrado o no disponible
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const ocupacionPorcentaje = Math.round((registrosCount / evento.capacidad) * 100)
  const plazasDisponibles = evento.capacidad - registrosCount
  const fechaInicio = new Date(evento.fecha_inicio)
  const fechaFin = new Date(evento.fecha_fin)

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-green-600" />
            <CardTitle>Registrarse al Evento</CardTitle>
          </div>
          <CardDescription>
            Confirma tu asistencia al evento seleccionado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {yaRegistrado ? (
            <Alert className="mb-6">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Ya estás registrado en este evento. Revisa tu correo para más detalles.
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Card del Evento */}
              <div className="bg-green-50 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{evento.nombre}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {evento.descripcion}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-green-600 flex-shrink-0" />
                </div>

                <div className="space-y-3 text-sm">
                  {/* Fecha */}
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Fecha</p>
                      <p className="text-muted-foreground">
                        {format(fechaInicio, "d 'de' MMMM, yyyy", { locale: es })}
                      </p>
                    </div>
                  </div>

                  {/* Horario */}
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Horario</p>
                      <p className="text-muted-foreground">
                        {format(fechaInicio, "HH:mm", { locale: es })} - {format(fechaFin, "HH:mm", { locale: es })}
                      </p>
                    </div>
                  </div>

                  {/* Lugar */}
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Lugar</p>
                      <p className="text-muted-foreground">{evento.lugar}</p>
                    </div>
                  </div>

                  {/* Disponibilidad */}
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">Disponibilidad</p>
                      <p className="text-muted-foreground">
                        {registrosCount} / {evento.capacidad} plazas
                      </p>
                    </div>
                  </div>
                </div>

                {/* Barra de ocupación */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ocupación del evento</span>
                    <span className="font-medium">{ocupacionPorcentaje}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${ocupacionPorcentaje}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="politicas"
                    checked={aceptaPoliticas}
                    onCheckedChange={(checked) => setAceptaPoliticas(checked as boolean)}
                  />
                  <label
                    htmlFor="politicas"
                    className="text-sm leading-relaxed cursor-pointer"
                  >
                    Confirmo mi asistencia a este evento y acepto las políticas de participación{" "}
                    <span className="text-destructive">*</span>
                  </label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="notificaciones"
                    checked={deseaNotificaciones}
                    onCheckedChange={(checked) => setDeseaNotificaciones(checked as boolean)}
                  />
                  <label
                    htmlFor="notificaciones"
                    className="text-sm leading-relaxed cursor-pointer text-muted-foreground"
                  >
                    Deseo recibir notificaciones y recordatorios sobre este evento
                    <br />
                    <span className="text-xs">Te enviaremos recordatorios 24 horas antes del evento</span>
                  </label>
                </div>

                <p className="text-xs text-muted-foreground">
                  Al confirmar, te comprometes a asistir al evento
                </p>
              </div>

              {/* Qué incluye tu registro */}
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <h4 className="font-semibold">Qué incluye tu registro</h4>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground ml-7">
                  <li>• Acceso gratuito al evento completo</li>
                  <li>• Ticket digital enviado por correo</li>
                  <li>• Recordatorios automáticos</li>
                  <li>• Mapa del evento y ubicación de stands</li>
                </ul>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !aceptaPoliticas || plazasDisponibles <= 0}
                size="lg"
              >
                {loading ? "Procesando..." : "Confirmar Asistencia"}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Recibirás un correo de confirmación con tu ticket de entrada
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
