-- Script mejorado para crear el trigger de perfiles con mejor manejo de errores
-- Ejecuta este script en tu consola SQL de Supabase

-- Función mejorada para crear perfiles automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Intentar crear el perfil
  BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'normal')
    );
  EXCEPTION
    WHEN unique_violation THEN
      -- El perfil ya existe, no hacer nada
      NULL;
    WHEN OTHERS THEN
      -- Log el error pero no fallar la creación del usuario
      RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recrear el trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función mejorada para crear perfiles de vendor
CREATE OR REPLACE FUNCTION public.handle_new_vendor()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo crear perfil de vendor si el rol es 'vendor'
  IF NEW.role = 'vendor' THEN
    BEGIN
      INSERT INTO public.vendors (user_id, business_name, description)
      VALUES (
        NEW.id,
        COALESCE(NEW.full_name, 'Mi Negocio'),
        'Descripción pendiente'
      );
    EXCEPTION
      WHEN unique_violation THEN
        -- El perfil de vendor ya existe, no hacer nada
        NULL;
      WHEN OTHERS THEN
        -- Log el error pero no fallar
        RAISE WARNING 'Failed to create vendor profile for user %: %', NEW.id, SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recrear el trigger para vendors
DROP TRIGGER IF EXISTS on_profile_vendor_created ON profiles;
CREATE TRIGGER on_profile_vendor_created
  AFTER INSERT OR UPDATE OF role ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_vendor();

-- Verificar que todo está funcionando
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
  AND trigger_name IN ('on_auth_user_created', 'on_profile_vendor_created');