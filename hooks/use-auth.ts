"use client"

import { useState, useEffect } from "react"
import { getAuthState, logoutUser, type User, type AuthState } from "@/lib/auth/local-auth"

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({ user: null, isAuthenticated: false })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Cargar estado inicial
    const currentAuthState = getAuthState()
    setAuthState(currentAuthState)
    setLoading(false)

    // Escuchar cambios en el estado de autenticación
    const handleAuthChange = () => {
      const newAuthState = getAuthState()
      setAuthState(newAuthState)
    }

    window.addEventListener("auth-change", handleAuthChange)
    window.addEventListener("storage", handleAuthChange)

    return () => {
      window.removeEventListener("auth-change", handleAuthChange)
      window.removeEventListener("storage", handleAuthChange)
    }
  }, [])

  const logout = () => {
    logoutUser()
    setAuthState({ user: null, isAuthenticated: false })
  }

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    loading,
    logout
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