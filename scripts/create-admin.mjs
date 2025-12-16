import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase local
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser() {
  try {
    console.log('🔨 Creando usuario administrador...')
    
    // Crear usuario en auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@test.com',
      password: 'Admin123!',
      email_confirm: true,
      user_metadata: {
        nombre: 'Admin',
        apellido: 'Sistema',
        rol: 'admin'
      }
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('⚠️  Usuario ya existe, actualizando...')
        
        // Buscar el usuario existente
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
        if (listError) throw listError
        
        const existingUser = users.find(u => u.email === 'admin@test.com')
        if (existingUser) {
          // Actualizar contraseña
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            {
              password: 'Admin123!',
              user_metadata: {
                nombre: 'Admin',
                apellido: 'Sistema',
                rol: 'admin'
              }
            }
          )
          if (updateError) throw updateError
          
          // Actualizar rol en tabla usuario
          const { error: roleError } = await supabase
            .from('usuario')
            .update({ rol: 'ADMIN', estado: 'activo' })
            .eq('auth_id', existingUser.id)
          
          if (roleError) throw roleError
          
          console.log('✅ Usuario administrador actualizado exitosamente')
        }
      } else {
        throw authError
      }
    } else {
      console.log('✅ Usuario administrador creado exitosamente')
      console.log('   Auth ID:', authData.user.id)
    }
    
    console.log('\n📧 Credenciales:')
    console.log('   Email: admin@test.com')
    console.log('   Password: Admin123!')
    console.log('   Rol: ADMIN')
    console.log('\n🔗 Puedes iniciar sesión en: http://localhost:3000/login')
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

createAdminUser()
