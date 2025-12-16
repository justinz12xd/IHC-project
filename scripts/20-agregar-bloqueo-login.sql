-- Agregar campos para control de intentos de login
-- Este script agrega las columnas necesarias para implementar el bloqueo de cuenta

-- Agregar columnas a la tabla usuario
ALTER TABLE usuario
ADD COLUMN IF NOT EXISTS intentos_fallidos INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS bloqueado_hasta TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS ultimo_intento_fallido TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Crear índice para optimizar consultas de usuarios bloqueados
CREATE INDEX IF NOT EXISTS idx_usuario_bloqueado ON usuario(bloqueado_hasta) WHERE bloqueado_hasta IS NOT NULL;

-- Comentarios para documentación
COMMENT ON COLUMN usuario.intentos_fallidos IS 'Número de intentos fallidos consecutivos de inicio de sesión';
COMMENT ON COLUMN usuario.bloqueado_hasta IS 'Fecha y hora hasta la cual la cuenta está bloqueada';
COMMENT ON COLUMN usuario.ultimo_intento_fallido IS 'Fecha y hora del último intento fallido de inicio de sesión';

-- Ver estructura actualizada
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'usuario' 
AND column_name IN ('intentos_fallidos', 'bloqueado_hasta', 'ultimo_intento_fallido');
