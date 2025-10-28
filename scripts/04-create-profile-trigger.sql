-- Function to automatically create a profile when a user signs up
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also create vendor profile if role is vendor
CREATE OR REPLACE FUNCTION public.handle_new_vendor()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'vendor' THEN
    INSERT INTO public.vendors (user_id, business_name, description)
    VALUES (
      NEW.id,
      COALESCE(NEW.full_name, 'Mi Negocio'),
      'Descripción pendiente'
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create vendor profile when role is set to vendor
DROP TRIGGER IF EXISTS on_profile_vendor_created ON profiles;
CREATE TRIGGER on_profile_vendor_created
  AFTER INSERT OR UPDATE OF role ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_vendor();
