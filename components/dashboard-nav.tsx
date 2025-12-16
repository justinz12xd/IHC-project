"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { createBrowserClient } from "@/lib/supabase/client"
import { User, LogOut, Settings } from "lucide-react"

interface DashboardNavProps {
  userRole: "normal" | "vendor" | "organizer" | "admin"
}

export function DashboardNav({ userRole }: DashboardNavProps) {
  const router = useRouter()
  const supabase = createBrowserClient()

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error al cerrar sesión:', error)
      }
      // Limpiar localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token')
        localStorage.removeItem('rememberedEmail')
      }
      // Redirigir y refrescar
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error('Error cerrando sesión:', error)
      // Incluso si hay error, redirigir al login
      router.push("/login")
      router.refresh()
    }
  }

  const getDashboardLink = () => {
    switch (userRole) {
      case "vendor":
        return "/vendor/dashboard"
      case "organizer":
        return "/organizer/dashboard"
      case "admin":
        return "/admin/dashboard"
      default:
        return "/dashboard"
    }
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href={getDashboardLink()} className="text-xl font-bold hover:text-primary transition-colors">
              AgroEventos
            </Link>

            {userRole === "normal" && (
              <div className="hidden md:flex items-center gap-4">
                <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                  Eventos
                </Link>
              </div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full" aria-label="Menú de usuario">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium leading-none">Mi Cuenta</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userRole === "normal"
                      ? "Usuario"
                      : userRole === "vendor"
                        ? "Vendedor"
                        : userRole === "organizer"
                          ? "Organizador"
                          : "Administrador"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
