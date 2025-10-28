"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, TrendingUp, Users, Calendar, Package } from "lucide-react"

export function AdminMetrics() {
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    loadMetrics()
  }, [])

  const loadMetrics = async () => {
    setLoading(true)
    try {
      // Get all events
      const { data: events } = await supabase.from("events").select("*")

      // Get all users
      const { data: profiles } = await supabase.from("profiles").select("role")

      // Get all vendors
      const { data: vendors } = await supabase.from("vendors").select("id")

      // Get all products
      const { data: products } = await supabase.from("products").select("id")

      // Calculate metrics
      const totalEvents = events?.length || 0
      const approvedEvents = events?.filter((e) => e.status === "approved").length || 0
      const rejectedEvents = events?.filter((e) => e.status === "rejected").length || 0
      const pendingEvents = events?.filter((e) => e.status === "pending_approval").length || 0

      const approvalRate = totalEvents > 0 ? ((approvedEvents / totalEvents) * 100).toFixed(1) : "0"
      const rejectionRate = totalEvents > 0 ? ((rejectedEvents / totalEvents) * 100).toFixed(1) : "0"

      const usersByRole = {
        normal: profiles?.filter((p) => p.role === "normal").length || 0,
        vendor: profiles?.filter((p) => p.role === "vendor").length || 0,
        organizer: profiles?.filter((p) => p.role === "organizer").length || 0,
        admin: profiles?.filter((p) => p.role === "admin").length || 0,
      }

      setMetrics({
        totalEvents,
        approvedEvents,
        rejectedEvents,
        pendingEvents,
        approvalRate,
        rejectionRate,
        totalUsers: profiles?.length || 0,
        usersByRole,
        totalVendors: vendors?.length || 0,
        totalProducts: products?.length || 0,
      })
    } catch (error) {
      console.error("[v0] Error loading metrics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-label="Cargando métricas" />
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No se pudieron cargar las métricas</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Métricas Globales de la Plataforma</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasa de Aprobación</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.approvalRate}%</div>
              <p className="text-xs text-muted-foreground">
                {metrics.approvedEvents} de {metrics.totalEvents} eventos aprobados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasa de Rechazo</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-600" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.rejectionRate}%</div>
              <p className="text-xs text-muted-foreground">
                {metrics.rejectedEvents} de {metrics.totalEvents} eventos rechazados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eventos Pendientes</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-600" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.pendingEvents}</div>
              <p className="text-xs text-muted-foreground">Esperando revisión</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Usuarios de la Plataforma</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Usuarios registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Normales</CardTitle>
              <Users className="h-4 w-4 text-blue-600" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.usersByRole.normal}</div>
              <p className="text-xs text-muted-foreground">Asistentes a eventos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendedores</CardTitle>
              <Package className="h-4 w-4 text-green-600" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.usersByRole.vendor}</div>
              <p className="text-xs text-muted-foreground">Vendedores activos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Organizadores</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.usersByRole.organizer}</div>
              <p className="text-xs text-muted-foreground">Organizadores de eventos</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Contenido de la Plataforma</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Vendedores</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalVendors}</div>
              <p className="text-xs text-muted-foreground">Perfiles de vendedor creados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Productos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalProducts}</div>
              <p className="text-xs text-muted-foreground">Productos registrados</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
