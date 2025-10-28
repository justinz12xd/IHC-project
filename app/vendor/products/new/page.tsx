import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { ProductForm } from "@/components/product-form"

export default async function NewProductPage() {
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

  const { data: vendor } = await supabase.from("vendors").select("id").eq("user_id", user.id).single()

  if (!vendor) {
    redirect("/setup-vendor")
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav userRole="vendor" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Nuevo Producto</h1>
            <p className="text-muted-foreground text-lg">Agrega un nuevo producto a tu catálogo</p>
          </div>

          <ProductForm vendorId={vendor.id} />
        </div>
      </main>
    </div>
  )
}
