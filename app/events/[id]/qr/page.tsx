import { notFound, redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { QRCodeDisplay } from "@/components/qr-code-display"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default async function EventQRPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  // Get event details
  const { data: event, error } = await supabase.from("events").select("*").eq("id", params.id).single()

  if (error || !event) {
    notFound()
  }

  // Check if user is registered
  const { data: registration } = await supabase
    .from("event_registrations")
    .select("*")
    .eq("event_id", event.id)
    .eq("user_id", user.id)
    .single()

  if (!registration && profile?.role === "normal") {
    redirect(`/events/${event.id}`)
  }

  // Check if already attended
  const { data: attendance } = await supabase
    .from("attendances")
    .select("*")
    .eq("event_id", event.id)
    .eq("user_id", user.id)
    .eq("user_type", "attendee")
    .single()

  const eventDate = new Date(event.date)
  const qrData = JSON.stringify({
    eventId: event.id,
    userId: user.id,
    type: "attendee",
    timestamp: Date.now(),
  })

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav userRole={profile?.role || "normal"} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">Código QR de Asistencia</h1>
            <p className="text-muted-foreground text-lg">Presenta este código en el evento para marcar tu asistencia</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{event.name}</CardTitle>
              <CardDescription className="space-y-2 pt-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  <time dateTime={event.date}>
                    {format(eventDate, "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                  </time>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  <span>{event.location}</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {attendance ? (
                <div className="text-center py-8 space-y-4">
                  <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-green-600" aria-hidden="true" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Asistencia Confirmada</h3>
                    <p className="text-muted-foreground">
                      Tu asistencia fue registrada el{" "}
                      {format(new Date(attendance.checked_in_at), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    Ya registrado
                  </Badge>
                </div>
              ) : (
                <>
                  <QRCodeDisplay data={qrData} />

                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Muestra este código QR al personal del evento para registrar tu asistencia
                    </p>
                    <Badge variant="outline">Válido solo para este evento</Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
