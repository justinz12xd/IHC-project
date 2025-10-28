"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  label: string
  href: string
}

export function Breadcrumbs() {
  const pathname = usePathname()

  // Mapeo de rutas a nombres legibles
  const routeNames: Record<string, string> = {
    "": "Inicio",
    "dashboard": "Eventos",
    "profile": "Mi Perfil",
    "login": "Iniciar Sesión",
    "register": "Registrarse",
    "forgot-password": "Recuperar Contraseña",
    "terms": "Términos y Condiciones",
    "privacy": "Política de Privacidad",
    "contact": "Contacto",
    "admin": "Admin",
    "organizer": "Organizador",
    "vendor": "Vendedor",
    "events": "Eventos",
    "products": "Productos",
    "new": "Nuevo",
    "scan": "Escanear",
    "qr": "Código QR",
    "setup-vendor": "Configurar Vendedor",
  }

  // Generar breadcrumbs a partir de la ruta actual
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = pathname.split("/").filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = []

    // Siempre agregar inicio
    breadcrumbs.push({ label: "Inicio", href: "/" })

    // Construir breadcrumbs para cada segmento
    let currentPath = ""
    paths.forEach((path, index) => {
      currentPath += `/${path}`
      
      // Si es un ID (números o formato específico), usar el nombre del padre
      if (/^\d+$/.test(path) || path.startsWith("user_")) {
        breadcrumbs.push({
          label: `#${path}`,
          href: currentPath,
        })
      } else {
        const label = routeNames[path] || path.charAt(0).toUpperCase() + path.slice(1)
        breadcrumbs.push({
          label,
          href: currentPath,
        })
      }
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  // No mostrar breadcrumbs en la página de inicio
  if (pathname === "/") {
    return null
  }

  return (
    <nav aria-label="Breadcrumb" className="bg-muted/30 border-b">
      <div className="container mx-auto px-4 py-3">
        <ol className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1
            const isFirst = index === 0

            return (
              <li key={item.href} className="flex items-center gap-2">
                {!isFirst && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                )}
                
                {isLast ? (
                  <span className="font-medium text-foreground" aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1",
                      isFirst && "font-medium"
                    )}
                  >
                    {isFirst && <Home className="h-4 w-4" aria-hidden="true" />}
                    {item.label}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}
