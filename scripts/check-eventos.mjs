import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkEventos() {
  console.log('📊 Estado de los eventos:\n')
  
  const { data: eventos, error } = await supabase
    .from('evento')
    .select('id_evento, nombre, estado, created_at')
    .order('created_at', { ascending: false })
    .limit(10)
  
  if (error) {
    console.error('❌ Error:', error)
    return
  }
  
  if (!eventos || eventos.length === 0) {
    console.log('❌ No hay eventos en la base de datos')
    return
  }
  
  console.log(`Total de eventos: ${eventos.length}\n`)
  
  eventos.forEach((evento, index) => {
    console.log(`${index + 1}. ${evento.nombre}`)
    console.log(`   Estado: ${evento.estado}`)
    console.log(`   Creado: ${new Date(evento.created_at).toLocaleString('es-ES')}`)
    console.log(`   ID: ${evento.id_evento}\n`)
  })
  
  // Contar por estado
  const pendientes = eventos.filter(e => e.estado === 'PENDIENTE').length
  const aprobados = eventos.filter(e => e.estado === 'APROBADO').length
  const rechazados = eventos.filter(e => e.estado === 'RECHAZADO').length
  
  console.log('📈 Resumen:')
  console.log(`   PENDIENTE: ${pendientes}`)
  console.log(`   APROBADO: ${aprobados}`)
  console.log(`   RECHAZADO: ${rechazados}`)
}

checkEventos()
