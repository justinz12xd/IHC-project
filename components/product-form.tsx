"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface ProductFormProps {
  vendorId: string
  product?: any
}

export function ProductForm({ vendorId, product }: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createBrowserClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      id_vendedor: vendorId,
      nombre: formData.get("nombre") as string,
      descripcion: formData.get("descripcion") as string,
      precio_unitario: parseFloat(formData.get("precio_unitario") as string) || 0,
      stock_inicial: parseInt(formData.get("stock_inicial") as string) || 0,
      categoria: formData.get("categoria") as string || null,
    }

    try {
      if (product) {
        // Update existing product
        const { error } = await supabase
          .from("producto")
          .update(data)
          .eq("id_producto", product.id_producto)

        if (error) throw error

        toast({
          title: "Producto actualizado",
          description: "Los cambios se guardaron correctamente",
        })
      } else {
        // Create new product
        const { error } = await supabase
          .from("producto")
          .insert(data)

        if (error) throw error

        toast({
          title: "Producto creado",
          description: "El producto se agregó exitosamente",
        })
      }

      router.push("/vendor/dashboard")
      router.refresh()
    } catch (error: any) {
      console.error("Error saving product:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el producto",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Información del Producto</CardTitle>
          <CardDescription>Completa los detalles de tu producto para agregarlo al inventario</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nombre">
              Nombre del Producto <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nombre"
              name="nombre"
              placeholder="Ej: Miel de Abeja Orgánica"
              defaultValue={product?.nombre}
              required
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">
              Descripción <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="descripcion"
              name="descripcion"
              placeholder="Describe tu producto de manera clara y atractiva"
              defaultValue={product?.descripcion}
              required
              rows={4}
              maxLength={500}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">Máximo 500 caracteres</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="precio_unitario">
                Precio Unitario (S/) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="precio_unitario"
                name="precio_unitario"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                defaultValue={product?.precio_unitario}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock_inicial">
                Stock Inicial <span className="text-destructive">*</span>
              </Label>
              <Input
                id="stock_inicial"
                name="stock_inicial"
                type="number"
                min="0"
                placeholder="0"
                defaultValue={product?.stock_inicial}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">Categoría</Label>
            <Select name="categoria" defaultValue={product?.categoria || ""}>
              <SelectTrigger id="categoria">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin categoría</SelectItem>
                <SelectItem value="frutas">Frutas</SelectItem>
                <SelectItem value="verduras">Verduras</SelectItem>
                <SelectItem value="lacteos">Lácteos</SelectItem>
                <SelectItem value="carnes">Carnes</SelectItem>
                <SelectItem value="granos">Granos y Cereales</SelectItem>
                <SelectItem value="miel">Miel y Derivados</SelectItem>
                <SelectItem value="artesania">Artesanía</SelectItem>
                <SelectItem value="bebidas">Bebidas</SelectItem>
                <SelectItem value="otros">Otros</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Opcional: ayuda a los clientes a encontrar tu producto</p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>{product ? "Actualizar" : "Crear"} Producto</span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
