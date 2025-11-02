-- =====================================================
-- VER CONSTRAINTS DE LA TABLA USUARIO
-- =====================================================
-- Este script muestra todos los constraints para entender
-- qué valores son válidos

-- Ver todos los constraints de la tabla usuario
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'usuario'::regclass
ORDER BY conname;

-- Ver columnas y sus tipos
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'usuario'
ORDER BY ordinal_position;

-- Ver valores del enum si existe
SELECT 
  t.typname as enum_name,
  e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname LIKE '%rol%' OR t.typname LIKE '%usuario%'
ORDER BY t.typname, e.enumsortorder;
