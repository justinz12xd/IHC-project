import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Calendar, Users, TrendingUp, CheckCircle } from "lucide-react"
import Link from "next/link"
import { OrganizerEventCard } from "@/components/organizer-event-card"

export default async function OrganizerDashboardPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "organizer") {
    redirect("/dashboard")
  }

  // Get organizer's events
  const { data: events } = await supabase
    .from("events")
    .select(`
      *,
      event_vendors (
        id,
        status
      ),
      event_registrations (
        id
      )
    `)
    .eq("organizer_id", user.id)
    .order("date", { ascending: false })

  const upcomingEvents = events?.filter((e) => new Date(e.date) >= new Date()) || []
  const pastEvents = events?.filter((e) => new Date(e.date) < new Date()) || []
  const draftEvents = events?.filter((e) => e.status === "draft") || []
  const pendingEvents = events?.filter((e) => e.status === "pending") || []
  const approvedEvents = events?.filter((e) => e.status === "approved") || []

  // Calculate stats
  const totalEvents = events?.length || 0
  const totalRegistrations = events?.reduce((sum, e) => sum + (e.event_registrations?.length || 0), 0) || 0
  const totalVendors =
    events?.reduce((sum, e) => {
      const approved = e.event_vendors?.filter((ev: any) => ev.status === "approved").length || 0
      return sum + approved
    }, 0) || 0

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav userRole="organizer" />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-balance mb-2">Panel de Organizador</h1>
              <p className="text-muted-foreground text-lg">Gestiona tus eventos agroproductivos</p>
            </div>
            <Button asChild size="lg">
              <Link href="/organizer/events/new">
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                Crear Evento
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Eventos</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEvents}</div>
                <p className="text-xs text-muted-foreground mt-1">Eventos creados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Registros</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalRegistrations}</div>
                <p className="text-xs text-muted-foreground mt-1">Usuarios registrados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vendedores</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalVendors}</div>
                <p className="text-xs text-muted-foreground mt-1">Aprobados en eventos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{approvedEvents.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Eventos activos</p>
              </CardContent>
            </Card>
          </div>

          {/* Events Tabs */}
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full max-w-2xl grid-cols-4">
              <TabsTrigger value="upcoming">Próximos</TabsTrigger>
              <TabsTrigger value="pending">Pendientes</TabsTrigger>
              <TabsTrigger value="draft">Borradores</TabsTrigger>
              <TabsTrigger value="past">Pasados</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-6 mt-6">
              {upcomingEvents.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {upcomingEvents.map((event) => (
                    <OrganizerEventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" aria-hidden="true" />
                    <h3 className="text-lg font-semibold mb-2">No hay eventos próximos</h3>
                    <p className="text-muted-foreground mb-4">Crea tu primer evento para comenzar</p>
                    <Button asChild>
                      <Link href="/organizer/events/new">
                        <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                        Crear Evento
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="pending" className="space-y-6 mt-6">
              {pendingEvents.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {pendingEvents.map((event) => (
                    <OrganizerEventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No hay eventos pendientes de aprobación</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="draft" className="space-y-6 mt-6">
              {draftEvents.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {draftEvents.map((event) => (
                    <OrganizerEventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No hay borradores guardados</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-6 mt-6">
              {pastEvents.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {pastEvents.map((event) => (
                    <OrganizerEventCard key={event.id} event={event} isPast />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No hay eventos pasados</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
