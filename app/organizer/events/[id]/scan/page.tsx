import { notFound, redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { QRScanner } from "@/components/qr-scanner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ScanQRPage({
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

  if (profile?.role !== "organizer") {
    redirect("/dashboard")
  }

  // Get event details
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", params.id)
    .eq("organizer_id", user.id)
    .single()

  if (error || !event) {
    notFound()
  }

  // Get attendance stats
  const { data: attendances } = await supabase.from("attendances").select("*").eq("event_id", event.id)

  const totalAttendances = attendances?.length || 0
  const attendeeCount = attendances?.filter((a) => a.user_type === "attendee").length || 0
  const vendorCount = attendances?.filter((a) => a.user_type === "vendor").length || 0

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav userRole="organizer" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Escanear Asistencia</h1>
            <p className="text-muted-foreground text-lg">{event.name}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Asistencias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalAttendances}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Asistentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{attendeeCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Vendedores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vendorCount}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Escanear Código QR</CardTitle>
              <CardDescription>
                Escanea el código QR de los asistentes y vendedores para registrar su llegada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QRScanner eventId={event.id} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
