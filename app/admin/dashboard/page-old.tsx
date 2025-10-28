import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, XCircle, Clock, Calendar } from "lucide-react"
import { EventApprovalList } from "@/components/event-approval-list"
import { AdminMetrics } from "@/components/admin-metrics"
import { AdminNav } from "@/components/admin-nav"

export default async function AdminDashboardPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard")
  }

  // Get metrics
  const { data: allEvents } = await supabase.from("events").select("status")

  const metrics = {
    pending: allEvents?.filter((e) => e.status === "pending_approval").length || 0,
    approved: allEvents?.filter((e) => e.status === "approved").length || 0,
    rejected: allEvents?.filter((e) => e.status === "rejected").length || 0,
    total: allEvents?.length || 0,
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />

      <div className="container mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
          <p className="text-muted-foreground mt-2">Gestiona y aprueba eventos de la plataforma</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes de Aprobación</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.pending}</div>
              <p className="text-xs text-muted-foreground">Eventos esperando revisión</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eventos Aprobados</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.approved}</div>
              <p className="text-xs text-muted-foreground">Total de eventos aprobados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eventos Rechazados</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.rejected}</div>
              <p className="text-xs text-muted-foreground">Total de eventos rechazados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total}</div>
              <p className="text-xs text-muted-foreground">Todos los eventos en la plataforma</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              Pendientes <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs">{metrics.pending}</span>
            </TabsTrigger>
            <TabsTrigger value="approved">Aprobados</TabsTrigger>
            <TabsTrigger value="rejected">Rechazados</TabsTrigger>
            <TabsTrigger value="metrics">Métricas</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Eventos Pendientes de Aprobación</CardTitle>
                <CardDescription>Revisa y aprueba o rechaza eventos propuestos por organizadores</CardDescription>
              </CardHeader>
              <CardContent>
                <EventApprovalList status="pending_approval" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Eventos Aprobados</CardTitle>
                <CardDescription>Historial de eventos que han sido aprobados</CardDescription>
              </CardHeader>
              <CardContent>
                <EventApprovalList status="approved" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Eventos Rechazados</CardTitle>
                <CardDescription>Historial de eventos que han sido rechazados con feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <EventApprovalList status="rejected" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <AdminMetrics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
