-- =====================================================
-- DIAGNÓSTICO DE PRODUCTOS Y USUARIOS
-- =====================================================

-- 1. Ver tu usuario actual en auth.users
SELECT 
  '=== Usuario en Auth ===' as seccion,
  au.id as auth_id,
  au.email,
  au.raw_user_meta_data->>'nombre' as nombre_metadata,
  au.raw_user_meta_data->>'apellido' as apellido_metadata,
  au.raw_user_meta_data->>'rol' as rol_metadata
FROM auth.users au
WHERE au.email = (SELECT email FROM auth.users ORDER BY created_at DESC LIMIT 1);

-- 2. Ver tu usuario en la tabla usuario
SELECT 
  '=== Usuario en Tabla Usuario ===' as seccion,
  u.id_usuario,
  u.auth_id,
  u.nombre,
  u.apellido,
  u.correo,
  u.rol,
  u.estado
FROM usuario u
WHERE u.auth_id = (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1);

-- 3. Ver si tienes registro en la tabla vendedor
SELECT 
  '=== Datos de Vendedor ===' as seccion,
  v.id_vendedor,
  v.bio,
  v.historia,
  v.nivel_confianza,
  u.nombre as nombre_usuario,
  u.correo
FROM vendedor v
INNER JOIN usuario u ON v.id_vendedor = u.id_usuario
WHERE u.auth_id = (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1);

-- 4. Ver todos los productos (si no existe vendedor, no hay productos vinculados)
SELECT 
  '=== Productos en BD ===' as seccion,
  p.id_producto,
  p.nombre,
  p.descripcion,
  p.precio_unitario,
  p.stock_inicial,
  p.categoria,
  p.id_vendedor,
  u.nombre as nombre_vendedor,
  u.correo as correo_vendedor
FROM producto p
LEFT JOIN usuario u ON p.id_vendedor = u.id_usuario
ORDER BY p.fecha_creacion DESC
LIMIT 10;

-- 5. Ver productos del último usuario creado
SELECT 
  '=== Productos del último usuario ===' as seccion,
  p.id_producto,
  p.nombre,
  p.descripcion,
  p.precio_unitario,
  p.stock_inicial,
  p.categoria,
  p.id_vendedor
FROM producto p
WHERE p.id_vendedor = (
  SELECT u.id_usuario 
  FROM usuario u 
  WHERE u.auth_id = (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1)
);

-- 6. Contar productos por vendedor
SELECT 
  '=== Resumen de productos por vendedor ===' as seccion,
  u.id_usuario,
  u.nombre,
  u.apellido,
  u.correo,
  u.rol,
  COUNT(p.id_producto) as cantidad_productos
FROM usuario u
LEFT JOIN producto p ON u.id_usuario = p.id_vendedor
WHERE u.rol = 'VENDEDOR'
GROUP BY u.id_usuario, u.nombre, u.apellido, u.correo, u.rol
ORDER BY cantidad_productos DESC;

-- 7. Ver usuarios que NO tienen productos pero son vendedores
SELECT 
  '=== Vendedores sin productos ===' as seccion,
  u.id_usuario,
  u.nombre,
  u.apellido,
  u.correo,
  u.auth_id
FROM usuario u
LEFT JOIN producto p ON u.id_usuario = p.id_vendedor
WHERE u.rol = 'VENDEDOR' AND p.id_producto IS NULL;
