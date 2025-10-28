"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Home, Calendar, Store, Users, LogIn, UserPlus, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const mainRoutes = [
  {
    title: "Inicio",
    href: "/",
    icon: Home,
    description: "Página principal"
  },
  {
    title: "Eventos",
    href: "/dashboard",
    icon: Calendar,
    description: "Ver todos los eventos"
  },
  {
    title: "Vendedores",
    href: "/vendor/dashboard",
    icon: Store,
    description: "Catálogo de vendedores"
  },
  {
    title: "Organizadores",
    href: "/organizer/dashboard",
    icon: Users,
    description: "Panel de organizadores"
  }
]

const authRoutes = [
  {
    title: "Iniciar Sesión",
    href: "/login",
    icon: LogIn,
    variant: "outline" as const
  },
  {
    title: "Registrarse",
    href: "/register",
    icon: UserPlus,
    variant: "default" as const
  }
]

const devRoutes = [
  {
    title: "Panel Dev",
    href: "/temp-home",
    icon: Settings,
    description: "Acceso de desarrollo"
  },
  {
    title: "Admin",
    href: "/admin/dashboard",
    icon: Settings,
    description: "Panel de administración"
  }
]

export function MainNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {/* Rutas principales */}
      {mainRoutes.map((route) => {
        const Icon = route.icon
        const isActive = pathname === route.href
        
        return (
          <Link
            key={route.href}
            href={route.href}
            onClick={() => mobile && setIsOpen(false)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              mobile ? "w-full justify-start" : "",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{route.title}</span>
          </Link>
        )
      })}
      
      {/* Separador en versión móvil */}
      {mobile && <div className="border-t my-4" />}
      
      {/* Rutas de desarrollo */}
      {devRoutes.map((route) => {
        const Icon = route.icon
        const isActive = pathname === route.href
        
        return (
          <Link
            key={route.href}
            href={route.href}
            onClick={() => mobile && setIsOpen(false)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              mobile ? "w-full justify-start" : "",
              isActive
                ? "bg-orange-500/10 text-orange-600"
                : "text-orange-500/70 hover:text-orange-600 hover:bg-orange-500/5"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{route.title}</span>
          </Link>
        )
      })}
    </>
  )

  const AuthButtons = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={cn("flex gap-2", mobile ? "flex-col w-full" : "")}>
      {authRoutes.map((route) => {
        const Icon = route.icon
        
        return (
          <Button
            key={route.href}
            asChild
            variant={route.variant}
            size={mobile ? "default" : "sm"}
            className={mobile ? "w-full justify-start" : ""}
          >
            <Link
              href={route.href}
              onClick={() => mobile && setIsOpen(false)}
            >
              <Icon className="h-4 w-4 mr-2" />
              {route.title}
            </Link>
          </Button>
        )
      })}
    </div>
  )

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg hidden sm:inline-block">
              Eventos Agro
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLinks />
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex">
            <AuthButtons />
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col space-y-4 mt-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="font-bold text-lg">Eventos Agro</span>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <NavLinks mobile />
                </div>
                
                <div className="border-t pt-4">
                  <AuthButtons mobile />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Breadcrumb opcional para contexto */}
      <div className="border-t bg-muted/30 py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <span>🚧 Modo de desarrollo - Sin autenticación activa</span>
          </div>
        </div>
      </div>
    </nav>
  )
}