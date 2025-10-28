"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Camera, CameraOff, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import jsQR from "jsqr"

interface QRScannerProps {
  eventId: string
}

export function QRScanner({ eventId }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastScan, setLastScan] = useState<{ success: boolean; message: string } | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createBrowserClient()

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsScanning(true)

        // Start scanning loop
        scanIntervalRef.current = setInterval(() => {
          scanQRCode()
        }, 500)
      }
    } catch (error) {
      console.error("[v0] Error accessing camera:", error)
      toast({
        title: "Error",
        description: "No se pudo acceder a la cámara",
        variant: "destructive",
      })
    }
  }

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }

    setIsScanning(false)
  }

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height)

    if (code) {
      processQRCode(code.data)
    }
  }

  const processQRCode = async (data: string) => {
    setIsProcessing(true)

    try {
      const qrData = JSON.parse(data)

      if (qrData.eventId !== eventId) {
        setLastScan({
          success: false,
          message: "Este código QR no es válido para este evento",
        })
        setTimeout(() => setLastScan(null), 3000)
        setIsProcessing(false)
        return
      }

      // Check if already registered
      const { data: existing } = await supabase
        .from("attendances")
        .select("*")
        .eq("event_id", eventId)
        .eq("user_id", qrData.userId)
        .eq("user_type", qrData.type)
        .single()

      if (existing) {
        setLastScan({
          success: false,
          message: "Esta persona ya registró su asistencia",
        })
        setTimeout(() => setLastScan(null), 3000)
        setIsProcessing(false)
        return
      }

      // Register attendance
      const { error } = await supabase.from("attendances").insert({
        event_id: eventId,
        user_id: qrData.userId,
        user_type: qrData.type,
        checked_in_at: new Date().toISOString(),
      })

      if (error) throw error

      setLastScan({
        success: true,
        message: "Asistencia registrada exitosamente",
      })

      toast({
        title: "Asistencia registrada",
        description: "La asistencia se registró correctamente",
      })

      setTimeout(() => setLastScan(null), 3000)
      router.refresh()
    } catch (error) {
      console.error("[v0] Error processing QR:", error)
      setLastScan({
        success: false,
        message: "Código QR inválido",
      })
      setTimeout(() => setLastScan(null), 3000)
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        {!isScanning ? (
          <Button onClick={startScanning} size="lg">
            <Camera className="mr-2 h-5 w-5" aria-hidden="true" />
            Iniciar Escaneo
          </Button>
        ) : (
          <Button onClick={stopScanning} variant="outline" size="lg">
            <CameraOff className="mr-2 h-5 w-5" aria-hidden="true" />
            Detener Escaneo
          </Button>
        )}
      </div>

      {isScanning && (
        <div className="space-y-4">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              aria-label="Vista de cámara para escanear QR"
            />
            <canvas ref={canvasRef} className="hidden" />

            {isProcessing && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="h-12 w-12 text-white animate-spin" aria-hidden="true" />
              </div>
            )}
          </div>

          <p className="text-center text-sm text-muted-foreground">Apunta la cámara al código QR del asistente</p>
        </div>
      )}

      {lastScan && (
        <Alert variant={lastScan.success ? "default" : "destructive"}>
          {lastScan.success ? (
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          ) : (
            <XCircle className="h-4 w-4" aria-hidden="true" />
          )}
          <AlertTitle>{lastScan.success ? "Éxito" : "Error"}</AlertTitle>
          <AlertDescription>{lastScan.message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
