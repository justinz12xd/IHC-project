"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingCart, MessageSquare, Calendar, Plus, Minus, Send, Paperclip } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface Producto {
  id_producto: string
  nombre: string
  descripcion: string
  precio: number
  stock: number
  id_vendedor: string
}

function EventManagementForm() {
  const [idEvento, setIdEvento] = useState("")
  const [estadoEvento, setEstadoEvento] = useState("")
  const [motivo, setMotivo] = useState("")
  const [capacidad, setCapacidad] = useState("")
  const [lugar, setLugar] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createBrowserClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!idEvento || !estadoEvento || !capacidad || !lugar) {
      toast({
        title: "Campos incompletos",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast({
          title: "Sesión requerida",
          description: "Debes iniciar sesión como administrador",
          variant: "destructive"
        })
        return
      }

      // Verificar que el usuario es admin
      const { data: usuario } = await supabase
        .from('usuario')
        .select('rol')
        .eq('auth_id', user.id)
        .single()

      if (!usuario || usuario.rol !== 'ADMIN') {
        toast({
          title: "Acceso denegado",
          description: "Solo los administradores pueden gestionar eventos",
          variant: "destructive"
        })
        return
      }

      // Actualizar evento
      const { error } = await supabase
        .from('evento')
        .update({
          estado: estadoEvento,
          capacidad: parseInt(capacidad),
          lugar: lugar
        })
        .eq('id_evento', idEvento)

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error("Evento no encontrado")
        }
        throw error
      }

      toast({
        title: "¡Cambios guardados!",
        description: `El evento ha sido actualizado correctamente`,
      })

      // Reset form
      setIdEvento("")
      setEstadoEvento("")
      setMotivo("")
      setCapacidad("")
      setLugar("")

    } catch (err: any) {
      console.error("Error actualizando evento:", err)
      toast({
        title: "Error",
        description: err.message || "No se pudo actualizar el evento",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="id-evento" className="text-base font-medium">
          ID del Evento <span className="text-red-500">*</span>
        </Label>
        <Input
          id="id-evento"
          type="text"
          placeholder="Ej: EVT-2024-001"
          value={idEvento}
          onChange={(e) => setIdEvento(e.target.value)}
          required
          className="h-12"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="estado" className="text-base font-medium">
          Cambiar Estado <span className="text-red-500">*</span>
        </Label>
        <Select value={estadoEvento} onValueChange={setEstadoEvento}>
          <SelectTrigger id="estado" className="w-full h-12">
            <SelectValue placeholder="-- Selecciona un estado --" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDIENTE">Pendiente</SelectItem>
            <SelectItem value="APROBADO">Aprobado</SelectItem>
            <SelectItem value="RECHAZADO">Rechazado</SelectItem>
            <SelectItem value="FINALIZADO">Finalizado</SelectItem>
            <SelectItem value="ACTIVO">Activo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="motivo" className="text-base font-medium">
          Motivo (Opcional)
        </Label>
        <Textarea
          id="motivo"
          placeholder="Describe el motivo del cambio de estado..."
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          className="min-h-[120px] resize-none"
          maxLength={500}
        />
        <p className="text-sm text-muted-foreground text-right">
          {motivo.length}/500 caracteres
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="capacidad" className="text-base font-medium">
          Capacidad <span className="text-red-500">*</span>
        </Label>
        <Input
          id="capacidad"
          type="number"
          placeholder="Ej: 500"
          value={capacidad}
          onChange={(e) => setCapacidad(e.target.value)}
          required
          min="1"
          className="h-12"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lugar" className="text-base font-medium">
          Lugar <span className="text-red-500">*</span>
        </Label>
        <Input
          id="lugar"
          type="text"
          placeholder="Ej: Estadio Nacional"
          value={lugar}
          onChange={(e) => setLugar(e.target.value)}
          required
          className="h-12"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 text-lg font-semibold bg-orange-600 hover:bg-orange-700"
      >
        <Calendar className="w-5 h-5 mr-2" />
        {loading ? "Guardando..." : "Guardar Cambios"}
      </Button>
    </form>
  )
}

function ContactForm() {
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [mensaje, setMensaje] = useState("")
  const [adjuntos, setAdjuntos] = useState<FileList | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createBrowserClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nombre || !email || !mensaje) {
      toast({
        title: "Campos incompletos",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      })
      return
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast({
        title: "Email inválido",
        description: "Por favor ingresa un email válido",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Crear registro de contacto (necesitarías una tabla para esto)
      // Por ahora solo mostramos mensaje de éxito
      
      toast({
        title: "¡Mensaje enviado!",
        description: "Te responderemos pronto. Gracias por contactarnos.",
      })

      // Reset form
      setNombre("")
      setEmail("")
      setMensaje("")
      setAdjuntos(null)
      
      // Reset file input
      const fileInput = document.getElementById('adjuntos') as HTMLInputElement
      if (fileInput) fileInput.value = ""

    } catch (err: any) {
      console.error("Error enviando mensaje:", err)
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje. Intenta nuevamente.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="nombre" className="text-base font-medium">
          Nombre Completo <span className="text-red-500">*</span>
        </Label>
        <Input
          id="nombre"
          type="text"
          placeholder="Ej: Juan Pérez"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          className="h-12"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-base font-medium">
          Email <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-12"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="mensaje" className="text-base font-medium">
          Mensaje <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="mensaje"
          placeholder="Escribe tu mensaje o consulta aquí..."
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          required
          className="min-h-[150px] resize-none"
          maxLength={1000}
        />
        <p className="text-sm text-muted-foreground text-right">
          {mensaje.length}/1000 caracteres
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="adjuntos" className="text-base font-medium">
          Adjuntos (Opcional)
        </Label>
        <div className="relative">
          <Input
            id="adjuntos"
            type="file"
            multiple
            onChange={(e) => setAdjuntos(e.target.files)}
            className="h-12 cursor-pointer"
            accept="image/*,.pdf,.doc,.docx"
          />
          <Paperclip className="absolute right-3 top-3 h-5 w-5 text-muted-foreground pointer-events-none" />
        </div>
        <p className="text-xs text-muted-foreground">
          Archivos permitidos: imágenes, PDF, Word (máx. 5MB)
        </p>
        {adjuntos && adjuntos.length > 0 && (
          <p className="text-sm text-green-600">
            {adjuntos.length} archivo(s) seleccionado(s)
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 text-lg font-semibold bg-green-600 hover:bg-green-700"
      >
        <Send className="w-5 h-5 mr-2" />
        {loading ? "Enviando..." : "Enviar Mensaje"}
      </Button>
    </form>
  )
}

export default function ShopPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [selectedProducto, setSelectedProducto] = useState<string>("")
  const [cantidad, setCantidad] = useState(1)
  const [metodoPago, setMetodoPago] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    loadProductos()
  }, [])

  const loadProductos = async () => {
    try {
      const { data, error } = await supabase
        .from('producto')
        .select('*')
        .eq('activo', true)
        .gt('stock', 0)
        .order('nombre')

      if (error) throw error
      setProductos(data || [])
    } catch (err) {
      console.error("Error cargando productos:", err)
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive"
      })
    }
  }

  const productoSeleccionado = productos.find(p => p.id_producto === selectedProducto)
  const precioTotal = productoSeleccionado ? productoSeleccionado.precio * cantidad : 0
  const stockDisponible = productoSeleccionado?.stock || 0

  const handleCantidadChange = (incremento: number) => {
    const nuevaCantidad = cantidad + incremento
    if (nuevaCantidad >= 1 && nuevaCantidad <= stockDisponible) {
      setCantidad(nuevaCantidad)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedProducto || !metodoPago) {
      toast({
        title: "Campos incompletos",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      })
      return
    }

    if (cantidad > stockDisponible) {
      toast({
        title: "Stock insuficiente",
        description: `Solo hay ${stockDisponible} unidades disponibles`,
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast({
          title: "Sesión requerida",
          description: "Debes iniciar sesión para realizar una compra",
          variant: "destructive"
        })
        router.push('/login')
        return
      }

      // Obtener id_usuario
      const { data: usuario } = await supabase
        .from('usuario')
        .select('id_usuario')
        .eq('auth_id', user.id)
        .single()

      if (!usuario) throw new Error("Usuario no encontrado")

      // Crear compra (necesitarías una tabla de compras/pedidos)
      // Por ahora solo mostramos un mensaje de éxito
      
      // Actualizar stock
      const { error: stockError } = await supabase
        .from('producto')
        .update({ stock: stockDisponible - cantidad })
        .eq('id_producto', selectedProducto)

      if (stockError) throw stockError

      toast({
        title: "¡Compra procesada!",
        description: `Has comprado ${cantidad} unidad(es) de ${productoSeleccionado?.nombre}`,
      })

      // Reset form
      setSelectedProducto("")
      setCantidad(1)
      setMetodoPago("")
      loadProductos() // Recargar para actualizar stock

    } catch (err: any) {
      console.error("Error procesando compra:", err)
      toast({
        title: "Error",
        description: err.message || "No se pudo procesar la compra",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Sistema de Gestión de Eventos
          </h1>
        </div>

        <Tabs defaultValue="compra" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-white">
            <TabsTrigger 
              value="compra" 
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Compra/Consumo
            </TabsTrigger>
            <TabsTrigger 
              value="contacto"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Contacto/Soporte
            </TabsTrigger>
            <TabsTrigger 
              value="gestion"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Gestión de Eventos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compra">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Formulario de Compra / Consumo
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="producto" className="text-base font-medium">
                      Seleccionar Producto <span className="text-red-500">*</span>
                    </Label>
                    <Select value={selectedProducto} onValueChange={setSelectedProducto}>
                      <SelectTrigger id="producto" className="w-full">
                        <SelectValue placeholder="-- Selecciona un producto --" />
                      </SelectTrigger>
                      <SelectContent>
                        {productos.length === 0 ? (
                          <div className="p-4 text-center text-muted-foreground">
                            No hay productos disponibles
                          </div>
                        ) : (
                          productos.map((producto) => (
                            <SelectItem key={producto.id_producto} value={producto.id_producto}>
                              {producto.nombre} - ${producto.precio.toFixed(2)} (Stock: {producto.stock})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cantidad" className="text-base font-medium">
                      Cantidad <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleCantidadChange(-1)}
                        disabled={cantidad <= 1 || !selectedProducto}
                        className="h-10 w-10"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <input
                        id="cantidad"
                        type="number"
                        value={cantidad}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1
                          if (val >= 1 && val <= stockDisponible) {
                            setCantidad(val)
                          }
                        }}
                        className="w-20 text-center border rounded-md py-2 text-lg font-semibold"
                        min="1"
                        max={stockDisponible}
                        disabled={!selectedProducto}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleCantidadChange(1)}
                        disabled={cantidad >= stockDisponible || !selectedProducto}
                        className="h-10 w-10"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      {selectedProducto && (
                        <span className="text-sm text-muted-foreground ml-2">
                          Máx: {stockDisponible}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metodo-pago" className="text-base font-medium">
                      Método de Pago <span className="text-red-500">*</span>
                    </Label>
                    <Select value={metodoPago} onValueChange={setMetodoPago}>
                      <SelectTrigger id="metodo-pago" className="w-full">
                        <SelectValue placeholder="-- Selecciona método de pago --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="efectivo">Efectivo</SelectItem>
                        <SelectItem value="tarjeta">Tarjeta de Crédito/Débito</SelectItem>
                        <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="mercadopago">Mercado Pago</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-indigo-200">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-medium text-gray-700">Total a Pagar:</span>
                      <span className="text-3xl font-bold text-indigo-600">
                        ${precioTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !selectedProducto || !metodoPago}
                    className="w-full h-12 text-lg font-semibold bg-indigo-600 hover:bg-indigo-700"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {loading ? "Procesando..." : "Procesar Compra"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacto">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Formulario de Contacto / Soporte
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ContactForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gestion">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Gestión de Eventos (Admin)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <EventManagementForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
