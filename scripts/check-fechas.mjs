import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkFechas() {
  console.log('📅 Verificando fechas de eventos:\n')
  
  const { data: eventos, error } = await supabase
    .from('evento')
    .select('id_evento, nombre, fecha_inicio, fecha_fin, estado')
    .order('fecha_inicio', { ascending: true })
  
  if (error) {
    console.error('❌ Error:', error)
    return
  }
  
  if (!eventos || eventos.length === 0) {
    console.log('❌ No hay eventos')
    return
  }
  
  const ahora = new Date()
  console.log(`Fecha actual: ${ahora.toISOString()}\n`)
  
  eventos.forEach((evento, index) => {
    const fechaInicio = new Date(evento.fecha_inicio)
    const fechaFin = new Date(evento.fecha_fin)
    const esFuturo = fechaInicio >= ahora
    
    console.log(`${index + 1}. ${evento.nombre}`)
    console.log(`   Estado: ${evento.estado}`)
    console.log(`   Fecha inicio: ${evento.fecha_inicio} (${fechaInicio.toLocaleDateString('es-ES')})`)
    console.log(`   Fecha fin: ${evento.fecha_fin}`)
    console.log(`   ¿Es futuro?: ${esFuturo ? '✅ SÍ' : '❌ NO (pasado)'}`)
    console.log(`   Días desde hoy: ${Math.floor((fechaInicio - ahora) / (1000 * 60 * 60 * 24))}\n`)
  })
}

checkFechas()
