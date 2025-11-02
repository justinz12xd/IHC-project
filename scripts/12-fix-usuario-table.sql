-- =====================================================
-- ARREGLAR TABLA USUARIO - password_hash nullable
-- =====================================================
-- La contraseña se guarda en auth.users, no en la tabla usuario
-- Por lo tanto password_hash debe ser nullable

-- Hacer password_hash nullable
ALTER TABLE usuario 
ALTER COLUMN password_hash DROP NOT NULL;

-- Establecer valor por defecto
ALTER TABLE usuario 
ALTER COLUMN password_hash SET DEFAULT NULL;

-- Actualizar registros existentes que tengan password_hash vacío
UPDATE usuario 
SET password_hash = NULL 
WHERE password_hash = '' OR password_hash = 'STORED_IN_AUTH_TABLE';

-- Verificar estructura de la tabla
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'usuario'
ORDER BY ordinal_position;
