"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Menu, Home, Calendar, Store, Users, LogIn, UserPlus, Settings, LogOut, User as UserIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { getAuthState, getAuthStateAsync, logoutUser, type User } from "@/lib/auth/supabase-auth"
import { CommandPalette } from "@/components/command-palette"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { useLanguage } from "@/lib/i18n/language-context"

export function MainNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [, setLanguageUpdate] = useState(0) // Para forzar re-render cuando cambia idioma
  const pathname = usePathname()
  const router = useRouter()
  const { t, language } = useLanguage()

  // Definir rutas con traducciones
  const getMainRoutes = () => {
    const routes = [
      {
        title: t("nav.home"),
        href: "/",
        icon: Home,
        description: t("nav.home")
      },
      {
        title: t("nav.events"),
        href: "/dashboard",
        icon: Calendar,
        description: t("nav.events")
      }
    ]

    // Agregar ruta específica según el rol del usuario
    if (currentUser?.role === 'vendor') {
      routes.push({
        title: "Mi Tienda",
        href: "/vendor/dashboard",
        icon: Store,
        description: "Panel de vendedor"
      })
    } else if (currentUser?.role === 'organizer') {
      routes.push({
        title: "Mis Eventos",
        href: "/organizer/dashboard",
        icon: Users,
        description: "Panel de organizador"
      })
    }

    return routes
  }

  const mainRoutes = getMainRoutes()

  const authRoutes = [
    {
      title: t("nav.login"),
      href: "/login",
      icon: LogIn,
      variant: "outline" as const
    },
    {
      title: t("nav.register"),
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

  // Verificar estado de autenticación al cargar
  useEffect(() => {
    const checkAuth = async () => {
      const authState = await getAuthStateAsync()
      setCurrentUser(authState.user)
    }
    
    checkAuth()
    
    // Escuchar cambios de autenticación
    window.addEventListener("auth-change", checkAuth)
    
    return () => {
      window.removeEventListener("auth-change", checkAuth)
    }
  }, [])

  // Re-renderizar cuando cambia el idioma
  useEffect(() => {
    setLanguageUpdate(prev => prev + 1)
  }, [language])

  const handleLogout = async () => {
    try {
      const result = await logoutUser()
      if (result.success) {
        // Limpiar estado local
        setCurrentUser(null)
        setIsOpen(false)
        // Limpiar localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('supabase.auth.token')
          localStorage.removeItem('rememberedEmail')
        }
        // Redirigir y refrescar
        router.push("/")
        router.refresh()
      } else {
        console.error('Error cerrando sesión:', result.error)
      }
    } catch (error) {
      console.error('Error cerrando sesión:', error)
    }
  }

  const getUserInitials = (user: User) => {
    if (user.fullName) {
      const parts = user.fullName.split(" ")
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase()
      }
      return parts[0][0].toUpperCase()
    }
    return user.email[0].toUpperCase()
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500"
      case "organizer":
        return "bg-blue-500"
      case "vendor":
        return "bg-green-500"
      case "user":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Admin"
      case "organizer":
        return "Organizador"
      case "vendor":
        return "Vendedor"
      case "user":
        return "Usuario"
      default:
        return role
    }
  }

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => {
    const routes = getMainRoutes()
    
    return (
      <>
        {/* Rutas principales */}
        {routes.map((route) => {
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
  }

  const AuthButtons = ({ mobile = false }: { mobile?: boolean }) => {
    // Si está autenticado, mostrar menú de usuario
    if (currentUser) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size={mobile ? "default" : "sm"} className={cn("gap-2", mobile ? "w-full justify-start" : "")}>
              <Avatar className="h-6 w-6">
                <AvatarFallback className={cn("text-xs", getRoleBadgeColor(currentUser.role))}>
                  {getUserInitials(currentUser)}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{currentUser.fullName || currentUser.email}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{currentUser.fullName || "Usuario"}</p>
                <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
                <p className="text-xs leading-none text-muted-foreground mt-1">
                  <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", getRoleBadgeColor(currentUser.role), "text-white")}>
                    {getRoleLabel(currentUser.role)}
                  </span>
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer">
                <UserIcon className="mr-2 h-4 w-4" />
                {t("nav.profile")}
              </Link>
            </DropdownMenuItem>
            {currentUser.role === "admin" && (
              <DropdownMenuItem asChild>
                <Link href="/admin/dashboard" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  {t("nav.admin")}
                </Link>
              </DropdownMenuItem>
            )}
            {currentUser.role === "organizer" && (
              <DropdownMenuItem asChild>
                <Link href="/organizer/dashboard" className="cursor-pointer">
                  <Users className="mr-2 h-4 w-4" />
                  Panel Organizador
                </Link>
              </DropdownMenuItem>
            )}
            {currentUser.role === "vendor" && (
              <DropdownMenuItem asChild>
                <Link href="/vendor/dashboard" className="cursor-pointer">
                  <Store className="mr-2 h-4 w-4" />
                  Panel Vendedor
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              {t("nav.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    // Si no está autenticado, mostrar botones de login/registro
    return (
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
  }

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

          {/* Search */}
          <div className="hidden md:flex items-center gap-2">
            <CommandPalette />
          </div>

          {/* Theme and Language */}
          <div className="hidden md:flex items-center gap-1">
            <ThemeToggle />
            <LanguageToggle />
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
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="font-bold text-lg">Eventos Agro</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThemeToggle />
                    <LanguageToggle />
                  </div>
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

    </nav>
  )
}