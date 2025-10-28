"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@/lib/supabase/client"
import { LayoutDashboard, LogOut, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createBrowserClient()
  const { toast } = useToast()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión exitosamente",
    })
    router.push("/login")
  }

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
              <Shield className="h-5 w-5" aria-hidden="true" />
              <span>Panel Admin</span>
            </Link>

            <div className="flex gap-1">
              <Button variant={pathname === "/admin/dashboard" ? "default" : "ghost"} size="sm" asChild>
                <Link href="/admin/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" aria-hidden="true" />
                  Dashboard
                </Link>
              </Button>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </nav>
  )
}
