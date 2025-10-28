import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { BookOpen, Target, Package } from "lucide-react"
import Link from "next/link"
import { ProductCard } from "@/components/product-card"

export default async function VendorProfilePage() {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "vendor") {
    redirect("/dashboard")
  }

  const { data: vendor } = await supabase.from("vendors").select("*").eq("user_id", user.id).single()

  if (!vendor) {
    redirect("/setup-vendor")
  }

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("vendor_id", vendor.id)
    .order("created_at", { ascending: false })

  const { data: eventVendors } = await supabase.from("event_vendors").select("id, status").eq("vendor_id", vendor.id)

  const totalEvents = eventVendors?.length || 0

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav userRole="vendor" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-6">
              {vendor.logo_url ? (
                <img
                  src={vendor.logo_url || "/placeholder.svg"}
                  alt={`Logo de ${vendor.business_name}`}
                  className="h-24 w-24 rounded-lg object-cover"
                />
              ) : (
                <div className="h-24 w-24 rounded-lg bg-muted flex items-center justify-center">
                  <span className="text-3xl font-bold">{vendor.business_name?.charAt(0).toUpperCase()}</span>
                </div>
              )}

              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-balance">{vendor.business_name}</h1>
                <p className="text-lg text-muted-foreground text-pretty">{vendor.description}</p>
                <div className="flex gap-2">
                  <Badge variant="secondary">{products?.length || 0} Productos</Badge>
                  <Badge variant="secondary">{totalEvents} Eventos</Badge>
                </div>
              </div>
            </div>

            <Button asChild variant="outline">
              <Link href="/vendor/profile/edit">Editar Perfil</Link>
            </Button>
          </div>

          <Separator />

          {/* About Section */}
          <div className="grid gap-6 md:grid-cols-2">
            {vendor.story && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                    Nuestra Historia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-pretty">{vendor.story}</p>
                </CardContent>
              </Card>
            )}

            {vendor.objectives && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                    Nuestros Objetivos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-pretty">{vendor.objectives}</p>
                </CardContent>
              </Card>
            )}
          </div>

          <Separator />

          {/* Products Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Package className="h-6 w-6" aria-hidden="true" />
                  Nuestros Productos
                </h2>
                <p className="text-muted-foreground mt-1">Catálogo completo de productos disponibles</p>
              </div>
            </div>

            {products && products.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" aria-hidden="true" />
                  <p className="text-muted-foreground">No hay productos registrados aún</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
