"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
      vendor_id: vendorId,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      benefits: formData.get("benefits") as string,
      creation_story: formData.get("creation_story") as string,
      image_url: (formData.get("image_url") as string) || null,
    }

    try {
      if (product) {
        // Update existing product
        const { error } = await supabase.from("products").update(data).eq("id", product.id)

        if (error) throw error

        toast({
          title: "Producto actualizado",
          description: "Los cambios se guardaron correctamente",
        })
      } else {
        // Create new product
        const { error } = await supabase.from("products").insert(data)

        if (error) throw error

        toast({
          title: "Producto creado",
          description: "El producto se agregó exitosamente",
        })
      }

      router.push("/vendor/dashboard")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error saving product:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el producto",
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
          <CardDescription>Completa los detalles de tu producto para que los usuarios lo conozcan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre del Producto <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Ej: Miel de Abeja Orgánica"
              defaultValue={product?.name}
              required
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Descripción <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe tu producto de manera clara y atractiva"
              defaultValue={product?.description}
              required
              rows={4}
              maxLength={500}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">Máximo 500 caracteres</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="benefits">Beneficios</Label>
            <Input
              id="benefits"
              name="benefits"
              placeholder="Ej: Natural, Orgánico, Sin aditivos"
              defaultValue={product?.benefits}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">Separa los beneficios con comas</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="creation_story">Historia del Producto</Label>
            <Textarea
              id="creation_story"
              name="creation_story"
              placeholder="Cuenta la historia detrás de tu producto"
              defaultValue={product?.creation_story}
              rows={4}
              maxLength={500}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">Comparte el origen y motivación detrás de tu producto</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">URL de Imagen</Label>
            <Input
              id="image_url"
              name="image_url"
              type="url"
              placeholder="https://ejemplo.com/imagen.jpg"
              defaultValue={product?.image_url}
            />
            <p className="text-xs text-muted-foreground">Opcional: URL de una imagen de tu producto</p>
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
