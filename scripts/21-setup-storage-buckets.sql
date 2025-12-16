-- =====================================================
-- CONFIGURACIÓN DE STORAGE BUCKETS PARA IMÁGENES
-- =====================================================

-- Crear bucket para fotos de productos de vendedores
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

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
