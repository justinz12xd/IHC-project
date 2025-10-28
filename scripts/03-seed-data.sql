-- Insert sample admin user (you'll need to create this user in Supabase Auth first)
-- This is just a placeholder - replace with actual user ID after creating in Supabase Auth

-- Sample events for testing
INSERT INTO events (organizer_id, title, description, location, address, start_date, end_date, capacity, status)
VALUES 
  (
    (SELECT id FROM profiles WHERE role = 'organizer' LIMIT 1),
    'Feria Agroproductiva Primavera 2025',
    'Gran feria de productos agrícolas locales con los mejores productores de la región',
    'Centro de Convenciones',
    'Av. Principal 123, Ciudad',
    NOW() + INTERVAL '30 days',
    NOW() + INTERVAL '32 days',
    500,
    'approved'
  ),
  (
    (SELECT id FROM profiles WHERE role = 'organizer' LIMIT 1),
    'Expo Café y Cacao',
    'Exposición especializada en café y cacao de alta calidad',
    'Parque Central',
    'Calle 45 #12-34',
    NOW() + INTERVAL '45 days',
    NOW() + INTERVAL '46 days',
    300,
    'approved'
  );

-- Note: Additional seed data should be added after users are created through the auth system
