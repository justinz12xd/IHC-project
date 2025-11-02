-- =====================================================
-- CONFIGURACIÓN COMPLETA - EJECUTAR EN ORDEN
-- =====================================================
-- Este script configura todo lo necesario para que funcione
-- el sistema de autenticación con la tabla usuario

-- PASO 1: Arreglar la tabla usuario (password_hash nullable)
ALTER TABLE usuario 
ALTER COLUMN password_hash DROP NOT NULL;

ALTER TABLE usuario 
ALTER COLUMN password_hash SET DEFAULT NULL;

-- PASO 2: Habilitar RLS
ALTER TABLE usuario ENABLE ROW LEVEL SECURITY;

-- PASO 3: Eliminar políticas existentes
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'usuario') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON usuario';
    END LOOP;
END $$;

-- PASO 4: Crear políticas RLS permisivas
CREATE POLICY "authenticated_insert_own"
ON usuario FOR INSERT TO authenticated
WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "authenticated_select_all"
ON usuario FOR SELECT TO authenticated
USING (true);

CREATE POLICY "authenticated_update_own"
ON usuario FOR UPDATE TO authenticated
USING (auth.uid() = auth_id)
WITH CHECK (auth.uid() = auth_id);

-- PASO 5: Crear/actualizar trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_rol text;
BEGIN
  v_rol := CASE 
    WHEN NEW.raw_user_meta_data->>'rol' = 'vendor' THEN 'VENDEDOR'
    WHEN NEW.raw_user_meta_data->>'rol' = 'organizer' THEN 'ORGANIZADOR'
    WHEN NEW.raw_user_meta_data->>'rol' = 'admin' THEN 'ADMIN'
    WHEN NEW.raw_user_meta_data->>'rol' = 'normal' THEN 'ASISTENTE'
    WHEN UPPER(NEW.raw_user_meta_data->>'rol') = 'VENDEDOR' THEN 'VENDEDOR'
    WHEN UPPER(NEW.raw_user_meta_data->>'rol') = 'ORGANIZADOR' THEN 'ORGANIZADOR'
    WHEN UPPER(NEW.raw_user_meta_data->>'rol') = 'ADMIN' THEN 'ADMIN'
    WHEN UPPER(NEW.raw_user_meta_data->>'rol') = 'ASISTENTE' THEN 'ASISTENTE'
    ELSE 'ASISTENTE'
  END;

  INSERT INTO public.usuario (auth_id, correo, nombre, apellido, rol, estado, password_hash)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'apellido', ''),
    v_rol,
    'activo',
    NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- PASO 6: Sincronizar usuarios existentes
INSERT INTO public.usuario (auth_id, correo, nombre, apellido, rol, estado, password_hash)
SELECT 
  au.id as auth_id,
  au.email as correo,
  COALESCE(au.raw_user_meta_data->>'nombre', split_part(au.email, '@', 1)) as nombre,
  COALESCE(au.raw_user_meta_data->>'apellido', '') as apellido,
  CASE 
    WHEN au.raw_user_meta_data->>'rol' = 'admin' THEN 'ADMIN'
    WHEN au.raw_user_meta_data->>'rol' = 'vendor' THEN 'VENDEDOR'
    WHEN au.raw_user_meta_data->>'rol' = 'organizer' THEN 'ORGANIZADOR'
    WHEN au.raw_user_meta_data->>'rol' = 'normal' THEN 'ASISTENTE'
    WHEN UPPER(au.raw_user_meta_data->>'rol') = 'ADMIN' THEN 'ADMIN'
    WHEN UPPER(au.raw_user_meta_data->>'rol') = 'VENDEDOR' THEN 'VENDEDOR'
    WHEN UPPER(au.raw_user_meta_data->>'rol') = 'ORGANIZADOR' THEN 'ORGANIZADOR'
    WHEN UPPER(au.raw_user_meta_data->>'rol') = 'ASISTENTE' THEN 'ASISTENTE'
    ELSE 'ASISTENTE'
  END as rol,
  'activo' as estado,
  NULL as password_hash
FROM auth.users au
LEFT JOIN public.usuario u ON au.id = u.auth_id
WHERE u.auth_id IS NULL;

-- VERIFICACIÓN FINAL
SELECT 
  'Usuarios en auth.users' as descripcion,
  COUNT(*) as cantidad
FROM auth.users
UNION ALL
SELECT 
  'Usuarios en tabla usuario' as descripcion,
  COUNT(*) as cantidad
FROM usuario
UNION ALL
SELECT 
  'Usuarios sin sincronizar' as descripcion,
  COUNT(*) as cantidad
FROM auth.users au
LEFT JOIN usuario u ON au.id = u.auth_id
WHERE u.auth_id IS NULL;

SELECT 'Configuración completada exitosamente!' as status;
