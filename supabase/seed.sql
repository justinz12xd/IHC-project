-- =====================================================
-- DATOS DE PRUEBA PARA VISUALIZACIÓN
-- =====================================================
-- Este script se ejecuta automáticamente después de las migraciones

-- Deshabilitar triggers temporalmente para evitar conflictos con entidad_id
ALTER TABLE evento DISABLE TRIGGER trg_auditar_evento;
ALTER TABLE registro_evento DISABLE TRIGGER trg_auditar_registro_evento;

-- 1. CREAR USUARIOS DE PRUEBA (primero en auth.users, luego en public.usuario)

-- Eliminar usuarios existentes si existen (primero public.usuario, luego auth.users por FK)
DELETE FROM public.usuario WHERE correo IN ('admin@ihc.com', 'organizador@ihc.com', 'vendedor@ihc.com', 'asistente@ihc.com');
DELETE FROM auth.users WHERE email IN ('admin@ihc.com', 'organizador@ihc.com', 'vendedor@ihc.com', 'asistente@ihc.com');

-- Usuario Admin
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'admin@ihc.com',
  crypt('Admin123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Admin Sistema"}',
  NOW(),
  NOW(),
  'authenticated',
  'authenticated'
);

-- Usuario Organizador
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'organizador@ihc.com',
  crypt('Org123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Carlos Organizador"}',
  NOW(),
  NOW(),
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Usuario Vendedor
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud
) VALUES (
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000000',
  'vendedor@ihc.com',
  crypt('Vend123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"María Vendedora"}',
  NOW(),
  NOW(),
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Usuario Asistente
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud
) VALUES (
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000000',
  'asistente@ihc.com',
  crypt('Asis123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Juan Asistente"}',
  NOW(),
  NOW(),
  'authenticated',
  'authenticated'
);

-- 2. El trigger on_auth_user_created ya creó los registros en public.usuario
-- Solo necesitamos actualizar los roles correctos

UPDATE public.usuario SET rol = 'ADMIN' WHERE correo = 'admin@ihc.com';
UPDATE public.usuario SET rol = 'ORGANIZADOR' WHERE correo = 'organizador@ihc.com';
UPDATE public.usuario SET rol = 'VENDEDOR' WHERE correo = 'vendedor@ihc.com';
UPDATE public.usuario SET rol = 'ASISTENTE' WHERE correo = 'asistente@ihc.com';

-- 3. CREAR PERFIL DE VENDEDOR (usar el id_usuario correcto)

INSERT INTO public.vendedor (id_vendedor, bio, historia, nivel_confianza)
SELECT 
  id_usuario,
  'Productora de café orgánico con más de 15 años de experiencia',
  'Inicié mi emprendimiento en 2010 con una pequeña parcela. Hoy producimos café premium certificado.',
  85.5
FROM public.usuario 
WHERE correo = 'vendedor@ihc.com'
ON CONFLICT (id_vendedor) DO NOTHING;

-- 4. CREAR EVENTOS DE EJEMPLO (usando id correcto del organizador)

DO $$
DECLARE
  v_organizador_id UUID;
BEGIN
  SELECT id_usuario INTO v_organizador_id FROM public.usuario WHERE correo = 'organizador@ihc.com';
  
  INSERT INTO public.evento (id_evento, nombre, descripcion, fecha_inicio, fecha_fin, lugar, capacidad, estado, id_organizador)
  VALUES
    (
      '10000000-0000-0000-0000-000000000001',
      'Feria Agrícola del Valle',
      'Gran exposición de productos agrícolas locales con degustaciones y talleres sobre agricultura sostenible. Incluye zona de venta directa de productores.',
      '2026-02-15',
      '2026-02-17',
      'Centro de Convenciones Valle Verde, Arequipa',
      500,
      'APROBADO',
      v_organizador_id
    ),
    (
      '10000000-0000-0000-0000-000000000002',
      'Expo Café Peruano 2026',
      'Evento especializado en café de especialidad con baristas internacionales, catas y conferencias sobre tendencias del mercado cafetero.',
      '2026-03-10',
      '2026-03-12',
      'Auditorio Municipal, Lima',
      300,
      'APROBADO',
      v_organizador_id
    ),
    (
      '10000000-0000-0000-0000-000000000003',
      'Mercado de Productores Orgánicos',
      'Mercado mensual de productos orgánicos certificados. Espacio para conocer directamente a los productores y comprar productos frescos.',
      '2026-02-01',
      '2026-02-01',
      'Plaza San Martín, Cusco',
      200,
      'APROBADO',
      v_organizador_id
    ),
    (
      '10000000-0000-0000-0000-000000000004',
      'Seminario de Agricultura Digital',
      'Conferencia sobre tecnologías emergentes en agricultura: IoT, drones, análisis de datos y agricultura de precisión.',
      '2026-04-20',
      '2026-04-21',
      'Universidad Agraria, La Molina',
      150,
      'PENDIENTE',
      v_organizador_id
    ),
    (
      '10000000-0000-0000-0000-000000000005',
      'Festival Gastronómico Andino',
      'Celebración de la gastronomía andina con chefs reconocidos, productores locales y degustaciones de platos tradicionales y fusión.',
      '2026-05-15',
      '2026-05-17',
      'Parque Arqueológico, Sacsayhuamán',
      800,
      'APROBADO',
      v_organizador_id
    )
  ON CONFLICT (id_evento) DO NOTHING;
END $$;

-- 5. CREAR PRODUCTOS DEL VENDEDOR (usando id correcto del vendedor)

DO $$
DECLARE
  v_vendedor_id UUID;
BEGIN
  SELECT id_usuario INTO v_vendedor_id FROM public.usuario WHERE correo = 'vendedor@ihc.com';
  
  INSERT INTO public.producto (id_producto, nombre, descripcion, precio_unitario, categoria, stock_inicial, id_vendedor)
  VALUES
    (
      '20000000-0000-0000-0000-000000000001',
      'Café Orgánico Premium 250g',
      'Café arábica de altura, cultivado a 1800 msnm. Notas de chocolate y caramelo. Certificación orgánica.',
      35.00,
      'Bebidas',
      150,
      v_vendedor_id
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'Café Molido Especial 500g',
      'Café molido ideal para preparaciones en cafetera italiana o francesa. Tueste medio.',
      55.00,
      'Bebidas',
      100,
      v_vendedor_id
    ),
    (
      '20000000-0000-0000-0000-000000000003',
      'Granos de Café Verde 1kg',
      'Granos de café sin tostar para tostadores o entusiastas. Calidad exportación.',
      80.00,
      'Bebidas',
      50,
      v_vendedor_id
    ),
    (
      '20000000-0000-0000-0000-000000000004',
      'Set Degustación Café (3x100g)',
      'Tres variedades de café: suave, medio y fuerte. Ideal para descubrir tu favorito.',
      75.00,
      'Bebidas',
      80,
      v_vendedor_id
    )
  ON CONFLICT (id_producto) DO NOTHING;
END $$;

-- 6. CREAR REGISTROS DE EVENTOS (inscripciones) - usando ids correctos

DO $$
DECLARE
  v_asistente_id UUID;
BEGIN
  SELECT id_usuario INTO v_asistente_id FROM public.usuario WHERE correo = 'asistente@ihc.com';
  
  INSERT INTO public.registro_evento (id_registro, id_usuario, id_evento, fecha_registro, codigo_qr, asistio)
  VALUES
    (
      '30000000-0000-0000-0000-000000000001',
      v_asistente_id,
      '10000000-0000-0000-0000-000000000001',
      NOW(),
      'QR-FERIA-VALLE-001',
      false
    ),
    (
      '30000000-0000-0000-0000-000000000002',
      v_asistente_id,
      '10000000-0000-0000-0000-000000000002',
      NOW(),
      'QR-EXPO-CAFE-001',
      false
    )
  ON CONFLICT (id_registro) DO NOTHING;
END $$;

-- También crear un registro para el vendedor
DO $$
DECLARE
  v_vendedor_id UUID;
BEGIN
  SELECT id_usuario INTO v_vendedor_id FROM public.usuario WHERE correo = 'vendedor@ihc.com';
  
  INSERT INTO public.registro_evento (id_registro, id_usuario, id_evento, fecha_registro, codigo_qr, asistio)
  VALUES
    (
      '30000000-0000-0000-0000-000000000003',
      v_vendedor_id,
      '10000000-0000-0000-0000-000000000001',
      NOW(),
      'QR-FERIA-VALLE-002',
      false
    )
  ON CONFLICT (id_registro) DO NOTHING;
END $$;

-- 7. CREAR PARTICIPACIÓN DE VENDEDOR EN EVENTOS (usando id correcto)

DO $$
DECLARE
  v_vendedor_id UUID;
BEGIN
  SELECT id_usuario INTO v_vendedor_id FROM public.usuario WHERE correo = 'vendedor@ihc.com';
  
  INSERT INTO public.participacion_vendedor (id_participacion, id_vendedor, id_evento, estado_aprobacion)
  VALUES
    (
      '40000000-0000-0000-0000-000000000001',
      v_vendedor_id,
      '10000000-0000-0000-0000-000000000001',
      'APROBADO'
    ),
    (
      '40000000-0000-0000-0000-000000000002',
      v_vendedor_id,
      '10000000-0000-0000-0000-000000000002',
      'APROBADO'
    ),
    (
      '40000000-0000-0000-0000-000000000003',
      v_vendedor_id,
      '10000000-0000-0000-0000-000000000005',
      'PENDIENTE'
    )
  ON CONFLICT (id_participacion) DO NOTHING;
END $$;

-- 8. REGISTROS DE AUDITORÍA DE EJEMPLO (usando auth_id que es el que referencia a auth.users)

DO $$
DECLARE
  v_admin_auth_id UUID;
  v_organizador_auth_id UUID;
  v_asistente_auth_id UUID;
BEGIN
  SELECT auth_id INTO v_admin_auth_id FROM public.usuario WHERE correo = 'admin@ihc.com';
  SELECT auth_id INTO v_organizador_auth_id FROM public.usuario WHERE correo = 'organizador@ihc.com';
  SELECT auth_id INTO v_asistente_auth_id FROM public.usuario WHERE correo = 'asistente@ihc.com';
  
  INSERT INTO public.auditoria (id_usuario, accion, entidad, detalles, resultado)
  VALUES
    (
      v_admin_auth_id,
      'LOGIN',
      'auth',
      '{"email": "admin@ihc.com", "timestamp": "2026-01-20T10:00:00Z"}',
      'exito'
    ),
    (
      v_organizador_auth_id,
      'CREATE',
      'evento',
      '{"nombre": "Feria Agrícola del Valle", "capacidad": 500}',
      'exito'
    ),
    (
      v_asistente_auth_id,
      'REGISTER',
      'registro_evento',
      '{"id_evento": "10000000-0000-0000-0000-000000000001"}',
      'exito'
    );
END $$;
-- Rehabilitar triggers
ALTER TABLE evento ENABLE TRIGGER trg_auditar_evento;
ALTER TABLE registro_evento ENABLE TRIGGER trg_auditar_registro_evento;