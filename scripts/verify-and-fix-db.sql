-- Script para verificar y reparar la configuración de la base de datos
-- Ejecuta este script en tu consola SQL de Supabase

-- 1. Verificar que las tablas existen
SELECT 
  schemaname,
  tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'vendors', 'events', 'products', 'event_vendors', 'event_registrations', 'inventory', 'sales', 'vendor_event_history')
ORDER BY tablename;

-- 2. Verificar que los triggers existen
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
  AND trigger_name IN ('on_auth_user_created', 'on_profile_vendor_created')
ORDER BY trigger_name;

-- 3. Verificar que las políticas RLS están habilitadas
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'vendors', 'events', 'products', 'event_vendors', 'event_registrations', 'inventory', 'sales', 'vendor_event_history')
ORDER BY tablename;

-- 4. Verificar políticas existentes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. Si necesitas recrear el trigger para perfiles (ejecuta solo si no existe)
-- Descomenta las siguientes líneas si el trigger no existe:

/*
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'normal')
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
*/

-- 6. Verificar que el enum user_role existe
SELECT 
  t.typname,
  e.enumlabel
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'user_role'
ORDER BY e.enumsortorder;

-- 7. Verificar extensiones necesarias
SELECT 
  name,
  default_version,
  installed_version
FROM pg_available_extensions 
WHERE name IN ('uuid-ossp');