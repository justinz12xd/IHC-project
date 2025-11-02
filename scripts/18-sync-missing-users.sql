-- =====================================================
-- SINCRONIZAR USUARIOS FALTANTES
-- =====================================================
-- Este script sincroniza usuarios que están en auth.users
-- pero no en la tabla usuario

-- 1. Primero, ver cuántos usuarios faltan por sincronizar
SELECT 
  COUNT(*) as usuarios_sin_sincronizar,
  'Usuarios que están en auth.users pero NO en usuario' as descripcion
FROM auth.users au
LEFT JOIN usuario u ON au.id = u.auth_id
WHERE u.auth_id IS NULL;

-- 2. Ver detalles de los usuarios que faltan
SELECT 
  au.id,
  au.email,
  au.created_at,
  au.raw_user_meta_data->>'nombre' as nombre,
  au.raw_user_meta_data->>'apellido' as apellido,
  au.raw_user_meta_data->>'rol' as rol
FROM auth.users au
LEFT JOIN usuario u ON au.id = u.auth_id
WHERE u.auth_id IS NULL
ORDER BY au.created_at DESC;

-- 3. Sincronizar usuarios faltantes
INSERT INTO public.usuario (auth_id, correo, nombre, apellido, rol, estado, password_hash)
SELECT 
  au.id,
  au.email,
  COALESCE(
    NULLIF(TRIM(au.raw_user_meta_data->>'nombre'), ''),
    split_part(au.email, '@', 1),
    'Usuario'
  ) as nombre,
  COALESCE(
    NULLIF(TRIM(au.raw_user_meta_data->>'apellido'), ''),
    '-'
  ) as apellido,
  CASE 
    WHEN au.raw_user_meta_data->>'rol' = 'vendor' THEN 'VENDEDOR'
    WHEN au.raw_user_meta_data->>'rol' = 'organizer' THEN 'ORGANIZADOR'
    WHEN au.raw_user_meta_data->>'rol' = 'admin' THEN 'ADMIN'
    WHEN au.raw_user_meta_data->>'rol' = 'normal' THEN 'ASISTENTE'
    WHEN UPPER(au.raw_user_meta_data->>'rol') = 'VENDEDOR' THEN 'VENDEDOR'
    WHEN UPPER(au.raw_user_meta_data->>'rol') = 'ORGANIZADOR' THEN 'ORGANIZADOR'
    WHEN UPPER(au.raw_user_meta_data->>'rol') = 'ADMIN' THEN 'ADMIN'
    WHEN UPPER(au.raw_user_meta_data->>'rol') = 'ASISTENTE' THEN 'ASISTENTE'
    ELSE 'ASISTENTE'
  END as rol,
  'activo' as estado,
  NULL as password_hash
FROM auth.users au
LEFT JOIN usuario u ON au.id = u.auth_id
WHERE u.auth_id IS NULL
ON CONFLICT (auth_id) DO UPDATE SET
  correo = EXCLUDED.correo,
  nombre = EXCLUDED.nombre,
  apellido = EXCLUDED.apellido,
  rol = EXCLUDED.rol;

-- 4. Verificar que se sincronizaron
SELECT 
  'Usuarios sincronizados' as descripcion,
  COUNT(*) as cantidad
FROM usuario;

-- 5. Verificar que ya no hay usuarios sin sincronizar
SELECT 
  COUNT(*) as usuarios_sin_sincronizar,
  'Después de la sincronización' as descripcion
FROM auth.users au
LEFT JOIN usuario u ON au.id = u.auth_id
WHERE u.auth_id IS NULL;

-- 6. Ver los últimos usuarios sincronizados
SELECT 
  u.id_usuario,
  u.auth_id,
  u.nombre,
  u.apellido,
  u.correo,
  u.rol,
  u.estado,
  u.fecha_registro
FROM usuario u
ORDER BY u.fecha_registro DESC
LIMIT 10;

SELECT '=== Sincronización completada ===' as status;
