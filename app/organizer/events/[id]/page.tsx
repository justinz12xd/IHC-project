import { notFound, redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Store } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { VendorManagementList } from "@/components/vendor-management-list"
import { AttendeesList } from "@/components/attendees-list"

export default async function ManageEventPage({
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
    .select(`
      *,
      event_vendors (
        id,
        status,
        vendors (
          id,
          business_name,
          description,
          logo_url
        )
      ),
      event_registrations (
        id,
        created_at,
        profiles (
          id,
          full_name,
          email
        )
      )
    `)
    .eq("id", params.id)
    .eq("organizer_id", user.id)
    .single()

  if (error || !event) {
    notFound()
  }

  const eventDate = new Date(event.date)
  const registrations = event.event_registrations?.length || 0
  const approvedVendors = event.event_vendors?.filter((ev: any) => ev.status === "approved").length || 0
  const pendingVendors = event.event_vendors?.filter((ev: any) => ev.status === "pending").length || 0

  // Get all vendors for adding
  const { data: allVendors } = await supabase
    .from("vendors")
    .select("id, business_name, description, logo_url")
    .order("business_name")

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav userRole="organizer" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Event Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <h1 className="text-4xl font-bold text-balance">{event.name}</h1>
                <p className="text-lg text-muted-foreground text-pretty">{event.description}</p>
              </div>

              <Button asChild variant="outline">
                <Link href={`/organizer/events/${event.id}/edit`}>Editar Evento</Link>
              </Button>
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

              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <span className="font-medium">{registrations} registrados</span>
              </div>

              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <span className="font-medium">{approvedVendors} vendedores</span>
              </div>
            </div>

            <Badge variant="secondary">
              Estado:{" "}
              {event.status === "draft"
                ? "Borrador"
                : event.status === "pending"
                  ? "Pendiente de Aprobación"
                  : event.status === "approved"
                    ? "Aprobado"
                    : "Rechazado"}
            </Badge>
          </div>

          {/* Management Tabs */}
          <Tabs defaultValue="vendors" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="vendors">Vendedores {pendingVendors > 0 && `(${pendingVendors})`}</TabsTrigger>
              <TabsTrigger value="attendees">Asistentes</TabsTrigger>
            </TabsList>

            <TabsContent value="vendors" className="space-y-6 mt-6">
              <VendorManagementList
                eventId={event.id}
                eventVendors={event.event_vendors || []}
                allVendors={allVendors || []}
              />
            </TabsContent>

            <TabsContent value="attendees" className="space-y-6 mt-6">
              <AttendeesList eventId={event.id} registrations={event.event_registrations || []} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
