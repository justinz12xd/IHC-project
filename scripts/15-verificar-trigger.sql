-- =====================================================
-- VERIFICAR ESTADO DEL TRIGGER
-- =====================================================

-- Ver si el trigger existe y está activo
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Ver la función del trigger
SELECT 
  p.proname as function_name,
  pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'handle_new_user';

-- Probar manualmente el mapeo de roles
SELECT 
  CASE 
    WHEN 'vendor' = 'vendor' THEN 'VENDEDOR'
    WHEN 'vendor' = 'organizer' THEN 'ORGANIZADOR'
    WHEN 'vendor' = 'admin' THEN 'ADMIN'
    WHEN 'vendor' = 'normal' THEN 'ASISTENTE'
    ELSE 'ASISTENTE'
  END as rol_mapeado;

-- Ver últimos usuarios creados en auth.users
SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data->>'rol' as rol_metadata,
  raw_user_meta_data->>'nombre' as nombre_metadata
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- Ver últimos usuarios en la tabla usuario
SELECT 
  auth_id,
  correo,
  nombre,
  apellido,
  rol,
  estado,
  fecha_registro
FROM usuario
ORDER BY fecha_registro DESC
LIMIT 5;
