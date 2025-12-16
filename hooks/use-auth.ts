"use client"

import { useState, useEffect } from "react"
import { getAuthStateAsync, type User, type AuthState } from "@/lib/auth/supabase-auth"
import { createBrowserClient } from "@/lib/supabase/client"

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({ user: null, isAuthenticated: false })
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    // Cargar estado inicial
    const loadAuth = async () => {
      const state = await getAuthStateAsync()
      setAuthState(state)
      setLoading(false)
    }
    
    loadAuth()

    // Escuchar cambios de autenticación
    const handleAuthChange = () => {
      loadAuth()
    }

    window.addEventListener("auth-change", handleAuthChange)

    // Listener de Supabase para cambios de sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        await loadAuth()
      }
    })

    return () => {
      window.removeEventListener("auth-change", handleAuthChange)
      subscription.unsubscribe()
    }
  }, [])

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    loading
  }
}

// Hook para proteger rutas
export function useRequireAuth(redirectTo: string = "/login") {
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = redirectTo
    }
  }, [isAuthenticated, loading, redirectTo])

  return { isAuthenticated, loading }
}

// Hook para verificar roles específicos
export function useRequireRole(allowedRoles: string[], redirectTo: string = "/dashboard") {
  const { user, isAuthenticated, loading } = useAuth()

  useEffect(() => {
    if (!loading && (!isAuthenticated || !user)) {
      window.location.href = "/login"
      return
    }

    if (!loading && user && !allowedRoles.includes(user.role)) {
      window.location.href = redirectTo
    }
  }, [user, isAuthenticated, loading, allowedRoles, redirectTo])

  return { user, isAuthenticated, loading, hasRequiredRole: user ? allowedRoles.includes(user.role) : false }
}