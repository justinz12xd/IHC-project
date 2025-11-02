-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.asistencia_proveedor (
  id_asistencia uuid NOT NULL DEFAULT gen_random_uuid(),
  id_proveedor uuid NOT NULL,
  id_evento uuid NOT NULL,
  hora_llegada timestamp without time zone DEFAULT now(),
  codigo_qr character varying,
  CONSTRAINT asistencia_proveedor_pkey PRIMARY KEY (id_asistencia),
  CONSTRAINT asistencia_proveedor_id_proveedor_fkey FOREIGN KEY (id_proveedor) REFERENCES public.proveedor(id_proveedor),
  CONSTRAINT asistencia_proveedor_id_evento_fkey FOREIGN KEY (id_evento) REFERENCES public.evento(id_evento)
);
CREATE TABLE public.evento (
  id_evento uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre character varying NOT NULL,
  descripcion text,
  fecha_inicio date NOT NULL,
  fecha_fin date NOT NULL,
  lugar character varying,
  capacidad integer CHECK (capacidad >= 0),
  estado character varying DEFAULT 'PENDIENTE'::character varying CHECK (estado::text = ANY (ARRAY['PENDIENTE'::character varying, 'APROBADO'::character varying, 'RECHAZADO'::character varying, 'FINALIZADO'::character varying]::text[])),
  id_organizador uuid,
  CONSTRAINT evento_pkey PRIMARY KEY (id_evento),
  CONSTRAINT evento_id_organizador_fkey FOREIGN KEY (id_organizador) REFERENCES public.usuario(id_usuario)
);
CREATE TABLE public.evento_proveedor (
  id_evento uuid NOT NULL,
  id_proveedor uuid NOT NULL,
  CONSTRAINT evento_proveedor_pkey PRIMARY KEY (id_evento, id_proveedor),
  CONSTRAINT evento_proveedor_id_evento_fkey FOREIGN KEY (id_evento) REFERENCES public.evento(id_evento),
  CONSTRAINT evento_proveedor_id_proveedor_fkey FOREIGN KEY (id_proveedor) REFERENCES public.proveedor(id_proveedor)
);
CREATE TABLE public.evidencia (
  id_evidencia uuid NOT NULL DEFAULT gen_random_uuid(),
  id_evento uuid NOT NULL,
  tipo character varying,
  url_archivo text NOT NULL,
  fecha_subida timestamp without time zone DEFAULT now(),
  CONSTRAINT evidencia_pkey PRIMARY KEY (id_evidencia),
  CONSTRAINT evidencia_id_evento_fkey FOREIGN KEY (id_evento) REFERENCES public.evento(id_evento)
);
CREATE TABLE public.participacion_vendedor (
  id_participacion uuid NOT NULL DEFAULT gen_random_uuid(),
  id_vendedor uuid NOT NULL,
  id_evento uuid NOT NULL,
  estado_aprobacion character varying DEFAULT 'PENDIENTE'::character varying CHECK (estado_aprobacion::text = ANY (ARRAY['PENDIENTE'::character varying, 'APROBADO'::character varying, 'RECHAZADO'::character varying]::text[])),
  credencial_url text,
  fecha_aprobacion timestamp without time zone,
  CONSTRAINT participacion_vendedor_pkey PRIMARY KEY (id_participacion),
  CONSTRAINT participacion_vendedor_id_vendedor_fkey FOREIGN KEY (id_vendedor) REFERENCES public.vendedor(id_vendedor),
  CONSTRAINT participacion_vendedor_id_evento_fkey FOREIGN KEY (id_evento) REFERENCES public.evento(id_evento)
);
CREATE TABLE public.producto (
  id_producto uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre character varying NOT NULL,
  descripcion text,
  precio_unitario numeric NOT NULL CHECK (precio_unitario >= 0::numeric),
  stock_inicial integer NOT NULL CHECK (stock_inicial >= 0),
  categoria character varying,
  id_vendedor uuid NOT NULL,
  CONSTRAINT producto_pkey PRIMARY KEY (id_producto),
  CONSTRAINT producto_id_vendedor_fkey FOREIGN KEY (id_vendedor) REFERENCES public.vendedor(id_vendedor)
);
CREATE TABLE public.proveedor (
  id_proveedor uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre character varying NOT NULL,
  tipo_servicio character varying,
  contacto character varying,
  documento_validacion text,
  CONSTRAINT proveedor_pkey PRIMARY KEY (id_proveedor)
);
CREATE TABLE public.registro_evento (
  id_registro uuid NOT NULL DEFAULT gen_random_uuid(),
  id_usuario uuid NOT NULL,
  id_evento uuid NOT NULL,
  fecha_registro timestamp without time zone DEFAULT now(),
  asistio boolean DEFAULT false,
  codigo_qr character varying,
  CONSTRAINT registro_evento_pkey PRIMARY KEY (id_registro),
  CONSTRAINT registro_evento_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario),
  CONSTRAINT registro_evento_id_evento_fkey FOREIGN KEY (id_evento) REFERENCES public.evento(id_evento)
);
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
  CONSTRAINT usuario_auth_id_fkey FOREIGN KEY (auth_id) REFERENCES auth.users(id)
);
CREATE TABLE public.validacion_evento (
  id_validacion uuid NOT NULL DEFAULT gen_random_uuid(),
  id_evento uuid NOT NULL,
  id_admin uuid NOT NULL,
  etapa character varying CHECK (etapa::text = ANY (ARRAY['DATOS_BÁSICOS'::character varying, 'DOCUMENTAL'::character varying, 'FINAL'::character varying]::text[])),
  resultado character varying CHECK (resultado::text = ANY (ARRAY['APROBADO'::character varying, 'RECHAZADO'::character varying, 'EN_PROCESO'::character varying]::text[])),
  observacion text,
  fecha_validacion timestamp without time zone DEFAULT now(),
  CONSTRAINT validacion_evento_pkey PRIMARY KEY (id_validacion),
  CONSTRAINT validacion_evento_id_evento_fkey FOREIGN KEY (id_evento) REFERENCES public.evento(id_evento),
  CONSTRAINT validacion_evento_id_admin_fkey FOREIGN KEY (id_admin) REFERENCES public.usuario(id_usuario)
);
CREATE TABLE public.vendedor (
  id_vendedor uuid NOT NULL,
  bio text,
  historia text,
  foto_perfil text,
  nivel_confianza numeric DEFAULT 0.0,
  CONSTRAINT vendedor_pkey PRIMARY KEY (id_vendedor),
  CONSTRAINT vendedor_id_vendedor_fkey FOREIGN KEY (id_vendedor) REFERENCES public.usuario(id_usuario)
);
CREATE TABLE public.venta (
  id_venta uuid NOT NULL DEFAULT gen_random_uuid(),
  id_producto uuid NOT NULL,
  id_evento uuid NOT NULL,
  cantidad integer NOT NULL CHECK (cantidad > 0),
  monto_total numeric DEFAULT 0 CHECK (monto_total >= 0::numeric),
  fecha_venta timestamp without time zone DEFAULT now(),
  CONSTRAINT venta_pkey PRIMARY KEY (id_venta),
  CONSTRAINT venta_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.producto(id_producto),
  CONSTRAINT venta_id_evento_fkey FOREIGN KEY (id_evento) REFERENCES public.evento(id_evento)
);