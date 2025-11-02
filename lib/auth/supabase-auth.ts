// Supabase Authentication using REST API
"use client"
import { createBrowserClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"

// Initialize Supabase client
const supabase = createBrowserClient()

export interface User {
  id: string
  email: string
  fullName: string
  role: "normal" | "vendor" | "organizer" | "admin"
  avatarUrl?: string
  phone?: string
  createdAt: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

// Mapear roles de inglés a español MAYÚSCULAS (para la base de datos)
function mapRoleToSpanish(role: string): string {
  const roleMap: Record<string, string> = {
    'normal': 'ASISTENTE',
    'vendor': 'VENDEDOR',
    'organizer': 'ORGANIZADOR',
    'admin': 'ADMIN'
  }
  return roleMap[role] || 'ASISTENTE'
}

// Mapear roles de español MAYÚSCULAS a inglés (desde la base de datos)
function mapRoleToEnglish(role: string): "normal" | "vendor" | "organizer" | "admin" {
  const roleMap: Record<string, "normal" | "vendor" | "organizer" | "admin"> = {
    'ASISTENTE': 'normal',
    'VENDEDOR': 'vendor',
    'ORGANIZADOR': 'organizer',
    'ADMIN': 'admin',
    'MODERADOR': 'admin'
  }
  return roleMap[role] || 'normal'
}

// Cache para el estado de autenticación (evitar múltiples llamadas a la DB)
let authStateCache: AuthState | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 5000 // 5 segundos

// Obtener estado de autenticación (versión síncrona con caché)
export function getAuthState(): AuthState {
  // Si hay caché válido, devolverlo
  if (authStateCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return authStateCache
  }
  
  // Si no hay caché, devolver estado no autenticado
  // El componente debe usar getAuthStateAsync() para la primera carga
  return authStateCache || { user: null, isAuthenticated: false }
}

// Obtener estado de autenticación (versión asíncrona desde Supabase)
export async function getAuthStateAsync(): Promise<AuthState> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) {
      authStateCache = { user: null, isAuthenticated: false }
      cacheTimestamp = Date.now()
      return authStateCache
    }
    
    // Intentar obtener datos del usuario desde la tabla 'usuario'
    let usuarioData = null
    try {
      const { data, error: usuarioError } = await supabase
        .from('usuario')
        .select('*')
        .eq('auth_id', session.user.id)
        .single()
      
      if (usuarioError) {
        console.warn("[supabase-auth] Error fetching usuario:", usuarioError.message, usuarioError.code)
      }
      
      if (!usuarioError && data) {
        // Validar que el usuario esté activo
        if (data.estado !== 'activo') {
          console.warn("[supabase-auth] Usuario inactivo")
          authStateCache = { user: null, isAuthenticated: false }
          cacheTimestamp = Date.now()
          return authStateCache
        }
        usuarioData = data
      }
    } catch (err: any) {
      console.warn("[supabase-auth] Exception fetching usuario:", err.message)
    }
    
    let user: User
    
    if (usuarioData) {
      // Usar datos de la tabla usuario (mapear rol de español a inglés)
      user = {
        id: usuarioData.auth_id,
        email: usuarioData.correo,
        fullName: usuarioData.nombre + (usuarioData.apellido ? ` ${usuarioData.apellido}` : ""),
        role: mapRoleToEnglish(usuarioData.rol),
        createdAt: usuarioData.fecha_registro || session.user.created_at
      }
    } else {
      // Usar datos de auth.users
      const nombre = session.user.user_metadata?.nombre || session.user.email?.split('@')[0] || 'Usuario'
      const apellido = session.user.user_metadata?.apellido || ''
      const rol = session.user.user_metadata?.rol || 'normal'
      
      user = {
        id: session.user.id,
        email: session.user.email!,
        fullName: nombre + (apellido ? ` ${apellido}` : ""),
        role: rol,
        createdAt: session.user.created_at
      }
    }
    
    authStateCache = { user, isAuthenticated: true }
    cacheTimestamp = Date.now()
    return authStateCache
  } catch (error) {
    console.error("Error reading auth state:", error)
    authStateCache = { user: null, isAuthenticated: false }
    cacheTimestamp = Date.now()
    return authStateCache
  }
}

// Limpiar caché de autenticación
function clearAuthCache(): void {
  authStateCache = null
  cacheTimestamp = 0
}

// Disparar evento para notificar cambios de autenticación
function notifyAuthChange(): void {
  clearAuthCache()
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("auth-change"))
  }
}

// Hook React para usar autenticación en componentes
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({ user: null, isAuthenticated: false })
  const [loading, setLoading] = useState(true)

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

  return { ...authState, loading }
}

// Registrar nuevo usuario con Supabase y tabla 'usuario'
export async function registerUser(data: {
  email: string
  password: string
  fullName: string
  role: "normal" | "vendor" | "organizer"
}): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    console.log("[supabase-auth] registerUser called for:", data.email)
    if (!data.email || !data.password || !data.fullName) {
      return { success: false, error: "Todos los campos son obligatorios" }
    }
    if (data.password.length < 6) {
      return { success: false, error: "La contraseña debe tener al menos 6 caracteres" }
    }
    // Registrar usuario con Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          nombre: data.fullName.split(" ")[0] || data.fullName,
          apellido: data.fullName.split(" ").slice(1).join(" ") || "",
          rol: data.role
        }
      }
    })
    if (signUpError) {
      console.error("[supabase-auth] Sign up error:", signUpError)
      return {
        success: false,
        error: signUpError.message === "User already registered"
          ? "Este correo electrónico ya está registrado"
          : signUpError.message
      }
    }
    if (!authData.user) {
      return { success: false, error: "Error al crear la cuenta" }
    }
    // Crear registro en la tabla 'usuario'
    const nombreParts = data.fullName.trim().split(" ")
    const nombre = nombreParts[0] || data.fullName
    const apellido = nombreParts.slice(1).join(" ") || ""
    
    console.log("[supabase-auth] Intentando crear usuario en tabla...")
    
    // Esperar un momento para que el trigger se ejecute
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Verificar si el trigger ya creó el usuario
    const { data: existingUser } = await supabase
      .from('usuario')
      .select('auth_id')
      .eq('auth_id', authData.user.id)
      .maybeSingle()
    
    if (existingUser) {
      console.log("[supabase-auth] Usuario ya existe en tabla (creado por trigger)")
    } else {
      // Intentar crear el registro manualmente
      try {
        const { data: insertData, error: usuarioError } = await supabase
          .from('usuario')
          .insert({
            auth_id: authData.user.id,
            correo: data.email,
            nombre: nombre,
            apellido: apellido,
            rol: mapRoleToSpanish(data.role),  // Convertir a español
            estado: "activo",
            password_hash: null  // El hash está en auth.users, no aquí
          })
          .select()
          .single()
        
        if (usuarioError) {
          // Solo mostrar error si tiene contenido real
          if (usuarioError.message || usuarioError.code) {
            console.error("[supabase-auth] Error al crear usuario en tabla:", {
              message: usuarioError.message,
              code: usuarioError.code,
              details: usuarioError.details,
              hint: usuarioError.hint
            })
            
            // Si el error es de duplicado, está bien (race condition con el trigger)
            if (usuarioError.code === '23505') {
              console.log("[supabase-auth] Usuario ya existe (race condition con trigger)")
            }
          }
        } else if (insertData) {
          console.log("[supabase-auth] Usuario creado exitosamente en tabla:", insertData)
        }
      } catch (err: any) {
        console.warn("[supabase-auth] Exception al crear usuario:", err.message || err)
      }
    }
    const user: User = {
      id: authData.user.id,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
      createdAt: new Date().toISOString()
    }
    
    notifyAuthChange()
    return { success: true, user }
  } catch (error: any) {
    console.error("[supabase-auth] Registration error:", error)
    return { success: false, error: error.message || "Error inesperado durante el registro" }
  }
}

// Iniciar sesión con Supabase
export async function loginUser(
  email: string, 
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    if (!email || !password) {
      return { success: false, error: "Email y contraseña son obligatorios" }
    }
    
    // Iniciar sesión con Supabase Auth
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (signInError) {
      console.error("[supabase-auth] Sign in error:", signInError)
      return { 
        success: false, 
        error: signInError.message === "Invalid login credentials" 
          ? "Credenciales incorrectas" 
          : signInError.message 
      }
    }
    
    if (!authData.user) {
      return { success: false, error: "Error al iniciar sesión" }
    }
    
    // Verificar si el usuario existe en la tabla 'usuario'
    // Si no existe, crearlo automáticamente
    const { data: usuarioCheck } = await supabase
      .from('usuario')
      .select('auth_id')
      .eq('auth_id', authData.user.id)
      .maybeSingle()
    
    if (!usuarioCheck) {
      // El usuario no existe en la tabla, crearlo
      console.log("[supabase-auth] Usuario no encontrado en tabla, creando registro...")
      const nombre = authData.user.user_metadata?.nombre || authData.user.email?.split('@')[0] || 'Usuario'
      const apellido = authData.user.user_metadata?.apellido || ''
      const rol = authData.user.user_metadata?.rol || 'normal'
      
      try {
        await supabase
          .from('usuario')
          .insert({
            auth_id: authData.user.id,
            correo: authData.user.email!,
            nombre,
            apellido,
            rol: mapRoleToSpanish(rol),  // Convertir a español
            estado: "activo",
            password_hash: null  // El hash está en auth.users
          })
        console.log("[supabase-auth] Usuario creado exitosamente en tabla")
      } catch (err: any) {
        console.warn("[supabase-auth] No se pudo crear usuario en tabla:", err.message)
      }
    }
    
    // Construir objeto de usuario básico desde auth.user
    const nombre = authData.user.user_metadata?.nombre || authData.user.email?.split('@')[0] || 'Usuario'
    const apellido = authData.user.user_metadata?.apellido || ''
    const rol = authData.user.user_metadata?.rol || 'normal'
    
    const user: User = {
      id: authData.user.id,
      email: authData.user.email!,
      fullName: nombre + (apellido ? ` ${apellido}` : ""),
      role: rol,
      createdAt: authData.user.created_at
    }
    
    notifyAuthChange()
    return { success: true, user }
  } catch (error: any) {
    console.error("[supabase-auth] Login error:", error)
    return { success: false, error: error.message || "Error inesperado durante el inicio de sesión" }
  }
}

// Cerrar sesión
export async function logoutUser(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error("[supabase-auth] Sign out error:", error)
      return { success: false, error: error.message }
    }
    
    notifyAuthChange()
    return { success: true }
  } catch (error: any) {
    console.error("[supabase-auth] Logout error:", error)
    return { success: false, error: error.message || "Error al cerrar sesión" }
  }
}

// Recuperar contraseña
export async function resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!email) {
      return { success: false, error: "El correo electrónico es obligatorio" }
    }
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    
    if (error) {
      console.error("[supabase-auth] Password reset error:", error)
      return { success: false, error: error.message }
    }
    
    return { success: true }
  } catch (error: any) {
    console.error("[supabase-auth] Password reset error:", error)
    return { success: false, error: error.message || "Error al enviar el correo de recuperación" }
  }
}

// Actualizar contraseña (después de reset)
export async function updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: "La contraseña debe tener al menos 6 caracteres" }
    }
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })
    
    if (error) {
      console.error("[supabase-auth] Password update error:", error)
      return { success: false, error: error.message }
    }
    
    return { success: true }
  } catch (error: any) {
    console.error("[supabase-auth] Password update error:", error)
    return { success: false, error: error.message || "Error al actualizar la contraseña" }
  }
}

// Actualizar perfil de usuario en la tabla 'usuario'
export async function updateUserProfile(
  updates: Partial<Pick<User, 'fullName'>>
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const authState = await getAuthState()
    if (!authState.isAuthenticated || !authState.user) {
      return { success: false, error: "Usuario no autenticado" }
    }
    
    // Separar nombre y apellido
    let nombre = updates.fullName || authState.user.fullName || ""
    let [nombreSolo, ...apellidosArr] = nombre.split(" ")
    let apellido = apellidosArr.join(" ")
    
    // Actualizar en Supabase
    const { error } = await supabase
      .from('usuario')
      .update({
        nombre: nombreSolo,
        apellido: apellido
      })
      .eq('auth_id', authState.user.id)
    
    if (error && Object.keys(error).length > 0) {
      console.error("[supabase-auth] Usuario update error:", error)
      return { success: false, error: error.message || "Error al actualizar" }
    }
    
    // Obtener usuario actualizado
    const updatedUser: User = { ...authState.user, fullName: nombre }
    notifyAuthChange()
    
    return { success: true, user: updatedUser }
  } catch (error: any) {
    console.error("[supabase-auth] Usuario update error:", error)
    return { success: false, error: error.message || "Error al actualizar el perfil" }
  }
}

// Obtener sesión actual de Supabase
export async function getSession(): Promise<{ user: User | null; error?: string }> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error("[supabase-auth] Get session error:", error)
      return { user: null, error: error.message }
    }
    
    if (!session) {
      return { user: null }
    }
    
    // Obtener datos del usuario desde la tabla 'usuario'
    const { data: usuarioData, error: usuarioError } = await supabase
      .from('usuario')
      .select('*')
      .eq('auth_id', session.user.id)
      .single()
    
    if (usuarioError || !usuarioData) {
      return { user: null }
    }
    
    const user: User = {
      id: usuarioData.auth_id,
      email: usuarioData.correo,
      fullName: usuarioData.nombre + (usuarioData.apellido ? ` ${usuarioData.apellido}` : ""),
      role: usuarioData.rol,
      createdAt: usuarioData.fecha_registro
    }
    
    return { user }
  } catch (error: any) {
    console.error("[supabase-auth] Get session error:", error)
    return { user: null, error: error.message }
  }
}

// Obtener rutas de redirección según el rol
export function getRedirectPath(role: string): string {
  switch (role) {
    case "admin":
      return "/admin/dashboard"
    case "organizer":
      return "/organizer/dashboard"
    case "vendor":
      return "/vendor/dashboard"
    case "normal":
    case "user":
    default:
      return "/dashboard"
  }
}
