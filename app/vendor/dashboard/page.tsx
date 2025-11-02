"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Package, Calendar, TrendingUp, Store, Users, DollarSign } from "lucide-react"
import Link from "next/link"

export default function VendorDashboardPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const supabase = createBrowserClient()
  
  const [vendorData, setVendorData] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    const loadVendorData = async () => {
      if (!user?.id) return

      try {
        console.log("🔑 Auth ID:", user.id)
        
        // Cargar datos del usuario desde la tabla usuario
        const { data: usuarioData, error: usuarioError } = await supabase
          .from('usuario')
          .select('*')
          .eq('auth_id', user.id)
          .maybeSingle()

        console.log("📋 Query usuario - Data:", usuarioData, "Error:", usuarioError)

        if (usuarioError) {
          console.error("❌ Error cargando usuario:", usuarioError)
          return
        }

        if (!usuarioData) {
          console.warn("⚠️ No se encontró usuario en la tabla")
          return
        }

        console.log("👤 Usuario data:", usuarioData)
        setUserData(usuarioData)
        
        // Cargar productos del vendedor
        console.log("🔍 Buscando productos con id_vendedor:", usuarioData.id_usuario)
        const { data: productosData, error: productosError } = await supabase
          .from('producto')
          .select('*')
          .eq('id_vendedor', usuarioData.id_usuario)

        console.log("📦 Productos encontrados:", productosData)
        console.log("❌ Error productos:", productosError)

        if (!productosError && productosData) {
          setProducts(productosData)
        } else if (productosError) {
          console.error("Error cargando productos:", productosError)
        }
        
        // Cargar datos del vendedor si existe
        const { data: vendedor, error: vendedorError } = await supabase
          .from('vendedor')
          .select('*')
          .eq('id_vendedor', usuarioData.id_usuario)
          .maybeSingle()

        if (!vendedorError && vendedor) {
          setVendorData(vendedor)
        }
      } catch (err) {
        console.error("Error loading vendor data:", err)
      } finally {
        setLoadingData(false)
      }
    }

    if (user) {
      loadVendorData()
    }
  }, [user, supabase])

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  // Datos calculados desde la BD
  const mockEvents: any[] = [] // TODO: cargar eventos reales
  
  const totalProducts = products.length
  const activeProducts = products.length // Todos activos por ahora
  const approvedEvents = mockEvents.filter((e: any) => e.status === "approved").length
  const pendingEvents = mockEvents.filter((e: any) => e.status === "pending").length
  const upcomingEvents = mockEvents.filter((e: any) => e.events && new Date(e.events.start_date) >= new Date())
  const pastEvents = mockEvents.filter((e: any) => e.events && new Date(e.events.start_date) < new Date())

  // Nombre del vendedor desde la tabla usuario
  const vendorName = userData 
    ? `${userData.nombre}${userData.apellido && userData.apellido !== '-' ? ` ${userData.apellido}` : ''}`
    : user.fullName || user.email

  const vendorBio = vendorData?.bio || "Vendedor de productos agro productivos"
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-linear-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <Store className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{vendorName}</h1>
              <p className="text-muted-foreground">{vendorBio}</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild>
              <Link href="/vendor/products/new">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Producto
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/vendor/profile">
                Ver Perfil Público
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeProducts}</div>
              <p className="text-xs text-muted-foreground">
                de {totalProducts} productos totales
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eventos Aprobados</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedEvents}</div>
              <p className="text-xs text-muted-foreground">
                {pendingEvents} pendientes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventas del Mes</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$1,234</div>
              <p className="text-xs text-muted-foreground">
                +12% vs mes anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45</div>
              <p className="text-xs text-muted-foreground">
                clientes únicos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">Productos</TabsTrigger>
            <TabsTrigger value="events">Eventos</TabsTrigger>
            <TabsTrigger value="analytics">Analíticas</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Mis Productos</h2>
              <Button asChild>
                <Link href="/vendor/products/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Producto
                </Link>
              </Button>
            </div>

            {products.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product: any) => (
                  <Card key={product.id_producto}>
                    <CardHeader>
                      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center mb-4">
                        <Package className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <CardTitle className="text-lg">{product.nombre}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {product.descripcion}
                      </p>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Stock:</span>
                          <span className="font-medium">{product.stock_inicial} unidades</span>
                        </div>
                        {product.categoria && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Categoría:</span>
                            <span className="font-medium capitalize">{product.categoria}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold">
                          S/ {product.precio_unitario.toFixed(2)}
                        </span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Editar
                          </Button>
                          <Button size="sm">
                            Ver
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tienes productos</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Comienza agregando productos a tu catálogo
                  </p>
                  <Button asChild>
                    <Link href="/vendor/products/new">
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Primer Producto
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <h2 className="text-2xl font-bold">Mis Eventos</h2>
            
            <Tabs defaultValue="upcoming" className="space-y-4">
              <TabsList>
                <TabsTrigger value="upcoming">Próximos</TabsTrigger>
                <TabsTrigger value="past">Anteriores</TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming">
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingEvents.map((eventVendor) => (
                      <Card key={eventVendor.id}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {eventVendor.events.title}
                              </h3>
                              <p className="text-muted-foreground">
                                {eventVendor.events.location}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(eventVendor.events.start_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                eventVendor.status === "approved" 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-yellow-100 text-yellow-800"
                              }`}>
                                {eventVendor.status === "approved" ? "Aprobado" : "Pendiente"}
                              </span>
                              <Button size="sm" variant="outline">
                                Ver Detalles
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No tienes eventos próximos
                      </h3>
                      <p className="text-muted-foreground">
                        Busca eventos para aplicar como vendedor
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="past">
                {pastEvents.length > 0 ? (
                  <div className="space-y-4">
                    {pastEvents.map((eventVendor) => (
                      <Card key={eventVendor.id}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {eventVendor.events.title}
                              </h3>
                              <p className="text-muted-foreground">
                                {eventVendor.events.location}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(eventVendor.events.start_date).toLocaleDateString()}
                              </p>
                            </div>
                            <Button size="sm" variant="outline">
                              Ver Reporte
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No tienes eventos anteriores
                      </h3>
                      <p className="text-muted-foreground">
                        Los eventos completados aparecerán aquí
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">Analíticas</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Ventas por Mes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
                    <TrendingUp className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <p className="text-center text-muted-foreground mt-4">
                    Gráfico de ventas (próximamente)
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Productos Más Vendidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Tomates Orgánicos</span>
                      <span className="font-semibold">45 vendidos</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Lechuga Hidropónica</span>
                      <span className="font-semibold">32 vendidos</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}