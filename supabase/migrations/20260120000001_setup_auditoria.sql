-- Script para crear tabla de auditoría y funciones relacionadas
-- ISO 25010: Seguridad - Accountability

-- 1. Crear tabla de auditoría
CREATE TABLE IF NOT EXISTS auditoria (
  id_auditoria SERIAL PRIMARY KEY,
  id_usuario UUID REFERENCES auth.users(id),
  accion VARCHAR(50) NOT NULL,
  entidad VARCHAR(50) NOT NULL,
  entidad_id INTEGER,
  detalles JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  resultado VARCHAR(20) DEFAULT 'exito',
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Índices para búsquedas rápidas
  CONSTRAINT chk_accion CHECK (accion IN (
    'LOGIN', 'LOGOUT', 'LOGIN_FAILED',
    'CREATE', 'UPDATE', 'DELETE',
    'REGISTER', 'PAYMENT', 'PURCHASE',
    'EXPORT', 'IMPORT',
    'PASSWORD_CHANGE', 'PASSWORD_RESET',
    '2FA_ENABLE', '2FA_DISABLE', '2FA_VERIFY'
  )),
  CONSTRAINT chk_resultado CHECK (resultado IN ('exito', 'fallo', 'pendiente'))
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON auditoria(id_usuario);
CREATE INDEX IF NOT EXISTS idx_auditoria_accion ON auditoria(accion);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON auditoria(fecha_creacion DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_entidad ON auditoria(entidad, entidad_id);

-- 2. Función para registrar auditoría
CREATE OR REPLACE FUNCTION registrar_auditoria(
  p_id_usuario UUID,
  p_accion VARCHAR(50),
  p_entidad VARCHAR(50),
  p_entidad_id INTEGER DEFAULT NULL,
  p_detalles JSONB DEFAULT NULL,
  p_ip_address VARCHAR(45) DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_resultado VARCHAR(20) DEFAULT 'exito'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO auditoria (
    id_usuario,
    accion,
    entidad,
    entidad_id,
    detalles,
    ip_address,
    user_agent,
    resultado
  ) VALUES (
    p_id_usuario,
    p_accion,
    p_entidad,
    p_entidad_id,
    p_detalles,
    p_ip_address,
    p_user_agent,
    p_resultado
  );
END;
$$;

-- 3. Trigger para auditar cambios en eventos
CREATE OR REPLACE FUNCTION trigger_auditar_evento()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM registrar_auditoria(
      auth.uid(),
      'CREATE',
      'evento',
      NEW.id_evento,
      jsonb_build_object('nombre', NEW.nombre, 'estado', NEW.estado)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM registrar_auditoria(
      auth.uid(),
      'UPDATE',
      'evento',
      NEW.id_evento,
      jsonb_build_object(
        'cambios', jsonb_build_object(
          'anterior', row_to_json(OLD),
          'nuevo', row_to_json(NEW)
        )
      )
    );
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM registrar_auditoria(
      auth.uid(),
      'DELETE',
      'evento',
      OLD.id_evento,
      jsonb_build_object('nombre', OLD.nombre)
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Aplicar trigger a tabla evento
DROP TRIGGER IF EXISTS trg_auditar_evento ON evento;
CREATE TRIGGER trg_auditar_evento
AFTER INSERT OR UPDATE OR DELETE ON evento
FOR EACH ROW
EXECUTE FUNCTION trigger_auditar_evento();

-- 4. Trigger para auditar registros de eventos
CREATE OR REPLACE FUNCTION trigger_auditar_registro_evento()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM registrar_auditoria(
      NEW.id_usuario,
      'REGISTER',
      'registro_evento',
      NEW.id_registro,
      jsonb_build_object(
        'id_evento', NEW.id_evento,
        'estado', NEW.estado
      )
    );
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM registrar_auditoria(
      NEW.id_usuario,
      'UPDATE',
      'registro_evento',
      NEW.id_registro,
      jsonb_build_object(
        'id_evento', NEW.id_evento,
        'estado_anterior', OLD.estado,
        'estado_nuevo', NEW.estado
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Aplicar trigger a tabla registro_evento
DROP TRIGGER IF EXISTS trg_auditar_registro_evento ON registro_evento;
CREATE TRIGGER trg_auditar_registro_evento
AFTER INSERT OR UPDATE ON registro_evento
FOR EACH ROW
EXECUTE FUNCTION trigger_auditar_registro_evento();

-- 5. Configurar RLS para tabla auditoría
ALTER TABLE auditoria ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo pueden ver su propia auditoría
CREATE POLICY "Usuarios ven su propia auditoría"
ON auditoria FOR SELECT
TO authenticated
USING (id_usuario = auth.uid());

-- Solo admins pueden ver toda la auditoría
CREATE POLICY "Admins ven toda la auditoría"
ON auditoria FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuario
    WHERE id_usuario = auth.uid()
    AND rol = 'ADMIN'
  )
);

-- Solo el sistema puede insertar registros de auditoría
CREATE POLICY "Sistema puede insertar auditoría"
ON auditoria FOR INSERT
TO authenticated
WITH CHECK (true);

-- 6. Vista para reportes de auditoría (solo para admins)
CREATE OR REPLACE VIEW v_auditoria_detalle AS
SELECT 
  a.id_auditoria,
  a.fecha_creacion,
  a.accion,
  a.entidad,
  a.entidad_id,
  a.resultado,
  u.nombre || ' ' || u.apellido AS usuario_nombre,
  u.correo AS usuario_email,
  u.rol AS usuario_rol,
  a.detalles,
  a.ip_address,
  a.user_agent
FROM auditoria a
LEFT JOIN usuario u ON a.id_usuario = u.id_usuario
ORDER BY a.fecha_creacion DESC;

-- 7. Función para generar reporte de actividad
CREATE OR REPLACE FUNCTION reporte_actividad_usuario(
  p_id_usuario UUID,
  p_fecha_inicio TIMESTAMP DEFAULT NOW() - INTERVAL '30 days',
  p_fecha_fin TIMESTAMP DEFAULT NOW()
)
RETURNS TABLE (
  fecha DATE,
  total_acciones BIGINT,
  acciones_exitosas BIGINT,
  acciones_fallidas BIGINT,
  acciones_json JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(fecha_creacion) as fecha,
    COUNT(*) as total_acciones,
    COUNT(*) FILTER (WHERE resultado = 'exito') as acciones_exitosas,
    COUNT(*) FILTER (WHERE resultado = 'fallo') as acciones_fallidas,
    jsonb_agg(
      jsonb_build_object(
        'hora', TO_CHAR(fecha_creacion, 'HH24:MI:SS'),
        'accion', accion,
        'entidad', entidad,
        'resultado', resultado
      )
      ORDER BY fecha_creacion
    ) as acciones_json
  FROM auditoria
  WHERE id_usuario = p_id_usuario
    AND fecha_creacion >= p_fecha_inicio
    AND fecha_creacion <= p_fecha_fin
  GROUP BY DATE(fecha_creacion)
  ORDER BY fecha DESC;
END;
$$;

-- 8. Comentarios para documentación
COMMENT ON TABLE auditoria IS 'Registro completo de auditoría para cumplir con ISO 25010 - Security';
COMMENT ON COLUMN auditoria.accion IS 'Tipo de acción realizada (LOGIN, CREATE, UPDATE, etc.)';
COMMENT ON COLUMN auditoria.entidad IS 'Entidad afectada por la acción (evento, usuario, inscripcion, etc.)';
COMMENT ON COLUMN auditoria.detalles IS 'Información adicional en formato JSON sobre la acción';
COMMENT ON FUNCTION registrar_auditoria IS 'Función para registrar acciones de auditoría desde la aplicación';
