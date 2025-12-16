"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@/lib/supabase/client"
import { CheckCircle2, Loader2, UserPlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface RegisterEventButtonProps {
  eventId: string
  isRegistered: boolean
  capacity: number | null
}

export function RegisterEventButton({ eventId, isRegistered: initialRegistered, capacity }: RegisterEventButtonProps) {
  const [isRegistered, setIsRegistered] = useState(initialRegistered)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createBrowserClient()

  const handleRegister = async () => {
    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Error",
          description: "Debes iniciar sesión para registrarte",
          variant: "destructive",
        })
        return
      }

      if (isRegistered) {
        // Unregister
        const { error } = await supabase
          .from("event_registrations")
          .delete()
          .eq("event_id", eventId)
          .eq("user_id", user.id)

        if (error) throw error

        setIsRegistered(false)
        toast({
          title: "Registro cancelado",
          description: "Te has dado de baja del evento exitosamente",
        })
      } else {
        // Check capacity if exists
        if (capacity) {
          const { count } = await supabase
            .from("event_registrations")
            .select("*", { count: "exact", head: true })
            .eq("event_id", eventId)

          if (count && count >= capacity) {
            toast({
              title: "Evento lleno",
              description: "Este evento ha alcanzado su capacidad máxima",
              variant: "destructive",
            })
            return
          }
        }

        // Register
        const { error } = await supabase.from("event_registrations").insert({
          event_id: eventId,
          user_id: user.id,
        })

        if (error) throw error

        setIsRegistered(true)
        toast({
          title: "Registro exitoso",
          description: "Te has registrado al evento correctamente",
        })
      }

      router.refresh()
    } catch (error) {
      console.error("[v0] Error registering:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al procesar tu registro",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isRegistered) {
    return (
      <Button
        onClick={handleRegister}
        disabled={isLoading}
        variant="outline"
        size="lg"
        className="min-w-[160px]"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            <span>Procesando...</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden="true" />
            <span>Ya Registrado</span>
          </>
        )}
      </Button>
    )
  }

  return (
    <Link href={`/events/${eventId}/registrar`}>
      <Button
        size="lg"
        className="min-w-[160px] bg-green-600 hover:bg-green-700"
      >
        <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
        <span>Registrarse</span>
      </Button>
    </Link>
  )
}
