"use client"

import { useMemo } from "react"
import { Progress } from "@/components/ui/progress"

interface PasswordStrengthProps {
  password: string
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "" }

    let score = 0
    
    // Longitud
    if (password.length >= 6) score += 20
    if (password.length >= 8) score += 10
    if (password.length >= 12) score += 10
    
    // Minúsculas
    if (/[a-z]/.test(password)) score += 15
    
    // Mayúsculas
    if (/[A-Z]/.test(password)) score += 15
    
    // Números
    if (/[0-9]/.test(password)) score += 15
    
    // Caracteres especiales
    if (/[^a-zA-Z0-9]/.test(password)) score += 15

    let label = ""
    let color = ""

    if (score < 30) {
      label = "Muy débil"
      color = "bg-red-500"
    } else if (score < 50) {
      label = "Débil"
      color = "bg-orange-500"
    } else if (score < 70) {
      label = "Media"
      color = "bg-yellow-500"
    } else if (score < 90) {
      label = "Fuerte"
      color = "bg-blue-500"
    } else {
      label = "Muy fuerte"
      color = "bg-green-500"
    }

    return { score, label, color }
  }, [password])

  if (!password) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Fuerza de la contraseña:</span>
        <span className={`font-medium ${
          strength.score < 30 ? "text-red-500" :
          strength.score < 50 ? "text-orange-500" :
          strength.score < 70 ? "text-yellow-500" :
          strength.score < 90 ? "text-blue-500" :
          "text-green-500"
        }`}>
          {strength.label}
        </span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full transition-all duration-300 ${strength.color}`}
          style={{ width: `${strength.score}%` }}
        />
      </div>
      <ul className="text-xs text-muted-foreground space-y-1">
        <li className={password.length >= 8 ? "text-green-600" : ""}>
          ✓ Al menos 8 caracteres {password.length >= 8 ? "✓" : ""}
        </li>
        <li className={/[A-Z]/.test(password) ? "text-green-600" : ""}>
          ✓ Una mayúscula {/[A-Z]/.test(password) ? "✓" : ""}
        </li>
        <li className={/[a-z]/.test(password) ? "text-green-600" : ""}>
          ✓ Una minúscula {/[a-z]/.test(password) ? "✓" : ""}
        </li>
        <li className={/[0-9]/.test(password) ? "text-green-600" : ""}>
          ✓ Un número {/[0-9]/.test(password) ? "✓" : ""}
        </li>
        <li className={/[^a-zA-Z0-9]/.test(password) ? "text-green-600" : ""}>
          ✓ Un carácter especial {/[^a-zA-Z0-9]/.test(password) ? "✓" : ""}
        </li>
      </ul>
    </div>
  )
}
