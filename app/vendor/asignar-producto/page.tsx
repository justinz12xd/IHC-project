"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, AlertCircle } from "lucide-react"

interface Producto {
  id_producto: string
  nombre: string
  precio_unitario: number
  stock_inicial: number
}

interface Evento {
  id_evento: string
  nombre: string
  fecha_inicio: string
  fecha_fin: string
}

export default function AsignarProductoEventoPage() {
  const [productoId, setProductoId] = useState("")
  const [eventoId, setEventoId] = useState("")
  const [precioEvento, setPrecioEvento] = useState("")
  const [cantidadDisponible, setCantidadDisponible] = useState("")
  const [productos, setProductos] = useState<Producto[]>([])
  const [eventos, setEventos] = useState<Evento[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [vendedorId, setVendedorId] = useState<string | null>(null)
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)
  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  useEffect(() => {
    if (productoId && productos.length > 0) {
      const producto = productos.find(p => p.id_producto === productoId)
      setProductoSeleccionado(producto || null)
      if (producto && !precioEvento) {
        setPrecioEvento(producto.precio_unitario.toString())
      }
    }
  }, [productoId, productos])

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      // Obtener el id del vendedor
      const { data: usuario, error: usuarioError } = await supabase
        .from("usuario")
        .select("id_usuario, rol")
        .eq("auth_id", user.id)
        .single()

      if (usuarioError || !usuario) {
        setError("Usuario no encontrado")
        return
      }

      if (usuario.rol !== "VENDEDOR") {
        setError("Solo los vendedores pueden asignar productos a eventos")
        return
      }

      setVendedorId(usuario.id_usuario)

      // Cargar productos del vendedor
      const { data: productosData, error: productosError } = await supabase
        .from("producto")
        .select("id_producto, nombre, precio_unitario, stock_inicial")
        .eq("id_vendedor", usuario.id_usuario)
        .eq("activo", true)
        .order("nombre")

      if (productosError) {
        console.error("Error al cargar productos:", productosError)
        setError("Error al cargar tus productos")
      } else {
        setProductos(productosData || [])
      }

      // Cargar eventos en los que está aprobado
      const { data: eventosData, error: eventosError } = await supabase
        .from("participacion_vendedor")
        .select(`
          id_evento,
          evento:id_evento(
            id_evento,
            nombre,
            fecha_inicio,
            fecha_fin,
            estado
          )
        `)
        .eq("id_vendedor", usuario.id_usuario)
        .eq("estado_aprobacion", "APROBADO")

      if (eventosError) {
        console.error("Error al cargar eventos:", eventosError)
        setError("Error al cargar eventos disponibles")
      } else {
        const eventosAprobados = eventosData
          ?.map((item: any) => item.evento)
          .filter((evento: any) => evento && evento.estado === "APROBADO")
          .filter((evento: any) => new Date(evento.fecha_inicio) >= new Date())
        setEventos(eventosAprobados || [])
      }
    } catch (err: any) {
      console.error("Error:", err)
      setError(err.message || "Error al cargar datos")
    } finally {
      setLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!productoId) {
      setError("Debes seleccionar un producto")
      return
    }

    if (!eventoId) {
      setError("Debes seleccionar un evento")
      return
    }

    const precio = parseFloat(precioEvento)
    if (isNaN(precio) || precio < 0) {
      setError("El precio debe ser un número válido mayor o igual a 0")
      return
    }

    const cantidad = parseInt(cantidadDisponible)
    if (isNaN(cantidad) || cantidad <= 0) {
      setError("La cantidad debe ser un número mayor a 0")
      return
    }

    if (productoSeleccionado && cantidad > productoSeleccionado.stock_inicial) {
      setError(`No tienes suficiente stock. Disponible: ${productoSeleccionado.stock_inicial} unidades`)
      return
    }

    if (!vendedorId) {
      setError("No se pudo identificar tu perfil de vendedor")
      return
    }

    setLoading(true)

    try {
      // Verificar si ya existe una asignación
      const { data: existente, error: existenteError } = await supabase
        .from("inventario_evento")
        .select("id_inventario")
        .eq("id_producto", productoId)
        .eq("id_evento", eventoId)
        .single()

      if (existente) {
        setError("Este producto ya está asignado a este evento")
        setLoading(false)
        return
      }

      // Crear asignación de inventario
      const { error: insertError } = await supabase
        .from("inventario_evento")
        .insert({
          id_producto: productoId,
          id_evento: eventoId,
          id_vendedor: vendedorId,
          precio_evento: precio,
          cantidad_disponible: cantidad,
          cantidad_vendida: 0,
          activo: true,
        })

      if (insertError) throw insertError

      // Redirigir con mensaje de éxito
      router.push("/vendor/dashboard?inventario=asignado")
      router.refresh()
    } catch (err: any) {
      console.error("Error al asignar producto:", err)
      setError(err.message || "Error al asignar producto al evento")
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando datos...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-primary" />
            <CardTitle>Asignar Producto a Evento</CardTitle>
          </div>
          <CardDescription>
            Selecciona qué productos venderás en un evento específico.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Seleccionar Producto */}
            <div className="space-y-2">
              <Label htmlFor="producto">
                Seleccionar Producto <span className="text-destructive">*</span>
              </Label>
              <Select value={productoId} onValueChange={setProductoId}>
                <SelectTrigger id="producto">
                  <SelectValue placeholder="Elige un producto de tu catálogo" />
                </SelectTrigger>
                <SelectContent>
                  {productos.length === 0 ? (
                    <SelectItem value="no-products" disabled>
                      No tienes productos registrados
                    </SelectItem>
                  ) : (
                    productos.map((producto) => (
                      <SelectItem key={producto.id_producto} value={producto.id_producto}>
                        {producto.nombre} - ${producto.precio_unitario} (Stock: {producto.stock_inicial})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Seleccionar Evento */}
            <div className="space-y-2">
              <Label htmlFor="evento">
                Seleccionar Evento <span className="text-destructive">*</span>
              </Label>
              <Select value={eventoId} onValueChange={setEventoId}>
                <SelectTrigger id="evento">
                  <SelectValue placeholder="Elige un evento aprobado" />
                </SelectTrigger>
                <SelectContent>
                  {eventos.length === 0 ? (
                    <SelectItem value="no-events" disabled>
                      No tienes eventos aprobados
                    </SelectItem>
                  ) : (
                    eventos.map((evento) => (
                      <SelectItem key={evento.id_evento} value={evento.id_evento}>
                        {evento.nombre} - {new Date(evento.fecha_inicio).toLocaleDateString()}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Precio en el Evento */}
            <div className="space-y-2">
              <Label htmlFor="precio">
                Precio en el Evento <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="precio"
                  type="number"
                  step="0.01"
                  min="0"
                  value={precioEvento}
                  onChange={(e) => setPrecioEvento(e.target.value)}
                  placeholder="0.00"
                  className="pl-7"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Puede ser diferente al precio base
              </p>
            </div>

            {/* Cantidad Disponible */}
            <div className="space-y-2">
              <Label htmlFor="cantidad">
                Cantidad Disponible <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cantidad"
                type="number"
                min="1"
                value={cantidadDisponible}
                onChange={(e) => setCantidadDisponible(e.target.value)}
                placeholder="0"
                required
              />
              <p className="text-xs text-muted-foreground">
                Unidades para este evento
                {productoSeleccionado && ` (Disponibles: ${productoSeleccionado.stock_inicial})`}
              </p>
            </div>

            {/* Nota de Advertencia */}
            <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <strong>Nota:</strong> La cantidad asignada se descontará de tu inventario general. 
                Asegúrate de tener suficiente stock disponible.
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !productoId || !eventoId || productos.length === 0 || eventos.length === 0}
              size="lg"
            >
              {loading ? "Asignando..." : "Asignar al Evento"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
