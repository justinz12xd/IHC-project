-- =====================================================
-- CONFIGURACIÓN DE STORAGE BUCKETS PARA IMÁGENES
-- =====================================================

-- Crear bucket para fotos de productos de vendedores
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products', 
  'products', 
  true,
  5242880, -- 5MB en bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png']
)
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png'];

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Vendedores pueden subir fotos de productos" ON storage.objects;
DROP POLICY IF EXISTS "Cualquiera puede ver fotos de productos" ON storage.objects;
DROP POLICY IF EXISTS "Vendedores pueden actualizar sus fotos" ON storage.objects;
DROP POLICY IF EXISTS "Vendedores pueden eliminar sus fotos" ON storage.objects;

-- Políticas para el bucket de productos
-- Permitir subida de imágenes solo a usuarios autenticados con rol de vendedor
CREATE POLICY "Vendedores pueden subir fotos de productos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'products' 
  AND (storage.foldername(name))[1] = 'vendor-products'
  AND EXISTS (
    SELECT 1 FROM public.usuario u
    WHERE u.auth_id = auth.uid()
    AND u.rol = 'VENDEDOR'
  )
);

-- Permitir que todos vean las imágenes (bucket público)
CREATE POLICY "Cualquiera puede ver fotos de productos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products');

-- Permitir que vendedores actualicen sus propias imágenes
CREATE POLICY "Vendedores pueden actualizar sus fotos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'products'
  AND (storage.foldername(name))[1] = 'vendor-products'
  AND EXISTS (
    SELECT 1 FROM public.usuario u
    WHERE u.auth_id = auth.uid()
    AND u.rol = 'VENDEDOR'
  )
);

-- Permitir que vendedores eliminen sus propias imágenes
CREATE POLICY "Vendedores pueden eliminar sus fotos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'products'
  AND (storage.foldername(name))[1] = 'vendor-products'
  AND EXISTS (
    SELECT 1 FROM public.usuario u
    WHERE u.auth_id = auth.uid()
    AND u.rol = 'VENDEDOR'
  )
);
