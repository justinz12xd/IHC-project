// Script de diagnóstico de autenticación
// Ejecutar con: node scripts/DIAGNOSTICO-AUTH.js

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function diagnosticar() {
  console.log('🔍 DIAGNÓSTICO DE AUTENTICACIÓN\n')
  console.log('=' .repeat(60))
  
  // 1. Verificar conexión
  console.log('\n1️⃣  Verificando conexión a Supabase...')
  try {
    const { data, error } = await supabase.from('usuario').select('count').limit(1)
    if (error) {
      console.log('❌ Error:', error.message)
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('⚠️  LA TABLA "usuario" NO EXISTE')
        console.log('📝 SOLUCIÓN: Ejecuta scripts/MIGRACION-LOCAL-COMPLETA.sql en http://localhost:54323')
        console.log('   1. Abre http://localhost:54323')
        console.log('   2. Ve a SQL Editor')
        console.log('   3. Copia y pega TODO el contenido de scripts/MIGRACION-LOCAL-COMPLETA.sql')
        console.log('   4. Haz clic en Run')
        return
      }
    } else {
      console.log('✅ Conexión exitosa')
    }
  } catch (err) {
    console.log('❌ Error de conexión:', err.message)
    return
  }

  // 2. Listar usuarios en auth.users
  console.log('\n2️⃣  Usuarios en auth.users:')
  try {
    // Nota: No podemos acceder directamente a auth.users desde el cliente
    // Pero podemos verificar la sesión actual
    const { data: sessionData } = await supabase.auth.getSession()
    if (sessionData.session) {
      console.log('✅ Hay una sesión activa:')
      console.log('   User ID:', sessionData.session.user.id)
      console.log('   Email:', sessionData.session.user.email)
      console.log('   Metadata:', JSON.stringify(sessionData.session.user.user_metadata, null, 2))
    } else {
      console.log('ℹ️  No hay sesión activa')
    }
  } catch (err) {
    console.log('❌ Error:', err.message)
  }

  // 3. Listar usuarios en tabla usuario
  console.log('\n3️⃣  Usuarios en tabla usuario:')
  try {
    const { data, error } = await supabase
      .from('usuario')
      .select('id_usuario, correo, nombre, apellido, rol, auth_id, estado')
      .order('fecha_creacion', { ascending: false })
      .limit(10)
    
    if (error) {
      console.log('❌ Error:', error.message)
    } else if (!data || data.length === 0) {
      console.log('⚠️  No hay usuarios en la tabla')
    } else {
      console.log(`✅ ${data.length} usuario(s) encontrado(s):`)
      data.forEach((user, idx) => {
        console.log(`\n   ${idx + 1}. ${user.nombre} ${user.apellido}`)
        console.log(`      Email: ${user.correo}`)
        console.log(`      Rol: ${user.rol}`)
        console.log(`      Auth ID: ${user.auth_id}`)
        console.log(`      Estado: ${user.estado}`)
      })
    }
  } catch (err) {
    console.log('❌ Error:', err.message)
  }

  // 4. Probar registro de nuevo usuario
  console.log('\n4️⃣  Probando registro de nuevo usuario...')
  const testEmail = `test_${Date.now()}@test.com`
  try {
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'test123456',
      options: {
        data: {
          nombre: 'Test',
          apellido: 'Usuario',
          rol: 'normal'
        }
      }
    })
    
    if (signUpError) {
      console.log('❌ Error en registro:', signUpError.message)
    } else if (authData.user) {
      console.log('✅ Usuario creado en auth.users:', authData.user.id)
      
      // Verificar si se creó en tabla usuario
      await new Promise(resolve => setTimeout(resolve, 1000)) // Esperar 1 segundo
      
      const { data: usuarioData, error: usuarioError } = await supabase
        .from('usuario')
        .select('*')
        .eq('auth_id', authData.user.id)
        .maybeSingle()
      
      if (usuarioError) {
        console.log('❌ Error buscando en tabla usuario:', usuarioError.message)
      } else if (usuarioData) {
        console.log('✅ Usuario también creado en tabla usuario:', usuarioData.id_usuario)
      } else {
        console.log('⚠️  Usuario NO se creó en tabla usuario (trigger no funcionó)')
        console.log('   Esto significa que el trigger handle_new_user no está configurado')
      }
      
      // Limpiar usuario de prueba
      console.log('\n   Limpiando usuario de prueba...')
      // Nota: No podemos eliminar usuarios desde el cliente en Supabase local sin permisos admin
    }
  } catch (err) {
    console.log('❌ Error:', err.message)
  }

  // 5. Probar login con credenciales incorrectas
  console.log('\n5️⃣  Probando login con credenciales incorrectas...')
  try {
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: 'noexiste@test.com',
      password: 'wrongpassword'
    })
    
    if (loginError) {
      console.log('✅ Error esperado:', loginError.message)
    } else {
      console.log('⚠️  No debería haber iniciado sesión')
    }
  } catch (err) {
    console.log('❌ Error:', err.message)
  }

  console.log('\n' + '='.repeat(60))
  console.log('\n✨ Diagnóstico completado\n')
}

diagnosticar().catch(console.error)
