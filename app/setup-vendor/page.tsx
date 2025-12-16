"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FormProgress } from "@/components/form-progress"

export default function SetupVendorPage() {
  const [bio, setBio] = useState("")
  const [historia, setHistoria] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient()

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

      // Primero obtener el id_usuario de la tabla usuario
      const { data: usuario, error: usuarioError } = await supabase
        .from("usuario")
        .select("id_usuario")
        .eq("auth_id", user.id)
        .single()

      if (usuarioError || !usuario) {
        throw new Error("Usuario no encontrado en la base de datos")
      }

      // Crear perfil de vendedor
      const { error: vendorError } = await supabase.from("vendedor").insert({
        id_vendedor: usuario.id_usuario,
        bio: bio,
        historia: historia,
        foto_perfil: null,
        nivel_confianza: 0.0,
      })

      if (vendorError) throw vendorError

      router.push("/vendor/dashboard")
      router.refresh()
    } catch (err: any) {
      console.error("Error al crear perfil:", err)
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

            <FormProgress
              fields={[
                { name: 'bio', value: bio, required: true, label: 'Biografía' },
                { name: 'historia', value: historia, required: false, label: 'Historia' },
              ]}
            />

            <div className="space-y-2">
              <Label htmlFor="bio">Descripción</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="VENDO COSAS"
                required
              />
              <p className="text-xs text-muted-foreground">
                Describe brevemente tu negocio y lo que ofreces
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="historia">Historia</Label>
              <Textarea
                id="historia"
                value={historia}
                onChange={(e) => setHistoria(e.target.value)}
                rows={4}
                placeholder="HASODAKSDJAOSJDAS"
                required
              />
              <p className="text-xs text-muted-foreground">
                Cuenta la historia de tu negocio, cómo empezó y qué te motiva
              </p>
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
