-- =====================================================
-- CONFIGURACIÓN DE RLS PARA TABLA USUARIO
-- =====================================================
-- Ejecuta este script en Supabase SQL Editor
-- para permitir que los usuarios gestionen su propio perfil

-- 1. Habilitar RLS en la tabla usuario (si no está habilitado)
ALTER TABLE usuario ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas existentes (si las hay)
DROP POLICY IF EXISTS "Users can insert own profile" ON usuario;
DROP POLICY IF EXISTS "Users can read own profile" ON usuario;
DROP POLICY IF EXISTS "Users can update own profile" ON usuario;
DROP POLICY IF EXISTS "Public can read profiles" ON usuario;

-- 3. POLÍTICA: Permitir a usuarios autenticados insertar su propio registro
CREATE POLICY "Users can insert own profile"
ON usuario
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = auth_id);

-- 4. POLÍTICA: Permitir a usuarios autenticados leer su propio registro
CREATE POLICY "Users can read own profile"
ON usuario
FOR SELECT
TO authenticated
USING (auth.uid() = auth_id);

-- 5. POLÍTICA: Permitir a usuarios autenticados actualizar su propio registro
CREATE POLICY "Users can update own profile"
ON usuario
FOR UPDATE
TO authenticated
USING (auth.uid() = auth_id)
WITH CHECK (auth.uid() = auth_id);

-- 6. POLÍTICA OPCIONAL: Permitir lectura pública de perfiles (si necesitas mostrar vendedores/organizadores)
-- Descomenta la siguiente política si quieres que todos puedan ver los perfiles
/*
CREATE POLICY "Public can read profiles"
ON usuario
FOR SELECT
TO public
USING (true);
*/

-- 7. Verificar que las políticas se crearon correctamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'usuario';
