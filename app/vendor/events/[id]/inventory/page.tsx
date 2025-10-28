import { notFound, redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { InventoryManager } from "@/components/inventory-manager"

export default async function EventInventoryPage({
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

  const { data: vendor } = await supabase.from("vendors").select("id").eq("user_id", user.id).single()

  if (!vendor) {
    redirect("/setup-vendor")
  }

  // Get event details
  const { data: event, error: eventError } = await supabase.from("events").select("*").eq("id", params.id).single()

  if (eventError || !event) {
    notFound()
  }

  // Verify vendor is approved for this event
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

  // Get vendor's products
  const { data: products } = await supabase.from("products").select("*").eq("vendor_id", vendor.id).order("name")

  // Get existing inventory for this event
  const { data: inventory } = await supabase
    .from("inventory")
    .select("*")
    .eq("event_id", event.id)
    .eq("vendor_id", vendor.id)

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav userRole="vendor" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Gestión de Inventario</h1>
            <p className="text-muted-foreground text-lg">{event.name}</p>
          </div>

          <InventoryManager
            eventId={event.id}
            vendorId={vendor.id}
            products={products || []}
            existingInventory={inventory || []}
          />
        </div>
      </main>
    </div>
  )
}
