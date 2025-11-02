-- =====================================================
-- ARREGLAR RLS PARA TABLA USUARIO - Versión Simplificada
-- =====================================================
-- Este script soluciona el error 406 al acceder a la tabla usuario

-- 1. Deshabilitar RLS temporalmente para debugging (SOLO EN DESARROLLO)
-- ⚠️ CUIDADO: Esto permite acceso completo a la tabla
-- ALTER TABLE usuario DISABLE ROW LEVEL SECURITY;

-- 2. O mejor: Crear políticas más permisivas
ALTER TABLE usuario ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Users can insert own profile" ON usuario;
DROP POLICY IF EXISTS "Users can read own profile" ON usuario;
DROP POLICY IF EXISTS "Users can update own profile" ON usuario;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON usuario;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON usuario;
DROP POLICY IF EXISTS "Enable update for own profile" ON usuario;

-- Crear políticas más simples y permisivas
CREATE POLICY "Enable read access for authenticated users"
ON usuario
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON usuario
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "Enable update for own profile"
ON usuario
FOR UPDATE
TO authenticated
USING (auth.uid() = auth_id);

-- Verificar políticas
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename = 'usuario';
