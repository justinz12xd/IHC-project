import { createBrowserClient } from './client'

interface AuditLogParams {
  accion: string
  entidad: string
  entidadId?: number
  detalles?: Record<string, any>
  resultado?: 'exito' | 'fallo' | 'pendiente'
}

/**
 * Registra una acción en el sistema de auditoría
 * ISO 25010: Security - Accountability
 */
export async function registrarAuditoria({
  accion,
  entidad,
  entidadId,
  detalles,
  resultado = 'exito',
}: AuditLogParams) {
  try {
    const supabase = createBrowserClient()
    
    // Obtener información del usuario
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.warn('[Auditoría] No hay usuario autenticado')
      return
    }

    // Obtener información del navegador
    const ipAddress = await obtenerIP()
    const userAgent = navigator.userAgent

    // Llamar a la función RPC de Supabase
    const { error } = await supabase.rpc('registrar_auditoria', {
      p_id_usuario: user.id,
      p_accion: accion,
      p_entidad: entidad,
      p_entidad_id: entidadId,
      p_detalles: detalles ? JSON.stringify(detalles) : null,
      p_ip_address: ipAddress,
      p_user_agent: userAgent,
      p_resultado: resultado,
    })

    if (error) {
      console.error('[Auditoría] Error al registrar:', error)
    } else {
      console.log(`[Auditoría] ✅ ${accion} en ${entidad} registrado`)
    }
  } catch (err) {
    console.error('[Auditoría] Error inesperado:', err)
  }
}

/**
 * Obtener dirección IP del cliente (aproximada)
 */
async function obtenerIP(): Promise<string | null> {
  try {
    // Usar servicio externo solo en producción
    if (process.env.NODE_ENV === 'production') {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    }
    return 'localhost'
  } catch {
    return null
  }
}

/**
 * Helper para auditar acciones de login
 */
export async function auditarLogin(exitoso: boolean, email?: string) {
  await registrarAuditoria({
    accion: exitoso ? 'LOGIN' : 'LOGIN_FAILED',
    entidad: 'auth',
    detalles: { email },
    resultado: exitoso ? 'exito' : 'fallo',
  })
}

/**
 * Helper para auditar creación de entidades
 */
export async function auditarCreacion(
  entidad: string,
  entidadId: number,
  detalles?: Record<string, any>
) {
  await registrarAuditoria({
    accion: 'CREATE',
    entidad,
    entidadId,
    detalles,
  })
}

/**
 * Helper para auditar actualizaciones
 */
export async function auditarActualizacion(
  entidad: string,
  entidadId: number,
  cambios: Record<string, any>
) {
  await registrarAuditoria({
    accion: 'UPDATE',
    entidad,
    entidadId,
    detalles: { cambios },
  })
}

/**
 * Helper para auditar pagos/transacciones
 */
export async function auditarPago(
  entidadId: number,
  monto: number,
  metodo: string,
  exitoso: boolean
) {
  await registrarAuditoria({
    accion: 'PAYMENT',
    entidad: 'transaccion',
    entidadId,
    detalles: { monto, metodo },
    resultado: exitoso ? 'exito' : 'fallo',
  })
}

/**
 * Helper para auditar habilitación/deshabilitación de 2FA
 */
export async function auditar2FA(accion: '2FA_ENABLE' | '2FA_DISABLE' | '2FA_VERIFY') {
  await registrarAuditoria({
    accion,
    entidad: 'auth',
    detalles: { timestamp: new Date().toISOString() },
  })
}
