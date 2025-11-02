import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: "",
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Rutas públicas
  const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/events", "/contact", "/privacy", "/terms"]
  const isPublicRoute = publicRoutes.some((route) => path === route || path.startsWith("/events/"))

  // Si no está autenticado y no es ruta pública
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Si está autenticado, verificar roles
  if (user) {
    const userMetadata = user.user_metadata
    const role = userMetadata?.rol || "normal"

    // Mapear roles
    const roleMap: Record<string, string> = {
      'normal': 'normal',
      'vendor': 'vendor',
      'organizer': 'organizer',
      'admin': 'admin',
      'ASISTENTE': 'normal',
      'VENDEDOR': 'vendor',
      'ORGANIZADOR': 'organizer',
      'ADMIN': 'admin'
    }

    const userRole = roleMap[role] || 'normal'

    // Protección de rutas por rol
    if (path.startsWith("/vendor") && userRole !== "vendor" && userRole !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    if (path.startsWith("/organizer") && userRole !== "organizer" && userRole !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    if (path.startsWith("/admin") && userRole !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // Redirigir /dashboard según el rol
    if (path === "/dashboard") {
      if (userRole === "admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url))
      } else if (userRole === "vendor") {
        return NextResponse.redirect(new URL("/vendor/dashboard", request.url))
      } else if (userRole === "organizer") {
        return NextResponse.redirect(new URL("/organizer/dashboard", request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}

