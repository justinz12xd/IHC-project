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
import { Loader2, Save, Send } from "lucide-react"

interface EventFormProps {
  organizerId: string
  event?: any
}

export function EventForm({ organizerId, event }: EventFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [saveType, setSaveType] = useState<"draft" | "submit">("draft")
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createBrowserClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, type: "draft" | "submit") => {
    e.preventDefault()
    setIsLoading(true)
    setSaveType(type)

    const formData = new FormData(e.currentTarget)

    const startDate = formData.get("start_date") as string
    const endDate = formData.get("end_date") as string

    const data = {
      organizer_id: organizerId,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      location: formData.get("location") as string,
      address: formData.get("address") as string,
      start_date: startDate,
      end_date: endDate || startDate, // Si no hay end_date, usar start_date
      capacity: formData.get("capacity") ? Number.parseInt(formData.get("capacity") as string) : null,
      status: type === "draft" ? "draft" : "pending_approval",
    }

    try {
      if (event) {
        // Update existing event
        const { error } = await supabase.from("events").update(data).eq("id", event.id)

        if (error) throw error

        toast({
          title: type === "draft" ? "Borrador guardado" : "Evento actualizado",
          description:
            type === "draft" ? "Los cambios se guardaron como borrador" : "El evento se envió para aprobación",
        })
      } else {
        // Create new event
        const { data: newEvent, error } = await supabase.from("events").insert(data).select().single()

        if (error) throw error

        toast({
          title: type === "draft" ? "Borrador creado" : "Evento creado",
          description:
            type === "draft"
              ? "El evento se guardó como borrador"
              : "El evento se envió para aprobación del administrador",
        })

        if (newEvent && type === "submit") {
          router.push(`/organizer/events/${newEvent.id}`)
        }
      }

      if (type === "draft" || event) {
        router.push("/organizer/dashboard")
      }
      router.refresh()
    } catch (error) {
      console.error("[v0] Error saving event:", error)
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
    <form onSubmit={(e) => e.preventDefault()}>
      <Card>
        <CardHeader>
          <CardTitle>Información del Evento</CardTitle>
          <CardDescription>Completa los detalles de tu evento agroproductivo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
              defaultValue={event?.title}
              required
              maxLength={200}
              aria-required="true"
            />
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
              defaultValue={event?.description}
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
                defaultValue={event?.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : ""}
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
                defaultValue={event?.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : ""}
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
              defaultValue={event?.location}
              required
              maxLength={200}
              aria-required="true"
            />
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
              defaultValue={event?.capacity || ""}
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
              onClick={(e: any) => handleSubmit(e, "draft")}
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
              onClick={(e: any) => handleSubmit(e, "submit")}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading && saveType === "submit" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" aria-hidden="true" />
                  <span>Enviar para Aprobación</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
