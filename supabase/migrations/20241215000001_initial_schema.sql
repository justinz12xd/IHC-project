-- =====================================================
-- MIGRACIÓN COMPLETA PARA SUPABASE LOCAL
-- =====================================================
-- Este script recrea toda la base de datos del proyecto
-- Compatible con Supabase local en Docker
-- 
-- EJECUTAR ESTE ARCHIVO COMPLETO EN EL SQL EDITOR DE SUPABASE STUDIO
-- URL: http://localhost:54323
-- =====================================================

-- PASO 0: Limpiar tablas existentes (si existen)
DROP TABLE IF EXISTS public.venta CASCADE;
DROP TABLE IF EXISTS public.validacion_evento CASCADE;
DROP TABLE IF EXISTS public.asistencia_proveedor CASCADE;
DROP TABLE IF EXISTS public.evidencia CASCADE;
DROP TABLE IF EXISTS public.participacion_vendedor CASCADE;
DROP TABLE IF EXISTS public.registro_evento CASCADE;
DROP TABLE IF EXISTS public.evento_proveedor CASCADE;
DROP TABLE IF EXISTS public.producto CASCADE;
DROP TABLE IF EXISTS public.vendedor CASCADE;
DROP TABLE IF EXISTS public.proveedor CASCADE;
DROP TABLE IF EXISTS public.evento CASCADE;
DROP TABLE IF EXISTS public.usuario CASCADE;

-- PASO 1: Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLA PRINCIPAL: USUARIO
-- =====================================================
CREATE TABLE public.usuario (
  id_usuario uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre character varying NOT NULL,
  apellido character varying NOT NULL,
  correo character varying NOT NULL UNIQUE,
  password_hash text,
  rol character varying NOT NULL CHECK (rol::text = ANY (ARRAY['ADMIN'::character varying, 'ORGANIZADOR'::character varying, 'VENDEDOR'::character varying, 'ASISTENTE'::character varying, 'MODERADOR'::character varying]::text[])),
  fecha_registro timestamp without time zone DEFAULT now(),
  estado character varying DEFAULT 'activo'::character varying,
  auth_id uuid UNIQUE,
  CONSTRAINT usuario_pkey PRIMARY KEY (id_usuario),
  CONSTRAINT usuario_auth_id_fkey FOREIGN KEY (auth_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Índices para usuario
CREATE INDEX idx_usuario_auth_id ON public.usuario(auth_id);
CREATE INDEX idx_usuario_correo ON public.usuario(correo);
CREATE INDEX idx_usuario_rol ON public.usuario(rol);

-- =====================================================
-- TABLA: VENDEDOR (extiende usuario)
-- =====================================================
CREATE TABLE public.vendedor (
  id_vendedor uuid NOT NULL,
  bio text,
  historia text,
  foto_perfil text,
  nivel_confianza numeric DEFAULT 0.0 CHECK (nivel_confianza >= 0 AND nivel_confianza <= 100),
  CONSTRAINT vendedor_pkey PRIMARY KEY (id_vendedor),
  CONSTRAINT vendedor_id_vendedor_fkey FOREIGN KEY (id_vendedor) REFERENCES public.usuario(id_usuario) ON DELETE CASCADE
);

-- =====================================================
-- TABLA: EVENTO
-- =====================================================
CREATE TABLE public.evento (
  id_evento uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre character varying NOT NULL,
  descripcion text,
  fecha_inicio date NOT NULL,
  fecha_fin date NOT NULL,
  lugar character varying,
  capacidad integer CHECK (capacidad >= 0),
  estado character varying DEFAULT 'PENDIENTE'::character varying CHECK (estado::text = ANY (ARRAY['PENDIENTE'::character varying, 'APROBADO'::character varying, 'RECHAZADO'::character varying, 'FINALIZADO'::character varying, 'ACTIVO'::character varying]::text[])),
  id_organizador uuid,
  imagen_url text,
  codigo_qr text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT evento_pkey PRIMARY KEY (id_evento),
  CONSTRAINT evento_id_organizador_fkey FOREIGN KEY (id_organizador) REFERENCES public.usuario(id_usuario) ON DELETE SET NULL
);

-- Índices para evento
CREATE INDEX idx_evento_organizador ON public.evento(id_organizador);
CREATE INDEX idx_evento_estado ON public.evento(estado);
CREATE INDEX idx_evento_fecha_inicio ON public.evento(fecha_inicio);

-- =====================================================
-- TABLA: PROVEEDOR
-- =====================================================
CREATE TABLE public.proveedor (
  id_proveedor uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre character varying NOT NULL,
  tipo_servicio character varying,
  contacto character varying,
  documento_validacion text,
  CONSTRAINT proveedor_pkey PRIMARY KEY (id_proveedor)
);

-- =====================================================
-- TABLA: PRODUCTO
-- =====================================================
CREATE TABLE public.producto (
  id_producto uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre character varying NOT NULL,
  descripcion text,
  precio_unitario numeric NOT NULL CHECK (precio_unitario >= 0::numeric),
  stock_inicial integer NOT NULL CHECK (stock_inicial >= 0),
  categoria character varying,
  id_vendedor uuid NOT NULL,
  imagen_url text,
  activo boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT producto_pkey PRIMARY KEY (id_producto),
  CONSTRAINT producto_id_vendedor_fkey FOREIGN KEY (id_vendedor) REFERENCES public.vendedor(id_vendedor) ON DELETE CASCADE
);

-- Índices para producto
CREATE INDEX idx_producto_vendedor ON public.producto(id_vendedor);
CREATE INDEX idx_producto_categoria ON public.producto(categoria);

-- =====================================================
-- TABLA: EVENTO_PROVEEDOR (relación muchos a muchos)
-- =====================================================
CREATE TABLE public.evento_proveedor (
  id_evento uuid NOT NULL,
  id_proveedor uuid NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT evento_proveedor_pkey PRIMARY KEY (id_evento, id_proveedor),
  CONSTRAINT evento_proveedor_id_evento_fkey FOREIGN KEY (id_evento) REFERENCES public.evento(id_evento) ON DELETE CASCADE,
  CONSTRAINT evento_proveedor_id_proveedor_fkey FOREIGN KEY (id_proveedor) REFERENCES public.proveedor(id_proveedor) ON DELETE CASCADE
);

-- =====================================================
-- TABLA: PARTICIPACION_VENDEDOR
-- =====================================================
CREATE TABLE public.participacion_vendedor (
  id_participacion uuid NOT NULL DEFAULT gen_random_uuid(),
  id_vendedor uuid NOT NULL,
  id_evento uuid NOT NULL,
  estado_aprobacion character varying DEFAULT 'PENDIENTE'::character varying CHECK (estado_aprobacion::text = ANY (ARRAY['PENDIENTE'::character varying, 'APROBADO'::character varying, 'RECHAZADO'::character varying]::text[])),
  credencial_url text,
  fecha_aprobacion timestamp without time zone,
  codigo_qr text,
  asistio boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT participacion_vendedor_pkey PRIMARY KEY (id_participacion),
  CONSTRAINT participacion_vendedor_unique_vendedor_evento UNIQUE (id_vendedor, id_evento),
  CONSTRAINT participacion_vendedor_id_vendedor_fkey FOREIGN KEY (id_vendedor) REFERENCES public.vendedor(id_vendedor) ON DELETE CASCADE,
  CONSTRAINT participacion_vendedor_id_evento_fkey FOREIGN KEY (id_evento) REFERENCES public.evento(id_evento) ON DELETE CASCADE
);

-- Índices para participacion_vendedor
CREATE INDEX idx_participacion_vendedor_vendedor ON public.participacion_vendedor(id_vendedor);
CREATE INDEX idx_participacion_vendedor_evento ON public.participacion_vendedor(id_evento);
CREATE INDEX idx_participacion_vendedor_estado ON public.participacion_vendedor(estado_aprobacion);

-- =====================================================
-- TABLA: REGISTRO_EVENTO (usuarios registrados)
-- =====================================================
CREATE TABLE public.registro_evento (
  id_registro uuid NOT NULL DEFAULT gen_random_uuid(),
  id_usuario uuid NOT NULL,
  id_evento uuid NOT NULL,
  fecha_registro timestamp without time zone DEFAULT now(),
  asistio boolean DEFAULT false,
  codigo_qr character varying,
  hora_asistencia timestamp without time zone,
  CONSTRAINT registro_evento_pkey PRIMARY KEY (id_registro),
  CONSTRAINT registro_evento_unique_usuario_evento UNIQUE (id_usuario, id_evento),
  CONSTRAINT registro_evento_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario) ON DELETE CASCADE,
  CONSTRAINT registro_evento_id_evento_fkey FOREIGN KEY (id_evento) REFERENCES public.evento(id_evento) ON DELETE CASCADE
);

-- Índices para registro_evento
CREATE INDEX idx_registro_evento_usuario ON public.registro_evento(id_usuario);
CREATE INDEX idx_registro_evento_evento ON public.registro_evento(id_evento);

-- =====================================================
-- TABLA: ASISTENCIA_PROVEEDOR
-- =====================================================
CREATE TABLE public.asistencia_proveedor (
  id_asistencia uuid NOT NULL DEFAULT gen_random_uuid(),
  id_proveedor uuid NOT NULL,
  id_evento uuid NOT NULL,
  hora_llegada timestamp without time zone DEFAULT now(),
  codigo_qr character varying,
  CONSTRAINT asistencia_proveedor_pkey PRIMARY KEY (id_asistencia),
  CONSTRAINT asistencia_proveedor_id_proveedor_fkey FOREIGN KEY (id_proveedor) REFERENCES public.proveedor(id_proveedor) ON DELETE CASCADE,
  CONSTRAINT asistencia_proveedor_id_evento_fkey FOREIGN KEY (id_evento) REFERENCES public.evento(id_evento) ON DELETE CASCADE
);

-- =====================================================
-- TABLA: EVIDENCIA
-- =====================================================
CREATE TABLE public.evidencia (
  id_evidencia uuid NOT NULL DEFAULT gen_random_uuid(),
  id_evento uuid NOT NULL,
  tipo character varying,
  url_archivo text NOT NULL,
  fecha_subida timestamp without time zone DEFAULT now(),
  CONSTRAINT evidencia_pkey PRIMARY KEY (id_evidencia),
  CONSTRAINT evidencia_id_evento_fkey FOREIGN KEY (id_evento) REFERENCES public.evento(id_evento) ON DELETE CASCADE
);

-- Índices para evidencia
CREATE INDEX idx_evidencia_evento ON public.evidencia(id_evento);

-- =====================================================
-- TABLA: VALIDACION_EVENTO
-- =====================================================
CREATE TABLE public.validacion_evento (
  id_validacion uuid NOT NULL DEFAULT gen_random_uuid(),
  id_evento uuid NOT NULL,
  id_admin uuid NOT NULL,
  etapa character varying CHECK (etapa::text = ANY (ARRAY['DATOS_BÁSICOS'::character varying, 'DOCUMENTAL'::character varying, 'FINAL'::character varying]::text[])),
  resultado character varying CHECK (resultado::text = ANY (ARRAY['APROBADO'::character varying, 'RECHAZADO'::character varying, 'EN_PROCESO'::character varying]::text[])),
  observacion text,
  fecha_validacion timestamp without time zone DEFAULT now(),
  CONSTRAINT validacion_evento_pkey PRIMARY KEY (id_validacion),
  CONSTRAINT validacion_evento_id_evento_fkey FOREIGN KEY (id_evento) REFERENCES public.evento(id_evento) ON DELETE CASCADE,
  CONSTRAINT validacion_evento_id_admin_fkey FOREIGN KEY (id_admin) REFERENCES public.usuario(id_usuario) ON DELETE SET NULL
);

-- Índices para validacion_evento
CREATE INDEX idx_validacion_evento_evento ON public.validacion_evento(id_evento);
CREATE INDEX idx_validacion_evento_admin ON public.validacion_evento(id_admin);

-- =====================================================
-- TABLA: VENTA
-- =====================================================
CREATE TABLE public.venta (
  id_venta uuid NOT NULL DEFAULT gen_random_uuid(),
  id_producto uuid NOT NULL,
  id_evento uuid NOT NULL,
  cantidad integer NOT NULL CHECK (cantidad > 0),
  monto_total numeric DEFAULT 0 CHECK (monto_total >= 0::numeric),
  fecha_venta timestamp without time zone DEFAULT now(),
  CONSTRAINT venta_pkey PRIMARY KEY (id_venta),
  CONSTRAINT venta_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.producto(id_producto) ON DELETE CASCADE,
  CONSTRAINT venta_id_evento_fkey FOREIGN KEY (id_evento) REFERENCES public.evento(id_evento) ON DELETE CASCADE
);

-- Índices para venta
CREATE INDEX idx_venta_producto ON public.venta(id_producto);
CREATE INDEX idx_venta_evento ON public.venta(id_evento);
CREATE INDEX idx_venta_fecha ON public.venta(fecha_venta);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para crear usuario automáticamente desde auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_rol text;
  v_apellido text;
BEGIN
  -- Mapear rol de inglés a español MAYÚSCULAS
  v_rol := CASE 
    WHEN NEW.raw_user_meta_data->>'rol' = 'vendor' THEN 'VENDEDOR'
    WHEN NEW.raw_user_meta_data->>'rol' = 'organizer' THEN 'ORGANIZADOR'
    WHEN NEW.raw_user_meta_data->>'rol' = 'admin' THEN 'ADMIN'
    WHEN NEW.raw_user_meta_data->>'rol' = 'normal' THEN 'ASISTENTE'
    WHEN UPPER(NEW.raw_user_meta_data->>'rol') = 'VENDEDOR' THEN 'VENDEDOR'
    WHEN UPPER(NEW.raw_user_meta_data->>'rol') = 'ORGANIZADOR' THEN 'ORGANIZADOR'
    WHEN UPPER(NEW.raw_user_meta_data->>'rol') = 'ADMIN' THEN 'ADMIN'
    WHEN UPPER(NEW.raw_user_meta_data->>'rol') = 'ASISTENTE' THEN 'ASISTENTE'
    ELSE 'ASISTENTE'
  END;

  -- Obtener apellido (puede ser vacío)
  v_apellido := COALESCE(NEW.raw_user_meta_data->>'apellido', '');
  IF v_apellido = '' THEN
    v_apellido := '-';
  END IF;

  -- Insertar en tabla usuario
  INSERT INTO public.usuario (auth_id, correo, nombre, apellido, rol, estado, password_hash)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
    v_apellido,
    v_rol,
    'activo',
    NULL
  );

  -- Si es vendedor, crear registro en tabla vendedor
  IF v_rol = 'VENDEDOR' THEN
    INSERT INTO public.vendedor (id_vendedor, bio, historia, nivel_confianza)
    SELECT id_usuario, NULL, NULL, 0.0
    FROM public.usuario
    WHERE auth_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para ejecutar la función cuando se crea un usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_evento_updated_at ON public.evento;
CREATE TRIGGER update_evento_updated_at
  BEFORE UPDATE ON public.evento
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_producto_updated_at ON public.producto;
CREATE TRIGGER update_producto_updated_at
  BEFORE UPDATE ON public.producto
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendedor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participacion_vendedor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registro_evento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validacion_evento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidencia ENABLE ROW LEVEL SECURITY;

-- Políticas para USUARIO
DROP POLICY IF EXISTS "authenticated_insert_own" ON public.usuario;
CREATE POLICY "authenticated_insert_own"
  ON public.usuario FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = auth_id);

DROP POLICY IF EXISTS "authenticated_select_all" ON public.usuario;
CREATE POLICY "authenticated_select_all"
  ON public.usuario FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "authenticated_update_own" ON public.usuario;
CREATE POLICY "authenticated_update_own"
  ON public.usuario FOR UPDATE TO authenticated
  USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);

-- Políticas para VENDEDOR
DROP POLICY IF EXISTS "vendedor_select_all" ON public.vendedor;
CREATE POLICY "vendedor_select_all"
  ON public.vendedor FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "vendedor_update_own" ON public.vendedor;
CREATE POLICY "vendedor_update_own"
  ON public.vendedor FOR UPDATE TO authenticated
  USING (
    id_vendedor IN (
      SELECT id_usuario FROM public.usuario WHERE auth_id = auth.uid()
    )
  );

-- Políticas para EVENTO
DROP POLICY IF EXISTS "evento_select_all" ON public.evento;
CREATE POLICY "evento_select_all"
  ON public.evento FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "evento_insert_organizer" ON public.evento;
CREATE POLICY "evento_insert_organizer"
  ON public.evento FOR INSERT TO authenticated
  WITH CHECK (
    id_organizador IN (
      SELECT id_usuario FROM public.usuario 
      WHERE auth_id = auth.uid() AND rol IN ('ORGANIZADOR', 'ADMIN')
    )
  );

DROP POLICY IF EXISTS "evento_update_own" ON public.evento;
CREATE POLICY "evento_update_own"
  ON public.evento FOR UPDATE TO authenticated
  USING (
    id_organizador IN (
      SELECT id_usuario FROM public.usuario WHERE auth_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.usuario WHERE auth_id = auth.uid() AND rol = 'ADMIN'
    )
  );

-- Políticas para PRODUCTO
DROP POLICY IF EXISTS "producto_select_all" ON public.producto;
CREATE POLICY "producto_select_all"
  ON public.producto FOR SELECT TO authenticated
  USING (activo = true OR id_vendedor IN (
    SELECT id_usuario FROM public.usuario WHERE auth_id = auth.uid()
  ));

DROP POLICY IF EXISTS "producto_insert_vendor" ON public.producto;
CREATE POLICY "producto_insert_vendor"
  ON public.producto FOR INSERT TO authenticated
  WITH CHECK (
    id_vendedor IN (
      SELECT id_usuario FROM public.usuario 
      WHERE auth_id = auth.uid() AND rol = 'VENDEDOR'
    )
  );

DROP POLICY IF EXISTS "producto_update_own" ON public.producto;
CREATE POLICY "producto_update_own"
  ON public.producto FOR UPDATE TO authenticated
  USING (
    id_vendedor IN (
      SELECT id_usuario FROM public.usuario WHERE auth_id = auth.uid()
    )
  );

-- Políticas para REGISTRO_EVENTO
DROP POLICY IF EXISTS "registro_select_all" ON public.registro_evento;
CREATE POLICY "registro_select_all"
  ON public.registro_evento FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "registro_insert_own" ON public.registro_evento;
CREATE POLICY "registro_insert_own"
  ON public.registro_evento FOR INSERT TO authenticated
  WITH CHECK (
    id_usuario IN (
      SELECT id_usuario FROM public.usuario WHERE auth_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "registro_update_own" ON public.registro_evento;
CREATE POLICY "registro_update_own"
  ON public.registro_evento FOR UPDATE TO authenticated
  USING (
    id_usuario IN (
      SELECT id_usuario FROM public.usuario WHERE auth_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.evento e 
      WHERE e.id_evento = registro_evento.id_evento 
      AND e.id_organizador IN (
        SELECT id_usuario FROM public.usuario WHERE auth_id = auth.uid()
      )
    )
  );

-- Políticas para PARTICIPACION_VENDEDOR
DROP POLICY IF EXISTS "participacion_select_all" ON public.participacion_vendedor;
CREATE POLICY "participacion_select_all"
  ON public.participacion_vendedor FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "participacion_insert_vendor" ON public.participacion_vendedor;
CREATE POLICY "participacion_insert_vendor"
  ON public.participacion_vendedor FOR INSERT TO authenticated
  WITH CHECK (
    id_vendedor IN (
      SELECT id_usuario FROM public.usuario WHERE auth_id = auth.uid() AND rol = 'VENDEDOR'
    )
  );

DROP POLICY IF EXISTS "participacion_update_organizer" ON public.participacion_vendedor;
CREATE POLICY "participacion_update_organizer"
  ON public.participacion_vendedor FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.evento e 
      WHERE e.id_evento = participacion_vendedor.id_evento 
      AND e.id_organizador IN (
        SELECT id_usuario FROM public.usuario WHERE auth_id = auth.uid()
      )
    )
    OR EXISTS (
      SELECT 1 FROM public.usuario WHERE auth_id = auth.uid() AND rol = 'ADMIN'
    )
  );

-- Políticas para VALIDACION_EVENTO (solo admins)
DROP POLICY IF EXISTS "validacion_select_admin" ON public.validacion_evento;
CREATE POLICY "validacion_select_admin"
  ON public.validacion_evento FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuario WHERE auth_id = auth.uid() AND rol IN ('ADMIN', 'MODERADOR')
    )
  );

DROP POLICY IF EXISTS "validacion_insert_admin" ON public.validacion_evento;
CREATE POLICY "validacion_insert_admin"
  ON public.validacion_evento FOR INSERT TO authenticated
  WITH CHECK (
    id_admin IN (
      SELECT id_usuario FROM public.usuario 
      WHERE auth_id = auth.uid() AND rol IN ('ADMIN', 'MODERADOR')
    )
  );

-- Políticas para VENTA
DROP POLICY IF EXISTS "venta_select_vendor_event" ON public.venta;
CREATE POLICY "venta_select_vendor_event"
  ON public.venta FOR SELECT TO authenticated
  USING (
    id_producto IN (
      SELECT id_producto FROM public.producto 
      WHERE id_vendedor IN (
        SELECT id_usuario FROM public.usuario WHERE auth_id = auth.uid()
      )
    )
    OR id_evento IN (
      SELECT id_evento FROM public.evento 
      WHERE id_organizador IN (
        SELECT id_usuario FROM public.usuario WHERE auth_id = auth.uid()
      )
    )
    OR EXISTS (
      SELECT 1 FROM public.usuario WHERE auth_id = auth.uid() AND rol = 'ADMIN'
    )
  );

DROP POLICY IF EXISTS "venta_insert_vendor" ON public.venta;
CREATE POLICY "venta_insert_vendor"
  ON public.venta FOR INSERT TO authenticated
  WITH CHECK (
    id_producto IN (
      SELECT id_producto FROM public.producto 
      WHERE id_vendedor IN (
        SELECT id_usuario FROM public.usuario WHERE auth_id = auth.uid()
      )
    )
  );

-- Políticas para EVIDENCIA
DROP POLICY IF EXISTS "evidencia_select_all" ON public.evidencia;
CREATE POLICY "evidencia_select_all"
  ON public.evidencia FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "evidencia_insert_organizer" ON public.evidencia;
CREATE POLICY "evidencia_insert_organizer"
  ON public.evidencia FOR INSERT TO authenticated
  WITH CHECK (
    id_evento IN (
      SELECT id_evento FROM public.evento 
      WHERE id_organizador IN (
        SELECT id_usuario FROM public.usuario WHERE auth_id = auth.uid()
      )
    )
  );

-- =====================================================
-- DATOS DE PRUEBA (OPCIONAL)
-- =====================================================

-- Insertar usuario admin de prueba (solo para desarrollo local)
-- NOTA: En producción, crea usuarios desde la interfaz de autenticación

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Contar tablas creadas
SELECT 
  'Tablas creadas exitosamente' as mensaje,
  COUNT(*) as total_tablas
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- Listar todas las tablas
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as num_columnas
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verificar triggers
SELECT 
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- =====================================================
-- FIN DE LA MIGRACIÓN
-- =====================================================

SELECT '✅ MIGRACIÓN COMPLETADA EXITOSAMENTE' as status;
SELECT '🚀 Base de datos lista para usar' as mensaje;
SELECT '📝 Ahora puedes registrar usuarios desde la aplicación' as siguiente_paso;
