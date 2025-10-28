"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, XCircle, Calendar, MapPin, Users, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface EventApprovalListProps {
  status: "pending_approval" | "approved" | "rejected"
}

export function EventApprovalList({ status }: EventApprovalListProps) {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [actionType, setActionType] = useState<"approve" | "reject">("approve")
  const [feedback, setFeedback] = useState("")
  const [processing, setProcessing] = useState(false)
  const supabase = createBrowserClient()
  const { toast } = useToast()

  useEffect(() => {
    loadEvents()
  }, [status])

  const loadEvents = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("events")
        .select(
          `
          *,
          organizer:profiles!organizer_id(full_name, email)
        `,
        )
        .eq("status", status)
        .order("created_at", { ascending: false })

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error("[v0] Error loading events:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los eventos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async () => {
    if (!selectedEvent) return

    if (actionType === "reject" && !feedback.trim()) {
      toast({
        title: "Feedback requerido",
        description: "Debes proporcionar una razón para rechazar el evento",
        variant: "destructive",
      })
      return
    }

    setProcessing(true)
    try {
      const { error } = await supabase
        .from("events")
        .update({
          status: actionType === "approve" ? "approved" : "rejected",
          admin_feedback: actionType === "reject" ? feedback : null,
        })
        .eq("id", selectedEvent.id)

      if (error) throw error

      toast({
        title: actionType === "approve" ? "Evento aprobado" : "Evento rechazado",
        description:
          actionType === "approve"
            ? "El evento ha sido aprobado y está visible para los usuarios"
            : "El organizador recibirá tu feedback",
      })

      setShowDialog(false)
      setFeedback("")
      loadEvents()
    } catch (error) {
      console.error("[v0] Error processing event:", error)
      toast({
        title: "Error",
        description: "No se pudo procesar la acción",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const openDialog = (event: any, type: "approve" | "reject") => {
    setSelectedEvent(event)
    setActionType(type)
    setShowDialog(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-label="Cargando eventos" />
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No hay eventos{" "}
          {status === "pending_approval" ? "pendientes" : status === "approved" ? "aprobados" : "rechazados"}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {events.map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{event.title}</CardTitle>
                  <CardDescription>
                    Organizado por: {event.organizer?.full_name || "Desconocido"} ({event.organizer?.email})
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    event.status === "approved" ? "default" : event.status === "rejected" ? "destructive" : "secondary"
                  }
                >
                  {event.status === "pending_approval"
                    ? "Pendiente"
                    : event.status === "approved"
                      ? "Aprobado"
                      : "Rechazado"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <p className="font-medium">Fecha de inicio</p>
                    <p className="text-muted-foreground">{format(new Date(event.start_date), "PPP", { locale: es })}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <p className="font-medium">Ubicación</p>
                    <p className="text-muted-foreground">{event.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <p className="font-medium">Capacidad</p>
                    <p className="text-muted-foreground">{event.capacity || "Ilimitada"}</p>
                  </div>
                </div>
              </div>

              {event.address && (
                <div className="text-sm">
                  <p className="font-medium">Dirección completa:</p>
                  <p className="text-muted-foreground">{event.address}</p>
                </div>
              )}

              {event.admin_feedback && (
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm font-medium mb-1">Feedback del administrador:</p>
                  <p className="text-sm text-muted-foreground">{event.admin_feedback}</p>
                </div>
              )}

              {status === "pending_approval" && (
                <div className="flex gap-2 pt-2">
                  <Button onClick={() => openDialog(event, "approve")} className="flex-1" size="sm">
                    <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden="true" />
                    Aprobar Evento
                  </Button>
                  <Button
                    onClick={() => openDialog(event, "reject")}
                    variant="destructive"
                    className="flex-1"
                    size="sm"
                  >
                    <XCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                    Rechazar Evento
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionType === "approve" ? "Aprobar Evento" : "Rechazar Evento"}</DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "¿Estás seguro de que deseas aprobar este evento? Será visible para todos los usuarios."
                : "Proporciona feedback al organizador sobre por qué se rechaza el evento."}
            </DialogDescription>
          </DialogHeader>

          {actionType === "reject" && (
            <div className="space-y-2">
              <Label htmlFor="feedback">
                Razón del rechazo <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="feedback"
                placeholder="Explica por qué se rechaza el evento (datos incompletos, fecha no válida, etc.)"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                required
              />
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowDialog(false)} disabled={processing}>
              Cancelar
            </Button>
            <Button
              onClick={handleAction}
              disabled={processing}
              variant={actionType === "approve" ? "default" : "destructive"}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Procesando...
                </>
              ) : (
                <>{actionType === "approve" ? "Aprobar" : "Rechazar"}</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
