"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface FailedAttempt {
  email: string
  timestamp: string
  userAgent: string
}

export function SecurityNotifications() {
  const [failedAttempts, setFailedAttempts] = useState<FailedAttempt[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Cargar intentos fallidos desde localStorage
    const loadFailedAttempts = () => {
      try {
        const attempts = JSON.parse(localStorage.getItem("failed_login_attempts") || "[]")
        setFailedAttempts(attempts)
      } catch (error) {
        console.error("Error loading failed attempts:", error)
      }
    }

    loadFailedAttempts()

    // Actualizar cada 30 segundos
    const interval = setInterval(loadFailedAttempts, 30000)

    return () => clearInterval(interval)
  }, [])

  const dismissAttempt = (timestamp: string) => {
    setDismissed(new Set([...dismissed, timestamp]))
  }

  const clearAllAttempts = () => {
    localStorage.removeItem("failed_login_attempts")
    setFailedAttempts([])
  }

  // Agrupar intentos por email
  const groupedAttempts = failedAttempts.reduce((acc, attempt) => {
    if (!dismissed.has(attempt.timestamp)) {
      if (!acc[attempt.email]) {
        acc[attempt.email] = []
      }
      acc[attempt.email].push(attempt)
    }
    return acc
  }, {} as Record<string, FailedAttempt[]>)

  const totalAttempts = Object.keys(groupedAttempts).length

  if (totalAttempts === 0) {
    return null
  }

  return (
    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <CardTitle className="text-orange-900 dark:text-orange-100">
              Alertas de Seguridad
            </CardTitle>
          </div>
          <Badge variant="destructive">{totalAttempts}</Badge>
        </div>
        <CardDescription className="text-orange-700 dark:text-orange-300">
          Se han detectado intentos fallidos de inicio de sesión
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(groupedAttempts).map(([email, attempts]) => (
          <Alert key={email} variant="destructive" className="relative">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="flex items-center justify-between pr-8">
              <span>{email}</span>
              <Badge variant="outline">{attempts.length} intento{attempts.length > 1 ? 's' : ''}</Badge>
            </AlertTitle>
            <AlertDescription className="space-y-1">
              <p className="text-sm">
                Último intento:{" "}
                {formatDistanceToNow(new Date(attempts[attempts.length - 1].timestamp), {
                  addSuffix: true,
                  locale: es,
                })}
              </p>
              {attempts.length > 1 && (
                <p className="text-xs text-muted-foreground">
                  Primer intento:{" "}
                  {formatDistanceToNow(new Date(attempts[0].timestamp), {
                    addSuffix: true,
                    locale: es,
                  })}
                </p>
              )}
            </AlertDescription>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={() => dismissAttempt(attempts[attempts.length - 1].timestamp)}
            >
              <X className="h-4 w-4" />
            </Button>
          </Alert>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={clearAllAttempts}
          className="w-full"
        >
          Limpiar todas las alertas
        </Button>
      </CardContent>
    </Card>
  )
}
