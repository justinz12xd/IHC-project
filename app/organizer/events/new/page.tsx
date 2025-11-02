import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
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

  // Verificar que el usuario sea organizador
  const { data: usuario } = await supabase
    .from("usuario")
    .select("rol, id_usuario")
    .eq("auth_id", user.id)
    .single()

  if (!usuario || (usuario.rol !== "ORGANIZADOR" && usuario.rol !== "ADMIN")) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Crear Evento</h1>
            <p className="text-muted-foreground text-lg">Organiza un nuevo evento agroproductivo</p>
          </div>

          <EventForm organizerId={usuario.id_usuario} />
        </div>
      </main>
    </div>
  )
}
