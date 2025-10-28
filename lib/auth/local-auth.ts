// Sistema de autenticación usando localStorage
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

// Clave para localStorage
const AUTH_STORAGE_KEY = "ihc_auth_state"
const USERS_STORAGE_KEY = "ihc_users"

// Obtener usuarios almacenados
export function getStoredUsers(): User[] {
  if (typeof window === "undefined") return []
  
  try {
    const users = localStorage.getItem(USERS_STORAGE_KEY)
    return users ? JSON.parse(users) : []
  } catch {
    return []
  }
}

// Guardar usuarios
function saveUsers(users: User[]): void {
  if (typeof window === "undefined") return
  
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
    // Debug log to help verify users are being saved
    try {
      console.log("[local-auth] saveUsers -> saved users:", users.map(u => ({ email: (u as any).email, id: (u as any).id })))
    } catch {}
  } catch (error) {
    console.error("Error saving users:", error)
  }
}

// Obtener estado de autenticación actual
export function getAuthState(): AuthState {
  if (typeof window === "undefined") {
    return { user: null, isAuthenticated: false }
  }
  
  try {
    const authState = localStorage.getItem(AUTH_STORAGE_KEY)
    if (authState) {
      const parsed = JSON.parse(authState)
      return {
        user: parsed.user,
        isAuthenticated: !!parsed.user
      }
    }
  } catch (error) {
    console.error("Error reading auth state:", error)
  }
  
  return { user: null, isAuthenticated: false }
}

// Guardar estado de autenticación
function saveAuthState(authState: AuthState): void {
  if (typeof window === "undefined") return
  
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState))
    
    // También guardar en cookies para que funcione con el middleware
    // Usar encodeURIComponent para evitar problemas con caracteres especiales
    if (authState.user) {
      const cookieValue = encodeURIComponent(JSON.stringify(authState))
      document.cookie = `ihc_auth_state=${cookieValue}; path=/; max-age=${30 * 24 * 60 * 60}` // 30 días
    } else {
      document.cookie = "ihc_auth_state=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC"
    }
  } catch (error) {
    console.error("Error saving auth state:", error)
  }
}

// Registrar nuevo usuario
export function registerUser(data: {
  email: string
  password: string
  fullName: string
  role: "normal" | "vendor" | "organizer"
}): { success: boolean; user?: User; error?: string } {
  try {
    console.log("[local-auth] registerUser called for:", data.email)
    const users = getStoredUsers()
    
    // Verificar si el email ya existe
    const existingUser = users.find(user => user.email.toLowerCase() === data.email.toLowerCase())
    if (existingUser) {
      return { success: false, error: "Este correo electrónico ya está registrado" }
    }
    
    // Validar datos
    if (!data.email || !data.password || !data.fullName) {
      return { success: false, error: "Todos los campos son obligatorios" }
    }
    
    if (data.password.length < 6) {
      return { success: false, error: "La contraseña debe tener al menos 6 caracteres" }
    }
    
    if (!isValidEmail(data.email)) {
      return { success: false, error: "Correo electrónico inválido" }
    }
    
    // Crear nuevo usuario
    const newUser: User = {
      id: generateUserId(),
      email: data.email,
      fullName: data.fullName,
      role: data.role,
      createdAt: new Date().toISOString()
    }
    
    // Guardar usuario y contraseña (en producción se debería hashear)
    const userWithPassword = { ...newUser, password: data.password }
    const updatedUsers = [...users, userWithPassword]
    saveUsers(updatedUsers)
    // Notify listeners that users changed
    try {
      window.dispatchEvent(new CustomEvent("users-changed"))
    } catch {}
    
    // Autenticar automáticamente al usuario
    const authState: AuthState = {
      user: newUser,
      isAuthenticated: true
    }
    saveAuthState(authState)
    // Notify listeners that auth state changed
    try {
      window.dispatchEvent(new CustomEvent("auth-change"))
    } catch {}
    
    return { success: true, user: newUser }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, error: "Error inesperado durante el registro" }
  }
}

// Iniciar sesión
export function loginUser(email: string, password: string): { success: boolean; user?: User; error?: string } {
  try {
    if (!email || !password) {
      return { success: false, error: "Email y contraseña son obligatorios" }
    }
    
    const users = getStoredUsers()
    const user = users.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && 
      (u as any).password === password
    )
    
    if (!user) {
      return { success: false, error: "Credenciales incorrectas" }
    }
    
    // Crear objeto de usuario sin contraseña
    const { password: _, ...userWithoutPassword } = user as any
    const authUser: User = userWithoutPassword
    
    // Guardar estado de autenticación
    const authState: AuthState = {
      user: authUser,
      isAuthenticated: true
    }
    saveAuthState(authState)
    
    // Disparar evento para notificar cambios
    try {
      window.dispatchEvent(new CustomEvent("auth-change"))
    } catch {}
    
    return { success: true, user: authUser }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "Error inesperado durante el inicio de sesión" }
  }
}

// Cerrar sesión
export function logoutUser(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    
    // Eliminar cookie
    document.cookie = "ihc_auth_state=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC"
    
    // Disparar evento para notificar cambios
    window.dispatchEvent(new CustomEvent("auth-change"))
  } catch (error) {
    console.error("Logout error:", error)
  }
}

// Actualizar perfil de usuario
export function updateUserProfile(updates: Partial<Pick<User, 'fullName' | 'phone' | 'avatarUrl'>>): { success: boolean; user?: User; error?: string } {
  try {
    const authState = getAuthState()
    if (!authState.isAuthenticated || !authState.user) {
      return { success: false, error: "Usuario no autenticado" }
    }
    
    const users = getStoredUsers()
    const userIndex = users.findIndex(u => u.id === authState.user!.id)
    
    if (userIndex === -1) {
      return { success: false, error: "Usuario no encontrado" }
    }
    
    // Actualizar usuario
    const updatedUser: User = { ...authState.user, ...updates }
    users[userIndex] = { ...users[userIndex], ...updates }
    saveUsers(users)
    
    // Actualizar estado de autenticación
    const newAuthState: AuthState = {
      user: updatedUser,
      isAuthenticated: true
    }
    saveAuthState(newAuthState)
    
    // Disparar evento para notificar cambios
    window.dispatchEvent(new CustomEvent("auth-change"))
    
    return { success: true, user: updatedUser }
  } catch (error) {
    console.error("Update profile error:", error)
    return { success: false, error: "Error al actualizar el perfil" }
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
      return "/setup-vendor"
    case "normal":
    default:
      return "/dashboard"
  }
}

// Utilidades
function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Crear usuarios de prueba si no existen
export function initializeTestUsers(): void {
  if (typeof window === "undefined") return
  
  const users = getStoredUsers()
  if (users.length === 0) {
    const testUsers = [
      {
        id: "admin_test",
        email: "admin@test.com",
        fullName: "Administrador Test",
        role: "admin" as const,
        password: "123456",
        createdAt: new Date().toISOString()
      },
      {
        id: "organizer_test",
        email: "organizer@test.com",
        fullName: "Organizador Test",
        role: "organizer" as const,
        password: "123456",
        createdAt: new Date().toISOString()
      },
      {
        id: "vendor_test",
        email: "vendor@test.com",
        fullName: "Vendedor Test",
        role: "vendor" as const,
        password: "123456",
        createdAt: new Date().toISOString()
      },
      {
        id: "user_test",
        email: "user@test.com",
        fullName: "Usuario Test",
        role: "normal" as const,
        password: "123456",
        createdAt: new Date().toISOString()
      }
    ]
    
    saveUsers(testUsers)
    console.log("Usuarios de prueba creados:", testUsers.map(u => ({ email: u.email, password: u.password, role: u.role })))
  }
}