"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WifiOff } from "lucide-react"
import Link from "next/link"

export default function OfflinePage() {
  return (
    <div className="container mx-auto py-16 px-4">
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-12 pb-8 text-center">
          <WifiOff className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
          <h1 className="text-2xl font-bold mb-3">Sin Conexión</h1>
          <p className="text-muted-foreground mb-6">
            No se puede conectar al servidor. Por favor, verifica tu conexión a internet e inténtalo nuevamente.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Reintentar Conexión
            </Button>
            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                Volver al Inicio
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
