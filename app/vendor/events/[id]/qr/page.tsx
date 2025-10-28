import { notFound, redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { QRCodeDisplay } from "@/components/qr-code-display"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default async function VendorEventQRPage({
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

  if (profile?.role !== "vendor") {
    redirect("/dashboard")
  }

  const { data: vendor } = await supabase.from("vendors").select("id, business_name").eq("user_id", user.id).single()

  if (!vendor) {
    redirect("/setup-vendor")
  }

  // Get event details
  const { data: event, error } = await supabase.from("events").select("*").eq("id", params.id).single()

  if (error || !event) {
    notFound()
  }

  // Check if vendor is approved for this event
  const { data: eventVendor } = await supabase
    .from("event_vendors")
    .select("*")
    .eq("event_id", event.id)
    .eq("vendor_id", vendor.id)
    .eq("status", "approved")
    .single()

  if (!eventVendor) {
    redirect("/vendor/dashboard")
  }

  // Check if already attended
  const { data: attendance } = await supabase
    .from("attendances")
    .select("*")
    .eq("event_id", event.id)
    .eq("user_id", user.id)
    .eq("user_type", "vendor")
    .single()

  const eventDate = new Date(event.date)
  const qrData = JSON.stringify({
    eventId: event.id,
    userId: user.id,
    type: "vendor",
    timestamp: Date.now(),
  })

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav userRole="vendor" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">Código QR de Vendedor</h1>
            <p className="text-muted-foreground text-lg">Presenta este código para registrar tu llegada al evento</p>
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
                    <h3 className="text-xl font-semibold mb-2">Llegada Registrada</h3>
                    <p className="text-muted-foreground">
                      Tu llegada fue registrada el{" "}
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
                    <p className="font-medium">{vendor.business_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Muestra este código QR al organizador para registrar tu llegada
                    </p>
                    <Badge variant="outline">Código de vendedor</Badge>
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
