"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Home,
  Calendar,
  Users,
  Store,
  User,
  Settings,
  FileText,
  Shield,
  Mail,
  Search,
  LogIn,
  UserPlus,
  Briefcase,
} from "lucide-react"

interface CommandItem {
  id: string
  title: string
  description?: string
  icon: any
  action: () => void
  keywords: string[]
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  // Toggle con Ctrl+K o Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const navigate = useCallback((path: string) => {
    setOpen(false)
    router.push(path)
  }, [router])

  // Definir comandos disponibles
  const commands: CommandItem[] = [
    // Navegación principal
    {
      id: "home",
      title: "Inicio",
      description: "Ir a la página principal",
      icon: Home,
      action: () => navigate("/"),
      keywords: ["home", "inicio", "principal"],
    },
    {
      id: "events",
      title: "Eventos",
      description: "Ver todos los eventos disponibles",
      icon: Calendar,
      action: () => navigate("/dashboard"),
      keywords: ["events", "eventos", "calendario"],
    },
    {
      id: "vendors",
      title: "Vendedores",
      description: "Catálogo de vendedores",
      icon: Store,
      action: () => navigate("/vendor/dashboard"),
      keywords: ["vendors", "vendedores", "tiendas", "productos"],
    },
    {
      id: "organizers",
      title: "Organizadores",
      description: "Panel de organizadores",
      icon: Briefcase,
      action: () => navigate("/organizer/dashboard"),
      keywords: ["organizers", "organizadores", "crear eventos"],
    },
    
    // Autenticación
    {
      id: "login",
      title: "Iniciar Sesión",
      description: "Acceder a tu cuenta",
      icon: LogIn,
      action: () => navigate("/login"),
      keywords: ["login", "iniciar sesión", "entrar", "acceder"],
    },
    {
      id: "register",
      title: "Registrarse",
      description: "Crear una nueva cuenta",
      icon: UserPlus,
      action: () => navigate("/register"),
      keywords: ["register", "registrarse", "crear cuenta", "nueva cuenta"],
    },
    {
      id: "forgot-password",
      title: "Recuperar Contraseña",
      description: "Restablecer tu contraseña",
      icon: Shield,
      action: () => navigate("/forgot-password"),
      keywords: ["password", "contraseña", "recuperar", "olvidé", "reset"],
    },
    
    // Perfil y configuración
    {
      id: "profile",
      title: "Mi Perfil",
      description: "Ver y editar tu perfil",
      icon: User,
      action: () => navigate("/profile"),
      keywords: ["profile", "perfil", "cuenta", "configuración"],
    },
    {
      id: "admin",
      title: "Panel de Administración",
      description: "Acceso para administradores",
      icon: Settings,
      action: () => navigate("/admin/dashboard"),
      keywords: ["admin", "administración", "panel", "dashboard"],
    },
    
    // Legal
    {
      id: "terms",
      title: "Términos y Condiciones",
      description: "Leer nuestros términos de uso",
      icon: FileText,
      action: () => navigate("/terms"),
      keywords: ["terms", "términos", "condiciones", "legal"],
    },
    {
      id: "privacy",
      title: "Política de Privacidad",
      description: "Cómo protegemos tus datos",
      icon: Shield,
      action: () => navigate("/privacy"),
      keywords: ["privacy", "privacidad", "datos", "protección"],
    },
    {
      id: "contact",
      title: "Contacto",
      description: "Envíanos un mensaje",
      icon: Mail,
      action: () => navigate("/contact"),
      keywords: ["contact", "contacto", "soporte", "ayuda", "mensaje"],
    },
  ]

  return (
    <>
      {/* Botón para abrir (opcional, también funciona con Ctrl+K) */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:inline-flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors border border-border/50"
      >
        <Search className="h-4 w-4" />
        <span>Buscar...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Escribe un comando o busca..." />
        <CommandList>
          <CommandEmpty>No se encontraron resultados.</CommandEmpty>
          
          <CommandGroup heading="Navegación">
            {commands
              .filter((cmd) => ["home", "events", "vendors", "organizers"].includes(cmd.id))
              .map((cmd) => {
                const Icon = cmd.icon
                return (
                  <CommandItem
                    key={cmd.id}
                    value={`${cmd.title} ${cmd.description} ${cmd.keywords.join(" ")}`}
                    onSelect={() => cmd.action()}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span>{cmd.title}</span>
                      {cmd.description && (
                        <span className="text-xs text-muted-foreground">{cmd.description}</span>
                      )}
                    </div>
                  </CommandItem>
                )
              })}
          </CommandGroup>
          
          <CommandSeparator />
          
          <CommandGroup heading="Cuenta">
            {commands
              .filter((cmd) => ["login", "register", "forgot-password", "profile"].includes(cmd.id))
              .map((cmd) => {
                const Icon = cmd.icon
                return (
                  <CommandItem
                    key={cmd.id}
                    value={`${cmd.title} ${cmd.description} ${cmd.keywords.join(" ")}`}
                    onSelect={() => cmd.action()}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span>{cmd.title}</span>
                      {cmd.description && (
                        <span className="text-xs text-muted-foreground">{cmd.description}</span>
                      )}
                    </div>
                  </CommandItem>
                )
              })}
          </CommandGroup>
          
          <CommandSeparator />
          
          <CommandGroup heading="Ayuda y Legal">
            {commands
              .filter((cmd) => ["terms", "privacy", "contact", "admin"].includes(cmd.id))
              .map((cmd) => {
                const Icon = cmd.icon
                return (
                  <CommandItem
                    key={cmd.id}
                    value={`${cmd.title} ${cmd.description} ${cmd.keywords.join(" ")}`}
                    onSelect={() => cmd.action()}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span>{cmd.title}</span>
                      {cmd.description && (
                        <span className="text-xs text-muted-foreground">{cmd.description}</span>
                      )}
                    </div>
                  </CommandItem>
                )
              })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
