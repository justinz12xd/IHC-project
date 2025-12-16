"use client"

import { Progress } from "@/components/ui/progress"
import { CheckCircle2 } from "lucide-react"

interface FormProgressProps {
  fields: {
    name: string
    value: any
    required?: boolean
    label: string
  }[]
  className?: string
}

export function FormProgress({ fields, className = "" }: FormProgressProps) {
  const requiredFields = fields.filter(f => f.required !== false)
  const filledFields = requiredFields.filter(field => {
    if (typeof field.value === 'string') {
      return field.value.trim().length > 0
    }
    if (typeof field.value === 'number') {
      return field.value > 0
    }
    if (Array.isArray(field.value)) {
      return field.value.length > 0
    }
    return field.value !== null && field.value !== undefined && field.value !== ''
  })

  const progress = requiredFields.length > 0 
    ? Math.round((filledFields.length / requiredFields.length) * 100)
    : 0

  const isComplete = progress === 100

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-muted-foreground">
          Progreso del formulario
        </span>
        <span className={`font-semibold flex items-center gap-1.5 ${isComplete ? 'text-green-600' : 'text-primary'}`}>
          {isComplete && <CheckCircle2 className="h-4 w-4" />}
          {filledFields.length}/{requiredFields.length} campos
        </span>
      </div>
      
      <Progress 
        value={progress} 
        className="h-2"
      />
      
      {!isComplete && (
        <div className="text-xs text-muted-foreground">
          {progress < 30 && "Comienza llenando los campos obligatorios"}
          {progress >= 30 && progress < 70 && "¡Vas bien! Continúa completando el formulario"}
          {progress >= 70 && progress < 100 && "¡Casi listo! Solo faltan algunos campos"}
        </div>
      )}
      
      {isComplete && (
        <div className="text-xs text-green-600 font-medium">
          ✓ Formulario completo, listo para enviar
        </div>
      )}
    </div>
  )
}
