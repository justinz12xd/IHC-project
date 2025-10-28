# Sistema de Autenticación Local

He implementado un sistema de autenticación que usa **localStorage** en lugar de Supabase para evitar los problemas de base de datos que estabas experimentando.

## ✅ ¿Qué está implementado?

### 1. **Sistema de Autenticación Local** (`lib/auth/local-auth.ts`)
- Registro y login usando localStorage
- Validaciones de email y contraseña
- Soporte completo para roles: normal, vendor, organizer, admin
- Sincronización con cookies para compatibilidad con middleware

### 2. **Páginas Actualizadas**
- **`/register`**: Registro de usuarios con localStorage
- **`/login`**: Inicio de sesión con localStorage  
- **Usuarios de prueba** incluidos automáticamente

### 3. **Middleware Actualizado** (`middleware.ts`)
- Protección de rutas basada en cookies
- Redirección automática según roles
- Sin dependencias de Supabase

### 4. **Hook de Autenticación** (`hooks/use-auth.ts`)
- `useAuth()`: Estado de autenticación reactivo
- `useRequireAuth()`: Proteger rutas que requieren autenticación
- `useRequireRole()`: Proteger rutas que requieren roles específicos

### 5. **Componente de Estado** (`components/auth-status.tsx`)
- Muestra información del usuario actual
- Botón de logout
- Indicador de rol con colores

## 🚀 Cómo usar

### Paso 1: Inicia la aplicación
```bash
pnpm dev
```

### Paso 2: Usuarios de prueba disponibles
El sistema crea automáticamente estos usuarios:

| Email | Contraseña | Rol |
|-------|------------|-----|
| `admin@test.com` | `123456` | Administrador |
| `organizer@test.com` | `123456` | Organizador |
| `vendor@test.com` | `123456` | Vendedor |
| `user@test.com` | `123456` | Usuario Normal |

### Paso 3: Prueba el flujo
1. Ve a `/login` o `/register`
2. Usa cualquiera de los usuarios de prueba o crea uno nuevo
3. Serás redirigido automáticamente según tu rol:
   - **Admin** → `/admin/dashboard`
   - **Organizador** → `/organizer/dashboard`
   - **Vendedor** → `/setup-vendor`
   - **Usuario** → `/dashboard`

## 🔧 Desarrollo

### Usar el hook de autenticación en componentes:

```tsx
import { useAuth } from "@/hooks/use-auth"

function MyComponent() {
  const { user, isAuthenticated, loading, logout } = useAuth()

  if (loading) return <div>Cargando...</div>
  if (!isAuthenticated) return <div>No autenticado</div>

  return (
    <div>
      <p>Hola, {user.fullName}!</p>
      <p>Rol: {user.role}</p>
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  )
}
```

### Proteger rutas que requieren autenticación:

```tsx
import { useRequireAuth } from "@/hooks/use-auth"

function ProtectedPage() {
  const { isAuthenticated, loading } = useRequireAuth()

  if (loading) return <div>Verificando...</div>
  if (!isAuthenticated) return null // Se redirigirá automáticamente

  return <div>Contenido protegido</div>
}
```

### Proteger rutas por rol:

```tsx
import { useRequireRole } from "@/hooks/use-auth"

function AdminPage() {
  const { user, hasRequiredRole, loading } = useRequireRole(["admin"])

  if (loading) return <div>Verificando permisos...</div>
  if (!hasRequiredRole) return null // Se redirigirá automáticamente

  return <div>Panel de administración</div>
}
```

## 📱 Características

### ✅ Funcionalidades implementadas:
- ✅ Registro de usuarios
- ✅ Inicio de sesión
- ✅ Cerrar sesión
- ✅ Protección de rutas
- ✅ Validación de roles
- ✅ Persistencia en localStorage y cookies
- ✅ Estado reactivo de autenticación
- ✅ Usuarios de prueba automáticos
- ✅ Redirección automática según roles

### 🔄 Próximos pasos cuando vuelvas a Supabase:
1. Mantén estos archivos como referencia
2. Gradualmente reemplaza las funciones locales con las de Supabase
3. Los hooks y componentes funcionarán igual, solo cambia la implementación interna

## 🗂️ Estructura de datos

### Usuario en localStorage:
```typescript
interface User {
  id: string
  email: string
  fullName: string
  role: "normal" | "vendor" | "organizer" | "admin"
  avatarUrl?: string
  phone?: string
  createdAt: string
}
```

### Estado de autenticación:
```typescript
interface AuthState {
  user: User | null
  isAuthenticated: boolean
}
```

## 🛡️ Seguridad

⚠️ **Nota importante**: Este sistema es para desarrollo/prototipado. En producción:
- Las contraseñas deberían estar hasheadas
- Se necesita validación del lado del servidor
- Los tokens deberían expirar
- Se debería implementar rate limiting

Para desarrollo está perfecto y te permite seguir trabajando sin problemas de base de datos.