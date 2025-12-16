"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Briefcase, Camera, Upload } from "lucide-react"

export default function SetupVendorPage() {
  const [bio, setBio] = useState("")
  const [historia, setHistoria] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Validar tamaño (5MB máximo por archivo)
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name} supera el tamaño máximo de 5MB`)
        return false
      }
      return true
    })

    setImages(prev => [...prev, ...validFiles])
    
    // Crear previews
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const uploadImages = async (userId: string) => {
    if (images.length === 0) return []

    const uploadPromises = images.map(async (file, index) => {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}-${index}.${fileExt}`
      const filePath = `vendor-products/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath)

      return publicUrl
    })

    return Promise.all(uploadPromises)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validaciones
    if (bio.length < 50 || bio.length > 500) {
      setError("La biografía debe tener entre 50 y 500 caracteres")
      return
    }

    if (historia.length < 100 || historia.length > 1000) {
      setError("La historia del negocio debe tener entre 100 y 1000 caracteres")
      return
    }

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

      // Subir imágenes si hay
      let imageUrls: string[] = []
      try {
        imageUrls = await uploadImages(usuario.id_usuario)
      } catch (uploadError) {
        console.error("Error al subir imágenes:", uploadError)
        // Continuar sin imágenes si falla
      }

      // Crear perfil de vendedor
      const { error: vendorError } = await supabase.from("vendedor").insert({
        id_vendedor: usuario.id_usuario,
        bio: bio,
        historia: historia,
        foto_perfil: imageUrls[0] || null, // Primera imagen como foto de perfil
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
          <div className="flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary" />
            <CardTitle>Solicitud de Vendedor</CardTitle>
          </div>
          <CardDescription>
            Complete este formulario para convertirse en vendedor en nuestra plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Biografía */}
            <div className="space-y-2">
              <Label htmlFor="bio">
                Biografía <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="Cuéntanos sobre ti y tu experiencia..."
                required
                maxLength={500}
                className="resize-none"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <p>Mínimo 50 caracteres, máximo 500</p>
                <p className={bio.length > 500 ? "text-destructive" : ""}>
                  {bio.length}/500
                </p>
              </div>
            </div>

            {/* Historia del Negocio */}
            <div className="space-y-2">
              <Label htmlFor="historia">
                Historia del Negocio <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="historia"
                value={historia}
                onChange={(e) => setHistoria(e.target.value)}
                rows={6}
                placeholder="Describe la historia de tu negocio, productos que ofreces, tu misión..."
                required
                maxLength={1000}
                className="resize-none"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <p>Mínimo 100 caracteres, máximo 1000</p>
                <p className={historia.length > 1000 ? "text-destructive" : ""}>
                  {historia.length}/1000
                </p>
              </div>
            </div>

            {/* Fotos de Productos */}
            <div className="space-y-2">
              <Label htmlFor="images">Fotos de Productos</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  id="images"
                  multiple
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="images"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Camera className="w-12 h-12 text-muted-foreground" />
                  <p className="font-medium">Haz clic para subir imágenes</p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG hasta 5MB cada una
                  </p>
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                Puedes subir múltiples imágenes de tus productos
              </p>
              
              {/* Preview de imágenes */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Proceso de Aprobación */}
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Proceso de Aprobación</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Revisaremos tu solicitud en 24-48 horas</li>
                <li>• Te contactaremos por correo con el resultado</li>
                <li>• Una vez aprobado, podrás crear tu catálogo de productos</li>
              </ul>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-orange-600 hover:bg-orange-700" 
              disabled={loading}
              size="lg"
            >
              {loading ? "Enviando..." : "Enviar Solicitud"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
