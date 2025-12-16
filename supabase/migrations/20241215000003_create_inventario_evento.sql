-- Crear tabla de inventario para productos en eventos
-- Esta tabla relaciona productos de vendedores con eventos específicos
-- permitiendo diferentes precios y cantidades por evento

CREATE TABLE IF NOT EXISTS public.inventario_evento (
  id_inventario uuid NOT NULL DEFAULT gen_random_uuid(),
  id_producto uuid NOT NULL,
  id_evento uuid NOT NULL,
  id_vendedor uuid NOT NULL,
  precio_evento numeric NOT NULL CHECK (precio_evento >= 0),
  cantidad_disponible integer NOT NULL CHECK (cantidad_disponible >= 0),
  cantidad_vendida integer DEFAULT 0 CHECK (cantidad_vendida >= 0),
  fecha_asignacion timestamp without time zone DEFAULT now(),
  activo boolean DEFAULT true,
  CONSTRAINT inventario_evento_pkey PRIMARY KEY (id_inventario),
  CONSTRAINT inventario_evento_unique_producto_evento UNIQUE (id_producto, id_evento),
  CONSTRAINT inventario_evento_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.producto(id_producto) ON DELETE CASCADE,
  CONSTRAINT inventario_evento_id_evento_fkey FOREIGN KEY (id_evento) REFERENCES public.evento(id_evento) ON DELETE CASCADE,
  CONSTRAINT inventario_evento_id_vendedor_fkey FOREIGN KEY (id_vendedor) REFERENCES public.vendedor(id_vendedor) ON DELETE CASCADE,
  CONSTRAINT inventario_evento_check_vendida CHECK (cantidad_vendida <= cantidad_disponible)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_inventario_evento_producto ON public.inventario_evento(id_producto);
CREATE INDEX IF NOT EXISTS idx_inventario_evento_evento ON public.inventario_evento(id_evento);
CREATE INDEX IF NOT EXISTS idx_inventario_evento_vendedor ON public.inventario_evento(id_vendedor);
CREATE INDEX IF NOT EXISTS idx_inventario_evento_activo ON public.inventario_evento(activo);

-- Comentarios para documentación
COMMENT ON TABLE public.inventario_evento IS 'Inventario de productos asignados a eventos específicos';
COMMENT ON COLUMN public.inventario_evento.precio_evento IS 'Precio del producto para este evento específico (puede diferir del precio base)';
COMMENT ON COLUMN public.inventario_evento.cantidad_disponible IS 'Cantidad total del producto disponible para vender en este evento';
COMMENT ON COLUMN public.inventario_evento.cantidad_vendida IS 'Cantidad ya vendida en este evento';

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Habilitar RLS
ALTER TABLE public.inventario_evento ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden ver inventarios de eventos aprobados
DROP POLICY IF EXISTS "inventario_select_all" ON public.inventario_evento;
CREATE POLICY "inventario_select_all"
ON public.inventario_evento FOR SELECT
TO public
USING (
  activo = true
  AND EXISTS (
    SELECT 1 FROM public.evento e
    WHERE e.id_evento = inventario_evento.id_evento
    AND e.estado = 'APROBADO'
  )
);

-- Política: Vendedores pueden insertar inventario solo para sus productos
DROP POLICY IF EXISTS "inventario_insert_own" ON public.inventario_evento;
CREATE POLICY "inventario_insert_own"
ON public.inventario_evento FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.usuario u
    WHERE u.auth_id = auth.uid()
    AND u.id_usuario = inventario_evento.id_vendedor
    AND u.rol = 'VENDEDOR'
  )
  AND EXISTS (
    SELECT 1 FROM public.producto p
    WHERE p.id_producto = inventario_evento.id_producto
    AND p.id_vendedor = inventario_evento.id_vendedor
  )
);

-- Política: Vendedores pueden actualizar su propio inventario
DROP POLICY IF EXISTS "inventario_update_own" ON public.inventario_evento;
CREATE POLICY "inventario_update_own"
ON public.inventario_evento FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.usuario u
    WHERE u.auth_id = auth.uid()
    AND u.id_usuario = inventario_evento.id_vendedor
    AND u.rol = 'VENDEDOR'
  )
);

-- Política: Vendedores pueden eliminar su propio inventario
DROP POLICY IF EXISTS "inventario_delete_own" ON public.inventario_evento;
CREATE POLICY "inventario_delete_own"
ON public.inventario_evento FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.usuario u
    WHERE u.auth_id = auth.uid()
    AND u.id_usuario = inventario_evento.id_vendedor
    AND u.rol = 'VENDEDOR'
  )
);
