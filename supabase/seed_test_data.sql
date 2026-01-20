-- =====================================================
-- DATOS DE PRUEBA PARA VISUALIZACIÓN
-- =====================================================
-- Este script crea usuarios de cada tipo y datos de ejemplo

-- 1. CREAR USUARIOS DE PRUEBA (primero en auth.users, luego en public.usuario)

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
) ON CONFLICT (id) DO NOTHING;

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
) ON CONFLICT (id) DO NOTHING;

-- 2. CREAR REGISTROS EN public.usuario

INSERT INTO public.usuario (id_usuario, nombre, apellido, correo, rol, auth_id, estado)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Admin', 'Sistema', 'admin@ihc.com', 'ADMIN', '00000000-0000-0000-0000-000000000001', 'activo'),
  ('00000000-0000-0000-0000-000000000002', 'Carlos', 'Organizador', 'organizador@ihc.com', 'ORGANIZADOR', '00000000-0000-0000-0000-000000000002', 'activo'),
  ('00000000-0000-0000-0000-000000000003', 'María', 'Vendedora', 'vendedor@ihc.com', 'VENDEDOR', '00000000-0000-0000-0000-000000000003', 'activo'),
  ('00000000-0000-0000-0000-000000000004', 'Juan', 'Asistente', 'asistente@ihc.com', 'ASISTENTE', '00000000-0000-0000-0000-000000000004', 'activo')
ON CONFLICT (id_usuario) DO NOTHING;

-- 3. CREAR PERFIL DE VENDEDOR

INSERT INTO public.vendedor (id_vendedor, bio, historia, nivel_confianza)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'Productora de café orgánico con más de 15 años de experiencia',
  'Inicié mi emprendimiento en 2010 con una pequeña parcela. Hoy producimos café premium certificado.',
  85.5
) ON CONFLICT (id_vendedor) DO NOTHING;

-- 4. CREAR EVENTOS DE EJEMPLO

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
    '00000000-0000-0000-0000-000000000002'
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
    '00000000-0000-0000-0000-000000000002'
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
    '00000000-0000-0000-0000-000000000002'
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
    '00000000-0000-0000-0000-000000000002'
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
    '00000000-0000-0000-0000-000000000002'
  )
ON CONFLICT (id_evento) DO NOTHING;

-- 5. CREAR PRODUCTOS DEL VENDEDOR

INSERT INTO public.producto (id_producto, nombre, descripcion, precio, categoria, stock_disponible, id_vendedor)
VALUES
  (
    '20000000-0000-0000-0000-000000000001',
    'Café Orgánico Premium 250g',
    'Café arábica de altura, cultivado a 1800 msnm. Notas de chocolate y caramelo. Certificación orgánica.',
    35.00,
    'Bebidas',
    150,
    '00000000-0000-0000-0000-000000000003'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'Café Molido Especial 500g',
    'Café molido ideal para preparaciones en cafetera italiana o francesa. Tueste medio.',
    55.00,
    'Bebidas',
    100,
    '00000000-0000-0000-0000-000000000003'
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    'Granos de Café Verde 1kg',
    'Granos de café sin tostar para tostadores o entusiastas. Calidad exportación.',
    80.00,
    'Bebidas',
    50,
    '00000000-0000-0000-0000-000000000003'
  ),
  (
    '20000000-0000-0000-0000-000000000004',
    'Set Degustación Café (3x100g)',
    'Tres variedades de café: suave, medio y fuerte. Ideal para descubrir tu favorito.',
    75.00,
    'Bebidas',
    80,
    '00000000-0000-0000-0000-000000000003'
  )
ON CONFLICT (id_producto) DO NOTHING;

-- 6. CREAR REGISTROS DE EVENTOS (inscripciones)

INSERT INTO public.registro_evento (id_registro, id_usuario, id_evento, fecha_registro, estado, codigo_qr)
VALUES
  (
    '30000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000004',
    '10000000-0000-0000-0000-000000000001',
    NOW(),
    'CONFIRMADO',
    'QR-FERIA-VALLE-001'
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000004',
    '10000000-0000-0000-0000-000000000002',
    NOW(),
    'CONFIRMADO',
    'QR-EXPO-CAFE-001'
  ),
  (
    '30000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000001',
    NOW(),
    'CONFIRMADO',
    'QR-FERIA-VALLE-002'
  )
ON CONFLICT (id_registro) DO NOTHING;

-- 7. CREAR PARTICIPACIÓN DE VENDEDOR EN EVENTOS

INSERT INTO public.participacion_vendedor (id_participacion, id_vendedor, id_evento, estado_participacion, monto_stand, fecha_solicitud)
VALUES
  (
    '40000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000001',
    'APROBADO',
    500.00,
    NOW()
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000002',
    'APROBADO',
    350.00,
    NOW()
  ),
  (
    '40000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000005',
    'PENDIENTE',
    600.00,
    NOW()
  )
ON CONFLICT (id_participacion) DO NOTHING;

-- 8. REGISTROS DE AUDITORÍA DE EJEMPLO

INSERT INTO public.auditoria (id_usuario, accion, entidad, entidad_id, detalles, resultado)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'LOGIN',
    'auth',
    NULL,
    '{"email": "admin@ihc.com", "timestamp": "2026-01-20T10:00:00Z"}',
    'exito'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'CREATE',
    'evento',
    NULL,
    '{"nombre": "Feria Agrícola del Valle", "capacidad": 500}',
    'exito'
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'REGISTER',
    'registro_evento',
    NULL,
    '{"id_evento": "10000000-0000-0000-0000-000000000001"}',
    'exito'
  );

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE '✅ Datos de prueba creados exitosamente:';
  RAISE NOTICE '   - 4 usuarios (admin@ihc.com, organizador@ihc.com, vendedor@ihc.com, asistente@ihc.com)';
  RAISE NOTICE '   - Contraseñas: Admin123!, Org123!, Vend123!, Asis123!';
  RAISE NOTICE '   - 5 eventos de ejemplo';
  RAISE NOTICE '   - 4 productos de café';
  RAISE NOTICE '   - 3 registros de eventos';
  RAISE NOTICE '   - 3 participaciones de vendedor';
END $$;
