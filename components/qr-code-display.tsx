"use client"

import { useEffect, useRef } from "react"
import QRCode from "qrcode"

interface QRCodeDisplayProps {
  data: string
  size?: number
}

export function QRCodeDisplay({ data, size = 300 }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, data, {
        width: size,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })
    }
  }, [data, size])

  return (
    <div className="flex justify-center">
      <canvas ref={canvasRef} className="border-4 border-border rounded-lg" aria-label="Código QR para asistencia" />
    </div>
  )
}
