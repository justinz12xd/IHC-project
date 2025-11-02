-- =====================================================
-- OPCIÓN TEMPORAL: DESHABILITAR RLS (SOLO DESARROLLO)
-- =====================================================
-- ⚠️ ADVERTENCIA: Esto permite acceso completo a todos los usuarios
-- Solo usa esto en desarrollo para debugging
-- NUNCA en producción

-- Deshabilitar RLS en la tabla usuario
ALTER TABLE usuario DISABLE ROW LEVEL SECURITY;

-- Para volver a habilitarlo después:
-- ALTER TABLE usuario ENABLE ROW LEVEL SECURITY;

-- Verificar estado de RLS
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'usuario';
