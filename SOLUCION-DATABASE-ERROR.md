# Solución: Error "Database error saving new user"

Este error ocurre cuando la aplicación no puede crear el perfil de usuario en la base de datos después del registro. Aquí están las soluciones paso a paso:

## Diagnóstico Rápido

1. **¿Las credenciales están configuradas?** ✅
   - Ya tienes configuradas las variables de entorno en `.env.local`

2. **¿La base de datos está configurada?** ❓
   - Necesita verificación

## Solución Rápida (5 minutos)

### Paso 1: Accede a la consola SQL de Supabase

1. Ve a [tu dashboard de Supabase](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Navega a **SQL Editor** en el menú lateral

### Paso 2: Ejecuta el script de solución rápida

Copia y pega este código en la consola SQL y ejecuta:

```sql
-- Crear tabla profiles si no existe
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'normal',
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas básicas de seguridad
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### Paso 3: Prueba el registro

1. Reinicia tu aplicación: `pnpm dev`
2. Ve a `/register`
3. Intenta registrar un nuevo usuario

## Solución Completa (15 minutos)

Para obtener todas las funcionalidades, ejecuta los scripts en este orden en la consola SQL:

1. `scripts/01-create-tables.sql` - Crea todas las tablas
2. `scripts/02-setup-rls.sql` - Configura las políticas de seguridad
3. `scripts/05-improved-triggers.sql` - Crea triggers para automatización
4. `scripts/03-seed-data.sql` - Datos de prueba (opcional)

## Verificación

Ejecuta este script para verificar que todo esté funcionando:

```sql
-- Verificar que la tabla existe
SELECT count(*) FROM information_schema.tables 
WHERE table_name = 'profiles' AND table_schema = 'public';

-- Verificar políticas RLS
SELECT count(*) FROM pg_policies 
WHERE tablename = 'profiles';

-- Probar inserción manual
INSERT INTO profiles (id, email, full_name, role) 
VALUES (gen_random_uuid(), 'test@example.com', 'Test User', 'normal');
```

## Características del Nuevo Sistema

- ✅ **Manejo robusto de errores**: La aplicación maneja automáticamente casos donde los triggers no funcionan
- ✅ **Múltiples intentos**: Intenta crear el perfil automáticamente y manualmente si es necesario
- ✅ **Mejor logging**: Errores más descriptivos en la consola
- ✅ **Compatibilidad con roles**: Soporte completo para vendor, organizer, admin, y normal

## Scripts de Utilidad

- `scripts/verify-and-fix-db.sql` - Diagnóstica problemas en la base de datos
- `scripts/setup-database.ps1` - Script de PowerShell con instrucciones
- `lib/auth/registration.ts` - Nueva utilidad para registro robusto

## Problemas Comunes

**Error: "relation profiles does not exist"**
- Solución: Ejecuta el script de solución rápida arriba

**Error: "permission denied for table profiles"**
- Solución: Asegúrate de que RLS esté configurado correctamente

**Error: "User already registered"**
- Esto es normal, significa que el usuario ya existe

## Contacto

Si sigues teniendo problemas después de estos pasos, revisa:
1. Los logs de la consola del navegador
2. Los logs del servidor Next.js
3. Los logs de Supabase en el dashboard