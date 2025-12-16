-- Crear usuario administrador de prueba
-- Credenciales: admin@test.com / Admin123!

DO $$
DECLARE
    v_admin_id uuid;
    v_admin_user_id uuid;
BEGIN
    -- Generar UUID para el usuario admin
    v_admin_id := gen_random_uuid();
    
    -- Insertar en auth.users
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
        aud,
        confirmation_token,
        email_change_token_new,
        recovery_token
    )
    VALUES (
        v_admin_id,
        '00000000-0000-0000-0000-000000000000',
        'admin@test.com',
        crypt('Admin123!', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"nombre":"Admin","apellido":"Sistema","rol":"admin"}',
        now(),
        now(),
        'authenticated',
        'authenticated',
        '',
        '',
        ''
    )
    ON CONFLICT (email) DO UPDATE
    SET encrypted_password = crypt('Admin123!', gen_salt('bf')),
        raw_user_meta_data = '{"nombre":"Admin","apellido":"Sistema","rol":"admin"}'
    RETURNING id INTO v_admin_id;
    
    -- Verificar si ya existe el usuario en la tabla usuario
    SELECT id_usuario INTO v_admin_user_id
    FROM usuario
    WHERE auth_id = v_admin_id;
    
    -- Si no existe, insertar en usuario
    IF v_admin_user_id IS NULL THEN
        INSERT INTO usuario (
            auth_id,
            nombre,
            apellido,
            correo,
            rol,
            estado,
            password_hash
        )
        VALUES (
            v_admin_id,
            'Admin',
            'Sistema',
            'admin@test.com',
            'ADMIN',
            'activo',
            NULL
        )
        ON CONFLICT (auth_id) DO UPDATE
        SET rol = 'ADMIN',
            estado = 'activo';
    ELSE
        -- Actualizar el rol a ADMIN si ya existe
        UPDATE usuario
        SET rol = 'ADMIN',
            estado = 'activo'
        WHERE id_usuario = v_admin_user_id;
    END IF;
    
    RAISE NOTICE '✅ Usuario administrador creado/actualizado exitosamente';
    RAISE NOTICE '📧 Email: admin@test.com';
    RAISE NOTICE '🔑 Password: Admin123!';
    RAISE NOTICE '👤 Rol: ADMIN';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error: %', SQLERRM;
END $$;
