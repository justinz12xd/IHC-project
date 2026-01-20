'use client'

import { Component, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: string
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[ErrorBoundary] Error capturado:', error, errorInfo)
    this.setState({
      error,
      errorInfo: errorInfo.componentStack,
    })

    // Log error a servicio de monitoreo (ej: Sentry)
    if (typeof window !== 'undefined') {
      // TODO: Integrar con servicio de logging
      console.log('[ErrorBoundary] Enviando error a servicio de monitoreo...')
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-destructive" />
                <CardTitle className="text-2xl">
                  Algo salió mal
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Ocurrió un error inesperado en la aplicación. Estamos trabajando para solucionarlo.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-4 p-4 bg-muted rounded-md">
                  <p className="font-mono text-sm text-destructive mb-2">
                    <strong>Error:</strong> {this.state.error.message}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm font-semibold mb-2">
                        Stack Trace
                      </summary>
                      <pre className="text-xs overflow-auto max-h-48 bg-background p-2 rounded">
                        {this.state.errorInfo}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
                    window.location.reload()
                  }}
                  className="flex-1"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Recargar Página
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
                    window.location.href = '/'
                  }}
                  className="flex-1"
                >
                  Ir al Inicio
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
