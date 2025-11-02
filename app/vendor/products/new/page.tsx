import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
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

  // Verificar que el usuario sea vendedor
  const { data: usuario } = await supabase
    .from("usuario")
    .select("rol, id_usuario")
    .eq("auth_id", user.id)
    .single()

  if (!usuario || (usuario.rol !== "VENDEDOR" && usuario.rol !== "ADMIN")) {
    redirect("/dashboard")
  }

  // Verificar si existe el vendedor
  const { data: vendedor } = await supabase
    .from("vendedor")
    .select("id_vendedor")
    .eq("id_vendedor", usuario.id_usuario)
    .maybeSingle()

  if (!vendedor) {
    redirect("/setup-vendor")
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Nuevo Producto</h1>
            <p className="text-muted-foreground text-lg">Agrega un nuevo producto a tu catálogo</p>
          </div>

          <ProductForm vendorId={vendedor.id_vendedor} />
        </div>
      </main>
    </div>
  )
}
