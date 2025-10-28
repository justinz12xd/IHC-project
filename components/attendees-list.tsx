"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Search } from "lucide-react"
import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface AttendeesListProps {
  eventId: string
  registrations: any[]
}

export function AttendeesList({ eventId, registrations }: AttendeesListProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredRegistrations = registrations.filter((reg) => {
    const profile = reg.profiles
    if (!profile) return false

    const searchLower = searchTerm.toLowerCase()
    return profile.full_name?.toLowerCase().includes(searchLower) || profile.email?.toLowerCase().includes(searchLower)
  })

  const handleExport = () => {
    // Create CSV content
    const headers = ["Nombre", "Email", "Fecha de Registro"]
    const rows = registrations.map((reg) => [
      reg.profiles?.full_name || "N/A",
      reg.profiles?.email || "N/A",
      format(new Date(reg.created_at), "d/MM/yyyy HH:mm", { locale: es }),
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `asistentes-evento-${eventId}.csv`
    link.click()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Asistentes Registrados</CardTitle>
              <CardDescription>
                {registrations.length} persona{registrations.length !== 1 ? "s" : ""} registrada
                {registrations.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <Button onClick={handleExport} variant="outline">
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              Exportar CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {filteredRegistrations.length > 0 ? (
            <div className="space-y-2">
              {filteredRegistrations.map((registration) => {
                const profile = registration.profiles
                if (!profile) return null

                return (
                  <div key={registration.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{profile.full_name || "Sin nombre"}</p>
                      <p className="text-sm text-muted-foreground">{profile.email}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(registration.created_at), "d MMM yyyy", { locale: es })}
                    </p>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? "No se encontraron resultados" : "No hay asistentes registrados"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
