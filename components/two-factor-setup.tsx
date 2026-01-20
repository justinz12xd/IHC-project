'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, Smartphone, AlertCircle, CheckCircle2 } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { auditar2FA } from '@/lib/supabase/audit'

interface TwoFactorSetupProps {
  onSuccess?: () => void
}

export default function TwoFactorSetup({ onSuccess }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'initial' | 'qr' | 'verify' | 'complete'>('initial')
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createBrowserClient()

  const iniciarConfiguracion2FA = async () => {
    setLoading(true)
    setError('')
    
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Autenticación de dos factores',
      })

      if (error) throw error

      if (data) {
        setQrCode(data.totp.qr_code)
        setSecret(data.totp.secret)
        setStep('qr')
        
        // Auditar inicio de configuración
        await auditar2FA('2FA_ENABLE')
      }
    } catch (err: any) {
      console.error('[2FA] Error al iniciar configuración:', err)
      setError(err.message || 'Error al configurar 2FA')
    } finally {
      setLoading(false)
    }
  }

  const verificarCodigo = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Por favor ingresa un código de 6 dígitos')
      return
    }

    setLoading(true)
    setError('')

    try {
      const factors = await supabase.auth.mfa.listFactors()
      
      if (factors.error) throw factors.error

      const totpFactor = factors.data?.totp?.[0]
      
      if (!totpFactor) {
        throw new Error('No se encontró el factor TOTP')
      }

      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: totpFactor.id,
        code: verificationCode,
      })

      if (error) throw error

      setStep('complete')
      
      // Auditar verificación exitosa
      await auditar2FA('2FA_VERIFY')
      
      onSuccess?.()
    } catch (err: any) {
      console.error('[2FA] Error al verificar código:', err)
      setError('Código incorrecto. Por favor inténtalo nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const desactivar2FA = async () => {
    setLoading(true)
    setError('')

    try {
      const factors = await supabase.auth.mfa.listFactors()
      
      if (factors.error) throw factors.error

      const totpFactor = factors.data?.totp?.[0]
      
      if (totpFactor) {
        const { error } = await supabase.auth.mfa.unenroll({
          factorId: totpFactor.id,
        })

        if (error) throw error

        // Auditar desactivación
        await auditar2FA('2FA_DISABLE')
        
        setStep('initial')
      }
    } catch (err: any) {
      console.error('[2FA] Error al desactivar:', err)
      setError(err.message || 'Error al desactivar 2FA')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <CardTitle>Autenticación de Dos Factores (2FA)</CardTitle>
        </div>
        <CardDescription>
          Agrega una capa adicional de seguridad a tu cuenta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 'initial' && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
              <Smartphone className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-medium">¿Qué es 2FA?</p>
                <p className="text-sm text-muted-foreground">
                  La autenticación de dos factores requiere un código de tu aplicación
                  de autenticación además de tu contraseña, haciendo tu cuenta más segura.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-medium">Antes de comenzar:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Descarga una app de autenticación (Google Authenticator, Authy, etc.)</li>
                <li>Asegúrate de tener acceso a tu teléfono</li>
                <li>Guarda los códigos de respaldo en un lugar seguro</li>
              </ol>
            </div>

            <Button
              onClick={iniciarConfiguracion2FA}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Configurando...' : 'Configurar 2FA'}
            </Button>
          </div>
        )}

        {step === 'qr' && (
          <div className="space-y-4">
            <div className="text-center space-y-4">
              <p className="font-medium">Escanea este código QR con tu aplicación</p>
              
              {qrCode && (
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  <img
                    src={qrCode}
                    alt="Código QR para 2FA"
                    className="w-48 h-48"
                  />
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  O ingresa este código manualmente:
                </p>
                <code className="block p-3 bg-muted rounded text-sm font-mono break-all">
                  {secret}
                </code>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verification-code">
                Código de verificación
              </Label>
              <Input
                id="verification-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                aria-describedby="code-help"
              />
              <p id="code-help" className="text-xs text-muted-foreground">
                Ingresa el código de 6 dígitos de tu aplicación
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep('initial')}
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={verificarCodigo}
                disabled={loading || verificationCode.length !== 6}
                className="flex-1"
              >
                {loading ? 'Verificando...' : 'Verificar'}
              </Button>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">¡2FA Activado!</h3>
              <p className="text-muted-foreground">
                Tu cuenta ahora está protegida con autenticación de dos factores.
                Necesitarás tu aplicación de autenticación cada vez que inicies sesión.
              </p>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Guarda tus códigos de respaldo en un lugar seguro. Los necesitarás
                si pierdes acceso a tu aplicación de autenticación.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={desactivar2FA}
                disabled={loading}
                className="flex-1"
              >
                Desactivar 2FA
              </Button>
              <Button
                onClick={() => onSuccess?.()}
                className="flex-1"
              >
                Continuar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
