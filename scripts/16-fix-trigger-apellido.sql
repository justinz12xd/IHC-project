-- =====================================================
-- CORREGIR TRIGGER PARA MANEJAR APELLIDO VACÍO
-- =====================================================
-- Este script actualiza el trigger para usar '-' cuando no hay apellido

-- Actualizar la función del trigger con mejor manejo de errores
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_rol text;
  v_apellido text;
  v_nombre text;
BEGIN
  -- Log para debugging
  RAISE NOTICE 'Trigger ejecutado para usuario: %', NEW.email;
  RAISE NOTICE 'Metadata recibido: %', NEW.raw_user_meta_data::text;

  -- Mapear el rol a español mayúsculas
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

  -- Obtener nombre con validación
  v_nombre := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'nombre'), ''), 
    split_part(NEW.email, '@', 1),
    'Usuario'
  );

  -- Obtener apellido, usar '-' si está vacío o NULL
  v_apellido := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'apellido'), ''), 
    '-'
  );

  RAISE NOTICE 'Intentando insertar: nombre=%, apellido=%, rol=%', v_nombre, v_apellido, v_rol;

  -- Insertar en la tabla usuario
  INSERT INTO public.usuario (auth_id, correo, nombre, apellido, rol, estado, password_hash)
  VALUES (
    NEW.id,
    NEW.email,
    v_nombre,
    v_apellido,
    v_rol,
    'activo',
    NULL
  )
  ON CONFLICT (auth_id) DO UPDATE SET
    correo = EXCLUDED.correo,
    nombre = EXCLUDED.nombre,
    apellido = EXCLUDED.apellido,
    rol = EXCLUDED.rol;
  
  RAISE NOTICE 'Usuario insertado/actualizado exitosamente en tabla usuario';
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log detallado del error
    RAISE WARNING 'ERROR en trigger handle_new_user:';
    RAISE WARNING 'Mensaje: %', SQLERRM;
    RAISE WARNING 'Estado: %', SQLSTATE;
    RAISE WARNING 'Detalle: %', SQLERRM;
    RAISE WARNING 'Email: %', NEW.email;
    RAISE WARNING 'Nombre: %', v_nombre;
    RAISE WARNING 'Apellido: %', v_apellido;
    RAISE WARNING 'Rol: %', v_rol;
    -- No fallar el registro en auth.users
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recrear el trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Verificar que el trigger fue creado
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

SELECT 'Trigger corregido exitosamente! Ahora maneja apellidos vacíos correctamente.' as status;
