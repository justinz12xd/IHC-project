// import { redirect } from "next/navigation"
// import { createServerClient } from "@/lib/supabase/server"
// import { DashboardNav } from "@/components/dashboard-nav"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Plus, Package, Calendar, TrendingUp } from "lucide-react"
// import Link from "next/link"
// import { VendorEventCard } from "@/components/vendor-event-card"
// import { ProductCard } from "@/components/product-card"

// export default async function VendorDashboardPage() {
//   // AUTENTICACIÓN TEMPORALMENTE DESACTIVADA
//   /*
//   const supabase = await createServerClient()

//   const {
//     data: { user },
//     error: userError,
//   } = await supabase.auth.getUser()

//   if (userError || !user) {
//     redirect("/login")
//   }
//   */

//   // Datos de ejemplo para mostrar la interfaz sin autenticación
//   const user = { id: "temp-user", email: "demo@example.com" }

//   const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

//   if (profile?.role !== "vendor") {
//     redirect("/dashboard")
//   }

//   // Get vendor profile
//   const { data: vendor } = await supabase.from("vendors").select("*").eq("user_id", user.id).single()

//   if (!vendor) {
//     redirect("/setup-vendor")
//   }

//   // Get vendor's products
//   const { data: products } = await supabase
//     .from("products")
//     .select("*")
//     .eq("vendor_id", vendor.id)
//     .order("created_at", { ascending: false })

//   // Get vendor's events
//   const { data: eventVendors } = await supabase
//     .from("event_vendors")
//     .select(`
//       *,
//       events (
//         *
//       )
//     `)
//     .eq("vendor_id", vendor.id)
//     .order("created_at", { ascending: false })

//   const upcomingEvents = eventVendors?.filter((ev) => ev.events && new Date(ev.events.date) >= new Date()) || []

//   const pastEvents = eventVendors?.filter((ev) => ev.events && new Date(ev.events.date) < new Date()) || []

//   // Calculate stats
//   const totalProducts = products?.length || 0
//   const approvedEvents = eventVendors?.filter((ev) => ev.status === "approved").length || 0
//   const pendingEvents = eventVendors?.filter((ev) => ev.status === "pending").length || 0

//   return (
//     <div className="min-h-screen bg-background">
//       <DashboardNav userRole="vendor" />

//       <main className="container mx-auto px-4 py-8">
//         <div className="space-y-8">
//           {/* Header */}
//           <div className="flex items-start justify-between gap-4">
//             <div>
//               <h1 className="text-4xl font-bold text-balance mb-2">Panel de Vendedor</h1>
//               <p className="text-muted-foreground text-lg">Gestiona tus productos y eventos</p>
//             </div>
//             <Button asChild>
//               <Link href="/vendor/profile">Ver Perfil Público</Link>
//             </Button>
//           </div>

//           {/* Stats Cards */}
//           <div className="grid gap-4 md:grid-cols-3">
//             <Card>
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
//                 <Package className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">{totalProducts}</div>
//                 <p className="text-xs text-muted-foreground mt-1">Productos registrados</p>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">Eventos Aprobados</CardTitle>
//                 <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">{approvedEvents}</div>
//                 <p className="text-xs text-muted-foreground mt-1">Confirmados para venta</p>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
//                 <TrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">{pendingEvents}</div>
//                 <p className="text-xs text-muted-foreground mt-1">En revisión</p>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Main Content Tabs */}
//           <Tabs defaultValue="products" className="w-full">
//             <TabsList className="grid w-full max-w-md grid-cols-2">
//               <TabsTrigger value="products">Productos</TabsTrigger>
//               <TabsTrigger value="events">Eventos</TabsTrigger>
//             </TabsList>

//             <TabsContent value="products" className="space-y-6 mt-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h2 className="text-2xl font-bold">Mis Productos</h2>
//                   <p className="text-muted-foreground">Gestiona tu catálogo de productos</p>
//                 </div>
//                 <Button asChild>
//                   <Link href="/vendor/products/new">
//                     <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
//                     Agregar Producto
//                   </Link>
//                 </Button>
//               </div>

//               {products && products.length > 0 ? (
//                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//                   {products.map((product) => (
//                     <ProductCard key={product.id} product={product} isOwner />
//                   ))}
//                 </div>
//               ) : (
//                 <Card>
//                   <CardContent className="py-12 text-center">
//                     <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" aria-hidden="true" />
//                     <h3 className="text-lg font-semibold mb-2">No tienes productos registrados</h3>
//                     <p className="text-muted-foreground mb-4">Comienza agregando tus primeros productos</p>
//                     <Button asChild>
//                       <Link href="/vendor/products/new">
//                         <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
//                         Agregar Producto
//                       </Link>
//                     </Button>
//                   </CardContent>
//                 </Card>
//               )}
//             </TabsContent>

//             <TabsContent value="events" className="space-y-6 mt-6">
//               <div>
//                 <h2 className="text-2xl font-bold mb-2">Mis Eventos</h2>
//                 <p className="text-muted-foreground">Eventos donde participas como vendedor</p>
//               </div>

//               {upcomingEvents.length > 0 && (
//                 <div className="space-y-4">
//                   <h3 className="text-lg font-semibold">Próximos Eventos</h3>
//                   <div className="grid gap-4 md:grid-cols-2">
//                     {upcomingEvents.map((eventVendor) => (
//                       <VendorEventCard key={eventVendor.id} eventVendor={eventVendor} vendorId={vendor.id} />
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {pastEvents.length > 0 && (
//                 <div className="space-y-4">
//                   <h3 className="text-lg font-semibold">Eventos Pasados</h3>
//                   <div className="grid gap-4 md:grid-cols-2">
//                     {pastEvents.map((eventVendor) => (
//                       <VendorEventCard key={eventVendor.id} eventVendor={eventVendor} vendorId={vendor.id} isPast />
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {upcomingEvents.length === 0 && pastEvents.length === 0 && (
//                 <Card>
//                   <CardContent className="py-12 text-center">
//                     <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" aria-hidden="true" />
//                     <h3 className="text-lg font-semibold mb-2">No tienes eventos registrados</h3>
//                     <p className="text-muted-foreground">Los organizadores te agregarán a sus eventos</p>
//                   </CardContent>
//                 </Card>
//               )}
//             </TabsContent>
//           </Tabs>
//         </div>
//       </main>
//     </div>
//   )
// }
