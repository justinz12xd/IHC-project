-- Datos de prueba para eventos
-- Insertar eventos de prueba aprobados

-- Primero necesitamos crear un organizador de prueba
DO $$
DECLARE
    v_organizador_id uuid;
BEGIN
    -- Generar UUID para organizador
    v_organizador_id := gen_random_uuid();
    
    -- Insertar usuario organizador de prueba
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
    )
    VALUES (
        v_organizador_id,
        '00000000-0000-0000-0000-000000000000',
        'organizador@test.com',
        crypt('password123', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"nombre":"Carlos","apellido":"Organizador","rol":"organizer"}',
        now(),
        now(),
        'authenticated',
        'authenticated'
    )
    ON CONFLICT (email) DO NOTHING;
    
    -- Obtener el id_usuario del organizador
    SELECT id_usuario INTO v_organizador_id
    FROM usuario
    WHERE auth_id = v_organizador_id;
    
    -- Insertar eventos de prueba si existen organizadores
    IF v_organizador_id IS NOT NULL THEN
        -- Evento 1: Feria Agrícola del Valle
        INSERT INTO evento (
            nombre,
            descripcion,
            fecha_inicio,
            fecha_fin,
            lugar,
            capacidad,
            estado,
            id_organizador
        )
        VALUES (
            'Feria Agrícola del Valle',
            'Gran feria de productos agrícolas locales con más de 50 vendedores',
            CURRENT_DATE + INTERVAL '7 days',
            CURRENT_DATE + INTERVAL '9 days',
            'Centro de Convenciones, Ciudad Principal',
            100,
            'APROBADO',
            v_organizador_id
        )
        ON CONFLICT DO NOTHING;
        
        -- Evento 2: Mercado Orgánico
        INSERT INTO evento (
            nombre,
            descripcion,
            fecha_inicio,
            fecha_fin,
            lugar,
            capacidad,
            estado,
            id_organizador
        )
        VALUES (
            'Mercado Orgánico',
            'Mercado especializado en productos orgánicos certificados',
            CURRENT_DATE + INTERVAL '14 days',
            CURRENT_DATE + INTERVAL '14 days',
            'Plaza Central',
            50,
            'APROBADO',
            v_organizador_id
        )
        ON CONFLICT DO NOTHING;
        
        -- Evento 3: Expo Agroindustrial
        INSERT INTO evento (
            nombre,
            descripcion,
            fecha_inicio,
            fecha_fin,
            lugar,
            capacidad,
            estado,
            id_organizador
        )
        VALUES (
            'Expo Agroindustrial 2025',
            'Exposición de tecnología y productos agroindustriales',
            CURRENT_DATE + INTERVAL '21 days',
            CURRENT_DATE + INTERVAL '23 days',
            'Parque de Exposiciones',
            150,
            'APROBADO',
            v_organizador_id
        )
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Eventos de prueba creados exitosamente';
    ELSE
        RAISE NOTICE 'No se pudo crear el organizador. Los eventos no fueron insertados.';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error al crear eventos de prueba: %', SQLERRM;
END $$;
