"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SetupVendorPage() {
  const [businessName, setBusinessName] = useState("")
  const [description, setDescription] = useState("")
  const [history, setHistory] = useState("")
  const [objectives, setObjectives] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push("/login")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("No autenticado")

      const { error: vendorError } = await supabase.from("vendors").insert({
        user_id: user.id,
        business_name: businessName,
        description,
        history,
        objectives,
      })

      if (vendorError) throw vendorError

      router.push("/dashboard/vendor")
    } catch (err: any) {
      setError(err.message || "Error al crear perfil de vendedor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Configura tu Perfil de Vendedor</CardTitle>
          <CardDescription>Completa la información de tu negocio para comenzar a vender en eventos</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="businessName">Nombre del Negocio</Label>
              <Input
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe tu negocio y lo que ofreces"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="history">Historia</Label>
              <Textarea
                id="history"
                value={history}
                onChange={(e) => setHistory(e.target.value)}
                rows={3}
                placeholder="Cuenta la historia detrás de tu negocio"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="objectives">Objetivos</Label>
              <Textarea
                id="objectives"
                value={objectives}
                onChange={(e) => setObjectives(e.target.value)}
                rows={3}
                placeholder="¿Cuáles son tus objetivos al participar en eventos?"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Guardando..." : "Completar Configuración"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
