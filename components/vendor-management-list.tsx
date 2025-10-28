"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Check, X, Plus, Loader2 } from "lucide-react"

interface VendorManagementListProps {
  eventId: string
  eventVendors: any[]
  allVendors: any[]
}

export function VendorManagementList({ eventId, eventVendors, allVendors }: VendorManagementListProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [selectedVendor, setSelectedVendor] = useState<string>("")
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createBrowserClient()

  const handleStatusChange = async (eventVendorId: string, newStatus: "approved" | "rejected") => {
    setIsLoading(eventVendorId)

    try {
      const { error } = await supabase.from("event_vendors").update({ status: newStatus }).eq("id", eventVendorId)

      if (error) throw error

      toast({
        title: newStatus === "approved" ? "Vendedor aprobado" : "Vendedor rechazado",
        description: `El vendedor ha sido ${newStatus === "approved" ? "aprobado" : "rechazado"} exitosamente`,
      })

      router.refresh()
    } catch (error) {
      console.error("[v0] Error updating vendor status:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del vendedor",
        variant: "destructive",
      })
    } finally {
      setIsLoading(null)
    }
  }

  const handleAddVendor = async () => {
    if (!selectedVendor) return

    setIsLoading("adding")

    try {
      const { error } = await supabase.from("event_vendors").insert({
        event_id: eventId,
        vendor_id: selectedVendor,
        status: "pending",
      })

      if (error) throw error

      toast({
        title: "Vendedor agregado",
        description: "El vendedor se agregó al evento",
      })

      setSelectedVendor("")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error adding vendor:", error)
      toast({
        title: "Error",
        description: "No se pudo agregar el vendedor",
        variant: "destructive",
      })
    } finally {
      setIsLoading(null)
    }
  }

  const availableVendors = allVendors.filter((v) => !eventVendors.some((ev) => ev.vendors?.id === v.id))

  return (
    <div className="space-y-6">
      {/* Add Vendor */}
      <Card>
        <CardHeader>
          <CardTitle>Agregar Vendedor</CardTitle>
          <CardDescription>Invita vendedores a participar en tu evento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={selectedVendor} onValueChange={setSelectedVendor}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Selecciona un vendedor" />
              </SelectTrigger>
              <SelectContent>
                {availableVendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.business_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAddVendor} disabled={!selectedVendor || isLoading === "adding"}>
              {isLoading === "adding" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                  Agregar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vendors List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Vendedores del Evento</h3>

        {eventVendors.length > 0 ? (
          <div className="space-y-4">
            {eventVendors.map((eventVendor) => {
              const vendor = eventVendor.vendors
              if (!vendor) return null

              return (
                <Card key={eventVendor.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        {vendor.logo_url ? (
                          <img
                            src={vendor.logo_url || "/placeholder.svg"}
                            alt={vendor.business_name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                            <span className="text-lg font-bold">{vendor.business_name?.charAt(0).toUpperCase()}</span>
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-lg">{vendor.business_name}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 text-pretty">{vendor.description}</p>
                          <Badge variant="secondary" className="mt-2">
                            {eventVendor.status === "pending"
                              ? "Pendiente"
                              : eventVendor.status === "approved"
                                ? "Aprobado"
                                : "Rechazado"}
                          </Badge>
                        </div>
                      </div>

                      {eventVendor.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(eventVendor.id, "approved")}
                            disabled={isLoading === eventVendor.id}
                          >
                            <Check className="h-4 w-4" aria-hidden="true" />
                            <span className="sr-only">Aprobar</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(eventVendor.id, "rejected")}
                            disabled={isLoading === eventVendor.id}
                          >
                            <X className="h-4 w-4" aria-hidden="true" />
                            <span className="sr-only">Rechazar</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No hay vendedores agregados a este evento</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
