-- =====================================================
-- DIAGNÓSTICO DE USUARIOS
-- =====================================================
-- Este script te ayuda a verificar el estado de los usuarios

-- 1. Ver todos los usuarios en auth.users
SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data->>'nombre' as nombre,
  raw_user_meta_data->>'apellido' as apellido,
  raw_user_meta_data->>'rol' as rol
FROM auth.users
ORDER BY created_at DESC;

-- 2. Ver todos los usuarios en la tabla usuario
SELECT 
  auth_id,
  correo,
  nombre,
  apellido,
  rol,
  estado,
  fecha_registro
FROM usuario
ORDER BY fecha_registro DESC;

-- 3. Ver usuarios que están en auth.users pero NO en usuario
SELECT 
  au.id as auth_id,
  au.email,
  au.created_at,
  au.raw_user_meta_data->>'nombre' as nombre,
  au.raw_user_meta_data->>'rol' as rol,
  CASE WHEN u.auth_id IS NULL THEN 'NO EXISTE EN TABLA' ELSE 'EXISTE' END as status
FROM auth.users au
LEFT JOIN usuario u ON au.id = u.auth_id
ORDER BY au.created_at DESC;

-- 4. Contar usuarios
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_en_auth,
  (SELECT COUNT(*) FROM usuario) as total_en_usuario,
  (SELECT COUNT(*) FROM auth.users au LEFT JOIN usuario u ON au.id = u.auth_id WHERE u.auth_id IS NULL) as faltantes;

-- 5. Ver estado de RLS
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables
WHERE tablename = 'usuario';

-- 6. Ver políticas de RLS
SELECT 
  policyname,
  cmd,
  roles,
  qual::text as using_expression,
  with_check::text as check_expression
FROM pg_policies 
WHERE tablename = 'usuario';

-- 7. Ver triggers en la tabla auth.users
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND event_object_schema = 'auth';
