-- =====================================================
-- DIAGNÓSTICO COMPLETO DEL SISTEMA DE REGISTRO
-- =====================================================

-- 1. Ver si RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'usuario';

-- 2. Ver todas las políticas RLS (debería estar vacío si las deshabilitaste)
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'usuario';

-- 3. Verificar que el trigger existe y está activo
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing,
  trigger_schema
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 4. Ver la definición de la función del trigger
SELECT 
  routine_name,
  routine_type,
  data_type,
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';

-- 5. Ver estructura de la tabla usuario
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'usuario'
ORDER BY ordinal_position;

-- 6. Ver constraints de la tabla
SELECT
  tc.constraint_name,
  tc.constraint_type,
  tc.table_name,
  kcu.column_name,
  cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.check_constraints cc
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'usuario'
ORDER BY tc.constraint_type, tc.constraint_name;

-- 7. Comparar usuarios en auth.users vs usuario
SELECT 
  'En auth.users' as ubicacion,
  COUNT(*) as cantidad
FROM auth.users
UNION ALL
SELECT 
  'En tabla usuario' as ubicacion,
  COUNT(*) as cantidad
FROM usuario
UNION ALL
SELECT 
  'Solo en auth.users (sin sincronizar)' as ubicacion,
  COUNT(*) as cantidad
FROM auth.users au
LEFT JOIN usuario u ON au.id = u.auth_id
WHERE u.auth_id IS NULL;

-- 8. Ver últimos usuarios creados en auth.users
SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data->>'nombre' as nombre_metadata,
  raw_user_meta_data->>'apellido' as apellido_metadata,
  raw_user_meta_data->>'rol' as rol_metadata
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 9. Ver últimos usuarios en tabla usuario
SELECT 
  id_usuario,
  auth_id,
  nombre,
  apellido,
  correo,
  rol,
  estado,
  fecha_registro
FROM usuario
ORDER BY fecha_registro DESC
LIMIT 5;

-- 10. Ver usuarios que están en auth pero NO en usuario
SELECT 
  au.id as auth_id,
  au.email,
  au.created_at,
  au.raw_user_meta_data->>'nombre' as nombre,
  au.raw_user_meta_data->>'apellido' as apellido,
  au.raw_user_meta_data->>'rol' as rol
FROM auth.users au
LEFT JOIN usuario u ON au.id = u.auth_id
WHERE u.auth_id IS NULL
ORDER BY au.created_at DESC;

SELECT '=== Diagnóstico completado ===' as status;
