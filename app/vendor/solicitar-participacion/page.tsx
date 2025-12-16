"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users } from "lucide-react"

interface Event {
  id_evento: string
  nombre: string
  fecha_inicio: string
  fecha_fin: string
  lugar: string
  estado: string
}

export default function SolicitarParticipacionPage() {
  const [eventoId, setEventoId] = useState("")
  const [comentarios, setComentarios] = useState("")
  const [aceptaCondiciones, setAceptaCondiciones] = useState(false)
  const [eventos, setEventos] = useState<Event[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingEventos, setLoadingEventos] = useState(true)
  const [vendedorId, setVendedorId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      // Obtener el id del vendedor
      const { data: usuario, error: usuarioError } = await supabase
        .from("usuario")
        .select("id_usuario, rol")
        .eq("auth_id", user.id)
        .single()

      if (usuarioError || !usuario) {
        setError("Usuario no encontrado")
        return
      }

      if (usuario.rol !== "VENDEDOR") {
        setError("Solo los vendedores pueden solicitar participación en eventos")
        return
      }

      // Verificar que el vendedor tenga perfil completo
      const { data: vendedor, error: vendedorError } = await supabase
        .from("vendedor")
        .select("id_vendedor")
        .eq("id_vendedor", usuario.id_usuario)
        .single()

      if (vendedorError || !vendedor) {
        router.push("/setup-vendor")
        return
      }

      setVendedorId(usuario.id_usuario)

      // Cargar eventos disponibles (APROBADO y no pasados)
      const { data: eventosData, error: eventosError } = await supabase
        .from("evento")
        .select("id_evento, nombre, fecha_inicio, fecha_fin, lugar, estado")
        .eq("estado", "APROBADO")
        .gte("fecha_inicio", new Date().toISOString().split('T')[0])
        .order("fecha_inicio", { ascending: true })

      if (eventosError) {
        console.error("Error al cargar eventos:", eventosError)
        setError("Error al cargar eventos disponibles")
      } else {
        setEventos(eventosData || [])
      }
    } catch (err: any) {
      console.error("Error:", err)
      setError(err.message || "Error al cargar datos")
    } finally {
      setLoadingEventos(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!eventoId) {
      setError("Debes seleccionar un evento")
      return
    }

    if (!aceptaCondiciones) {
      setError("Debes aceptar las condiciones de venta")
      return
    }

    if (comentarios.length > 500) {
      setError("Los comentarios no pueden superar los 500 caracteres")
      return
    }

    if (!vendedorId) {
      setError("No se pudo identificar tu perfil de vendedor")
      return
    }

    setLoading(true)

    try {
      // Verificar si ya existe una solicitud para este evento
      const { data: existente, error: existenteError } = await supabase
        .from("participacion_vendedor")
        .select("id_participacion")
        .eq("id_vendedor", vendedorId)
        .eq("id_evento", eventoId)
        .single()

      if (existente) {
        setError("Ya has solicitado participación en este evento")
        setLoading(false)
        return
      }

      // Crear solicitud de participación
      const { error: insertError } = await supabase
        .from("participacion_vendedor")
        .insert({
          id_vendedor: vendedorId,
          id_evento: eventoId,
          estado_aprobacion: "PENDIENTE",
          asistio: false,
        })

      if (insertError) throw insertError

      // Redirigir al dashboard con mensaje de éxito
      router.push("/vendor/dashboard?solicitud=enviada")
      router.refresh()
    } catch (err: any) {
      console.error("Error al enviar solicitud:", err)
      setError(err.message || "Error al enviar solicitud")
    } finally {
      setLoading(false)
    }
  }

  if (loadingEventos) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando eventos...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            <CardTitle>Solicitar Participación</CardTitle>
          </div>
          <CardDescription>
            Solicita participar como vendedor en un evento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Seleccionar Evento */}
            <div className="space-y-2">
              <Label htmlFor="evento">
                Seleccionar Evento <span className="text-destructive">*</span>
              </Label>
              <Select value={eventoId} onValueChange={setEventoId}>
                <SelectTrigger id="evento">
                  <SelectValue placeholder="Elige un evento" />
                </SelectTrigger>
                <SelectContent>
                  {eventos.length === 0 ? (
                    <SelectItem value="no-events" disabled>
                      No hay eventos disponibles
                    </SelectItem>
                  ) : (
                    eventos.map((evento) => (
                      <SelectItem key={evento.id_evento} value={evento.id_evento}>
                        {evento.nombre} - {new Date(evento.fecha_inicio).toLocaleDateString()}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Checkbox de Aceptación */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="condiciones"
                checked={aceptaCondiciones}
                onCheckedChange={(checked) => setAceptaCondiciones(checked as boolean)}
              />
              <label
                htmlFor="condiciones"
                className="text-sm leading-relaxed cursor-pointer"
              >
                Confirmo mi participación en este evento y acepto las condiciones de venta{" "}
                <span className="text-destructive">*</span>
              </label>
            </div>

            {/* Comentarios Adicionales */}
            <div className="space-y-2">
              <Label htmlFor="comentarios">Comentarios Adicionales</Label>
              <Textarea
                id="comentarios"
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                rows={4}
                placeholder="Información adicional que desees compartir (opcional)..."
                maxLength={500}
                className="resize-none"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <p>Opcional - Máximo 500 caracteres</p>
                <p className={comentarios.length > 500 ? "text-destructive" : ""}>
                  {comentarios.length}/500
                </p>
              </div>
            </div>

            {/* Proceso de Aprobación */}
            <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Proceso de Aprobación</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Revisaremos tu solicitud en 24 horas</li>
                <li>• Recibirás una notificación por correo</li>
                <li>• Una vez aprobado, podrás asignar tus productos al evento</li>
              </ul>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !eventoId || !aceptaCondiciones}
              size="lg"
            >
              {loading ? "Enviando..." : "Enviar Solicitud"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
