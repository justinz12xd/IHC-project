-- =====================================================
-- TRIGGER AUTOMÁTICO PARA CREAR PERFIL DE USUARIO
-- =====================================================
-- Este trigger crea automáticamente un registro en la tabla 'usuario'
-- cuando se registra un nuevo usuario en auth.users

-- 1. Crear función que se ejecutará al registrar un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_rol text;
BEGIN
  -- Mapear el rol de inglés a español MAYÚSCULAS
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

  INSERT INTO public.usuario (
    auth_id,
    correo,
    nombre,
    apellido,
    rol,
    estado,
    password_hash
  )
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

-- 2. Crear trigger que ejecuta la función después de insertar en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3. Verificar que el trigger se creó correctamente
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
