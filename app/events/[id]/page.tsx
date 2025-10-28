import { notFound, redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, MapPin, Users, Store } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { RegisterEventButton } from "@/components/register-event-button"
import { VendorCard } from "@/components/vendor-card"

export default async function EventDetailPage({
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

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  // Get event details
  const { data: event, error } = await supabase
    .from("events")
    .select(`
      *,
      event_vendors (
        id,
        status,
        vendors (
          id,
          business_name,
          description,
          story,
          objectives,
          logo_url,
          products (
            id,
            name,
            description,
            benefits,
            creation_story,
            image_url
          )
        )
      )
    `)
    .eq("id", params.id)
    .single()

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

  const isRegistered = !!registration
  const eventDate = new Date(event.date)
  const isPastEvent = eventDate < new Date()
  const approvedVendors = event.event_vendors?.filter((ev: any) => ev.status === "approved") || []

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav userRole={profile?.role || "normal"} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Event Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <h1 className="text-4xl font-bold text-balance">{event.name}</h1>
                <p className="text-lg text-muted-foreground text-pretty">{event.description}</p>
              </div>

              {!isPastEvent && profile?.role === "normal" && (
                <RegisterEventButton eventId={event.id} isRegistered={isRegistered} capacity={event.capacity} />
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <time dateTime={event.date} className="font-medium">
                  {format(eventDate, "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                </time>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <span className="font-medium">{event.location}</span>
              </div>

              {event.capacity && (
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  <span className="font-medium">Capacidad: {event.capacity}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <span className="font-medium">
                  {approvedVendors.length} {approvedVendors.length === 1 ? "vendedor" : "vendedores"}
                </span>
              </div>
            </div>

            {isRegistered && (
              <Badge variant="secondary" className="text-sm">
                Ya estás registrado en este evento
              </Badge>
            )}
          </div>

          <Separator />

          {/* Vendors Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Vendedores Participantes</h2>
              <p className="text-muted-foreground">Conoce a los productores locales que estarán en este evento</p>
            </div>

            {approvedVendors.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {approvedVendors.map((eventVendor: any) => (
                  <VendorCard key={eventVendor.id} vendor={eventVendor.vendors} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Aún no hay vendedores confirmados para este evento</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
