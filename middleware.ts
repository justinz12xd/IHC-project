import { NextResponse, type NextRequest } from "next/server"

// MIDDLEWARE COMPLETAMENTE DESACTIVADO - NO HAY AUTENTICACIÓN
export async function middleware(request: NextRequest) {
  // Middleware desactivado temporalmente - permitir acceso a todas las rutas
  return NextResponse.next()
}

// Configuración también comentada para desactivar completamente
/*
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
*/

