"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { FormProgress } from "@/components/form-progress"
import { Loader2, Save, Send } from "lucide-react"

interface EventFormProps {
  organizerId: string
  event?: any
}

export function EventForm({ organizerId, event }: EventFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [saveType, setSaveType] = useState<"draft" | "submit">("draft")
  const [title, setTitle] = useState(event?.title || "")
  const [description, setDescription] = useState(event?.description || "")
  const [location, setLocation] = useState(event?.location || "")
  const [startDate, setStartDate] = useState(event?.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : "")
  const [endDate, setEndDate] = useState(event?.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : "")
  const [capacity, setCapacity] = useState(event?.capacity || "")
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createBrowserClient()

  const handleSubmit = async (type: "draft" | "submit") => {
    setIsLoading(true)
    setSaveType(type)

    const data = {
      id_organizador: organizerId,
      nombre: title,
      descripcion: description,
      lugar: location,
      fecha_inicio: startDate.split('T')[0], // Solo fecha
      fecha_fin: endDate ? endDate.split('T')[0] : startDate.split('T')[0], // Solo fecha
      capacidad: capacity ? Number.parseInt(capacity) : null,
      estado: type === "draft" ? "PENDIENTE" : "APROBADO", // Borrador o directamente aprobado
    }

    try {
      console.log("[event-form] 📝 Guardando evento:", data)
      
      if (event) {
        // Update existing event
        const { error } = await supabase.from("evento").update(data).eq("id_evento", event.id_evento)

        if (error) {
          console.error("[event-form] ❌ Error actualizando:", error)
          throw error
        }

        console.log("[event-form] ✅ Evento actualizado")
        toast({
          title: type === "draft" ? "Borrador guardado" : "Evento actualizado",
          description:
            type === "draft" ? "Los cambios se guardaron como borrador" : "El evento se actualizó correctamente",
        })
      } else {
        // Create new event
        console.log("[event-form] 🔨 Creando evento...")
        const { data: newEvent, error } = await supabase.from("evento").insert(data).select().single()

        if (error) {
          console.error("[event-form] ❌ Error creando:", error)
          throw error
        }

        console.log("[event-form] ✅ Evento creado:", newEvent)
        toast({
          title: type === "draft" ? "Borrador creado" : "¡Evento publicado!",
          description:
            type === "draft"
              ? "El evento se guardó como borrador"
              : "El evento se creó exitosamente y ya está visible para los usuarios",
        })

        if (newEvent && type === "submit") {
          // Pequeño delay para mostrar el toast antes de redirigir
          await new Promise(resolve => setTimeout(resolve, 500))
          router.push(`/organizer/events/${newEvent.id_evento}`)
          return
        }
      }

      if (type === "draft" || event) {
        // Pequeño delay para mostrar el toast
        await new Promise(resolve => setTimeout(resolve, 500))
        router.push("/organizer/dashboard")
      }
      router.refresh()
    } catch (error) {
      console.error("[event-form] Error saving event:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo guardar el evento",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Información del Evento</CardTitle>
          <CardDescription>Completa los detalles de tu evento agroproductivo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormProgress
            fields={[
              { name: 'title', value: title, required: true, label: 'Nombre del evento' },
              { name: 'description', value: description, required: true, label: 'Descripción' },
              { name: 'startDate', value: startDate, required: true, label: 'Fecha de inicio' },
              { name: 'endDate', value: endDate, required: true, label: 'Fecha de fin' },
              { name: 'location', value: location, required: true, label: 'Ubicación' },
              { name: 'capacity', value: capacity, required: false, label: 'Capacidad' },
            ]}
          />
          <div className="space-y-2">
            <Label htmlFor="title">
              Nombre del Evento{" "}
              <span className="text-destructive" aria-label="requerido">
                *
              </span>
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="Ej: Feria Agroproductiva de Primavera"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              aria-required="true"
              autoComplete="off"
              list="event-names"
            />
            <datalist id="event-names">
              <option value="Feria Agroproductiva de Primavera" />
              <option value="Mercado Orgánico Local" />
              <option value="Exposición de Productos Regionales" />
              <option value="Festival de la Cosecha" />
              <option value="Encuentro de Productores" />
              <option value="Muestra Agroindustrial" />
            </datalist>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Descripción{" "}
              <span className="text-destructive" aria-label="requerido">
                *
              </span>
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe el evento, sus objetivos y qué pueden esperar los asistentes"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              maxLength={1000}
              className="resize-none"
              aria-required="true"
            />
            <p className="text-xs text-muted-foreground">Máximo 1000 caracteres</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_date">
                Fecha y Hora de Inicio{" "}
                <span className="text-destructive" aria-label="requerido">
                  *
                </span>
              </Label>
              <Input
                id="start_date"
                name="start_date"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                aria-required="true"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">
                Fecha y Hora de Fin{" "}
                <span className="text-destructive" aria-label="requerido">
                  *
                </span>
              </Label>
              <Input
                id="end_date"
                name="end_date"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                aria-required="true"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">
              Ubicación{" "}
              <span className="text-destructive" aria-label="requerido">
                *
              </span>
            </Label>
            <Input
              id="location"
              name="location"
              placeholder="Ej: Centro de Convenciones Municipal"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              maxLength={200}
              aria-required="true"
              autoComplete="off"
              list="common-locations"
            />
            <datalist id="common-locations">
              <option value="Centro de Convenciones Municipal" />
              <option value="Plaza Principal" />
              <option value="Parque Central" />
              <option value="Centro Comunitario" />
              <option value="Salón de Eventos" />
              <option value="Mercado Municipal" />
              <option value="Explanada del Municipio" />
            </datalist>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección Completa</Label>
            <Input
              id="address"
              name="address"
              placeholder="Ej: Calle Principal 123, Ciudad"
              defaultValue={event?.address}
              maxLength={300}
            />
            <p className="text-xs text-muted-foreground">Dirección detallada para facilitar la llegada</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Capacidad de Asistentes</Label>
            <Input
              id="capacity"
              name="capacity"
              type="number"
              min="1"
              placeholder="Opcional: límite de asistentes"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Dejar vacío para capacidad ilimitada</p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSubmit("draft")}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading && saveType === "draft" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" aria-hidden="true" />
                  <span>Guardar Borrador</span>
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={() => handleSubmit("submit")}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading && saveType === "submit" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Publicando...</span>
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" aria-hidden="true" />
                  <span>Publicar Evento</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
