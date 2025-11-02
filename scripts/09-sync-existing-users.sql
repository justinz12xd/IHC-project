-- =====================================================
-- SINCRONIZAR USUARIOS EXISTENTES
-- =====================================================
-- Este script crea registros en la tabla 'usuario' para
-- todos los usuarios que ya existen en auth.users pero
-- no tienen registro en la tabla usuario

-- Insertar usuarios que faltan
INSERT INTO public.usuario (auth_id, correo, nombre, apellido, rol, estado, password_hash)
SELECT 
  au.id as auth_id,
  au.email as correo,
  COALESCE(au.raw_user_meta_data->>'nombre', split_part(au.email, '@', 1)) as nombre,
  COALESCE(au.raw_user_meta_data->>'apellido', '') as apellido,
  -- Mapear el rol correctamente a MAYÚSCULAS
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

-- Verificar cuántos usuarios se sincronizaron
SELECT 
  COUNT(*) as total_usuarios,
  COUNT(CASE WHEN u.auth_id IS NOT NULL THEN 1 END) as usuarios_con_perfil,
  COUNT(CASE WHEN u.auth_id IS NULL THEN 1 END) as usuarios_sin_perfil
FROM auth.users au
LEFT JOIN public.usuario u ON au.id = u.auth_id;
