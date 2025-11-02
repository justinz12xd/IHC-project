-- =====================================================
-- CONFIGURACIÓN SIMPLE DE RLS PARA DESARROLLO
-- =====================================================
-- Este script configura RLS de manera muy permisiva
-- para facilitar el desarrollo y debugging

-- Habilitar RLS
ALTER TABLE usuario ENABLE ROW LEVEL SECURITY;

-- Eliminar todas las políticas existentes
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'usuario') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON usuario';
    END LOOP;
END $$;

-- Política 1: Permitir a usuarios autenticados INSERTAR su propio perfil
CREATE POLICY "authenticated_insert_own"
ON usuario
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = auth_id);

-- Política 2: Permitir a TODOS los usuarios autenticados LEER cualquier perfil
CREATE POLICY "authenticated_select_all"
ON usuario
FOR SELECT
TO authenticated
USING (true);

-- Política 3: Permitir a usuarios autenticados ACTUALIZAR solo su propio perfil
CREATE POLICY "authenticated_update_own"
ON usuario
FOR UPDATE
TO authenticated
USING (auth.uid() = auth_id)
WITH CHECK (auth.uid() = auth_id);

-- Política 4: Permitir a usuarios autenticados ELIMINAR solo su propio perfil
CREATE POLICY "authenticated_delete_own"
ON usuario
FOR DELETE
TO authenticated
USING (auth.uid() = auth_id);

-- Verificar políticas creadas
SELECT 
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'usuario'
ORDER BY policyname;

-- Verificar que RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'usuario';
