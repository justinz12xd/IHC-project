import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { EventForm } from "@/components/event-form"

export default async function NewEventPage() {
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

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav userRole="organizer" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Crear Evento</h1>
            <p className="text-muted-foreground text-lg">Organiza un nuevo evento agroproductivo</p>
          </div>

          <EventForm organizerId={user.id} />
        </div>
      </main>
    </div>
  )
}
