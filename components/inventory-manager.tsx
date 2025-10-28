"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save } from "lucide-react"

interface InventoryManagerProps {
  eventId: string
  vendorId: string
  products: any[]
  existingInventory: any[]
}

export function InventoryManager({ eventId, vendorId, products, existingInventory }: InventoryManagerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createBrowserClient()

  const [inventory, setInventory] = useState<Record<string, { quantity: number; price: number }>>(
    existingInventory.reduce(
      (acc, item) => {
        acc[item.product_id] = {
          quantity: item.initial_quantity,
          price: item.price,
        }
        return acc
      },
      {} as Record<string, { quantity: number; price: number }>,
    ),
  )

  const handleQuantityChange = (productId: string, quantity: number) => {
    setInventory((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        quantity: Math.max(0, quantity),
      },
    }))
  }

  const handlePriceChange = (productId: string, price: number) => {
    setInventory((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        price: Math.max(0, price),
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Delete existing inventory
      await supabase.from("inventory").delete().eq("event_id", eventId).eq("vendor_id", vendorId)

      // Insert new inventory
      const inventoryData = Object.entries(inventory)
        .filter(([_, data]) => data.quantity > 0 && data.price > 0)
        .map(([productId, data]) => ({
          event_id: eventId,
          vendor_id: vendorId,
          product_id: productId,
          initial_quantity: data.quantity,
          current_quantity: data.quantity,
          price: data.price,
        }))

      if (inventoryData.length > 0) {
        const { error } = await supabase.from("inventory").insert(inventoryData)

        if (error) throw error
      }

      toast({
        title: "Inventario guardado",
        description: "El inventario se actualizó correctamente",
      })

      router.push("/vendor/dashboard")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error saving inventory:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el inventario",
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
          <CardTitle>Productos y Precios</CardTitle>
          <CardDescription>Define la cantidad y precio de cada producto para este evento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {products.length > 0 ? (
            <>
              {products.map((product) => (
                <div key={product.id} className="p-4 border rounded-lg space-y-4">
                  <h3 className="font-semibold text-lg">{product.name}</h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`quantity-${product.id}`}>Cantidad Inicial</Label>
                      <Input
                        id={`quantity-${product.id}`}
                        type="number"
                        min="0"
                        step="1"
                        value={inventory[product.id]?.quantity || 0}
                        onChange={(e) => handleQuantityChange(product.id, Number.parseInt(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`price-${product.id}`}>Precio (USD)</Label>
                      <Input
                        id={`price-${product.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={inventory[product.id]?.price || 0}
                        onChange={(e) => handlePriceChange(product.id, Number.parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              ))}

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
                    <>
                      <Save className="mr-2 h-4 w-4" aria-hidden="true" />
                      <span>Guardar Inventario</span>
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No tienes productos registrados. Agrega productos primero.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </form>
  )
}
