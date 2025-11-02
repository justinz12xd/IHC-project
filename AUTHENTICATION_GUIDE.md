# Guía de Autenticación con Supabase

## Descripción General

Se ha implementado un sistema de autenticación completo usando Supabase REST API con las siguientes funcionalidades:

- ✅ Registro de usuarios
- ✅ Inicio de sesión
- ✅ Recuperación de contraseña (Forgot Password)
- ✅ Restablecimiento de contraseña (Reset Password)
- ✅ Actualización de perfil de usuario
- ✅ Cierre de sesión
- ✅ Gestión de sesiones con localStorage

## Archivos Creados/Modificados

### Nuevos Archivos

1. **`lib/auth/supabase-auth.ts`**
   - Sistema de autenticación completo con Supabase
   - Funciones: `registerUser`, `loginUser`, `logoutUser`, `resetPassword`, `updatePassword`, `updateUserProfile`, `getSession`

2. **`app/reset-password/page.tsx`**
   - Página para restablecer la contraseña después de recibir el enlace por correo

### Archivos Modificados

1. **`app/login/page.tsx`**
   - Actualizado para usar `supabase-auth` en lugar de `local-auth`
   - Manejo asíncrono de login

2. **`app/register/page.tsx`**
   - Actualizado para usar `supabase-auth` en lugar de `local-auth`
   - Manejo asíncrono de registro

3. **`app/forgot-password/page.tsx`**
   - Actualizado para usar la API de Supabase
   - Envío real de correos de recuperación

4. **`app/profile/page.tsx`**
   - Actualizado para usar funciones asíncronas de Supabase
   - Cambio de contraseña sin necesidad de contraseña actual

5. **`components/main-navbar.tsx`**
   - Actualizado para importar desde `supabase-auth`

6. **`lib/i18n/language-context.tsx`**
   - Agregadas 19 nuevas claves de traducción para forgot password y reset password
   - Soporte completo en español e inglés

## Configuración de Supabase

### Variables de Entorno (ya configuradas en `.env.local`)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://obxpconzcutnviqhpemy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Configuración de Base de Datos

Asegúrate de que la tabla `profiles` exista en Supabase:

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('normal', 'vendor', 'organizer', 'admin')),
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden leer su propio perfil
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Política: Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Política: Permitir inserción en registro
CREATE POLICY "Enable insert for authentication"
  ON profiles FOR INSERT
  WITH CHECK (true);
```

### Configuración de Email Templates en Supabase

1. Ve a **Authentication > Email Templates** en el dashboard de Supabase
2. Configura el template "Reset Password":
   - Subject: `Restablece tu contraseña - IHC Platform`
   - Body: Incluye el enlace `{{ .ConfirmationURL }}`

## Flujo de Autenticación

### 1. Registro de Usuario

```typescript
const result = await registerUser({
  email: "user@example.com",
  password: "securepassword",
  fullName: "John Doe",
  role: "normal" // 'normal' | 'vendor' | 'organizer'
})

if (result.success) {
  // Usuario registrado y autenticado
  console.log(result.user)
}
```

### 2. Inicio de Sesión

```typescript
const result = await loginUser("user@example.com", "password")

if (result.success) {
  // Usuario autenticado
  const redirectPath = getRedirectPath(result.user.role)
  router.push(redirectPath)
}
```

### 3. Recuperación de Contraseña

```typescript
const result = await resetPassword("user@example.com")

if (result.success) {
  // Correo enviado con enlace de recuperación
  // El enlace redirige a /reset-password
}
```

### 4. Restablecimiento de Contraseña

```typescript
const result = await updatePassword("newSecurePassword")

if (result.success) {
  // Contraseña actualizada
}
```

### 5. Actualización de Perfil

```typescript
const result = await updateUserProfile({
  fullName: "Jane Doe",
  phone: "+1234567890",
  avatarUrl: "https://example.com/avatar.jpg"
})

if (result.success) {
  // Perfil actualizado
}
```

### 6. Cierre de Sesión

```typescript
const result = await logoutUser()

if (result.success) {
  // Sesión cerrada
}
```

## Rutas de Autenticación

| Ruta | Descripción |
|------|-------------|
| `/login` | Página de inicio de sesión |
| `/register` | Página de registro de usuario |
| `/forgot-password` | Página para solicitar recuperación de contraseña |
| `/reset-password` | Página para restablecer contraseña (después del enlace) |
| `/dashboard` | Dashboard para usuarios normales |
| `/vendor/dashboard` | Dashboard para vendedores |
| `/organizer/dashboard` | Dashboard para organizadores |
| `/admin/dashboard` | Dashboard para administradores |

## Nuevas Claves de Traducción

Se agregaron las siguientes claves en ambos idiomas (ES/EN):

```typescript
"auth.forgotPasswordSubtitle"
"auth.resetPasswordInstructions"
"auth.sendResetLink"
"auth.sending"
"auth.checkYourEmail"
"auth.checkInbox"
"auth.passwordResetSent"
"auth.checkEmailInstructions"
"auth.checkSpam"
"auth.backToLogin"
"auth.sendToAnotherEmail"
"auth.resetPassword"
"auth.enterNewPassword"
"auth.passwordMismatch"
"auth.passwordMinLength"
"auth.updatePassword"
"auth.updating"
"auth.passwordUpdated"
"auth.redirectingToDashboard"
```

## Gestión de Estado

El estado de autenticación se guarda en:

1. **localStorage**: `ihc_auth_state`
2. **Cookies**: `ihc_auth_state` (para middleware)
3. **Supabase Session**: Gestionado automáticamente

## Eventos Personalizados

Se dispara el evento `auth-change` cuando cambia el estado de autenticación:

```typescript
window.addEventListener('auth-change', () => {
  // Actualizar UI cuando cambie el estado de auth
})
```

## Seguridad

- ✅ Passwords hasheados por Supabase
- ✅ Row Level Security (RLS) habilitado
- ✅ Tokens JWT para autenticación
- ✅ Validación de emails
- ✅ Reset password con tokens seguros
- ✅ Sesiones gestionadas por Supabase

## Testing

Para probar la autenticación:

1. **Registro**: Crea una cuenta nueva en `/register`
2. **Login**: Inicia sesión con las credenciales en `/login`
3. **Forgot Password**: Prueba la recuperación en `/forgot-password`
4. **Perfil**: Actualiza tu información en `/profile`

## Próximos Pasos

- [ ] Configurar templates de email personalizados en Supabase
- [ ] Implementar autenticación con OAuth (Google, GitHub)
- [ ] Agregar verificación de email al registro
- [ ] Implementar 2FA (Two-Factor Authentication)
- [ ] Agregar logs de auditoría de sesiones

## Soporte

Si encuentras problemas:

1. Verifica que las variables de entorno estén configuradas
2. Revisa la consola del navegador para errores
3. Verifica que la tabla `profiles` exista en Supabase
4. Confirma que RLS esté configurado correctamente

## Notas Importantes

- El middleware está temporalmente desactivado para desarrollo
- Las sesiones se mantienen por 30 días en localStorage
- Los correos de recuperación se envían desde Supabase
- El enlace de reset password redirige a `/reset-password`
