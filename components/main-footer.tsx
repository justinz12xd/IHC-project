import Link from "next/link"
import { Calendar, Github, Mail } from "lucide-react"

export function MainFooter() {
  return (
    <footer className="border-t bg-muted/30 mt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">Eventos Agro</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-md">
              Plataforma integral para la gestión de eventos agroproductivos. 
              Conecta productores, organizadores y asistentes en un solo lugar.
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="font-semibold mb-4">Enlaces Rápidos</h3>
            <div className="space-y-2 text-sm">
              <Link href="/" className="block text-muted-foreground hover:text-foreground transition-colors">
                Inicio
              </Link>
              <Link href="/dashboard" className="block text-muted-foreground hover:text-foreground transition-colors">
                Eventos
              </Link>
              <Link href="/register" className="block text-muted-foreground hover:text-foreground transition-colors">
                Registrarse
              </Link>
              <Link href="/login" className="block text-muted-foreground hover:text-foreground transition-colors">
                Iniciar Sesión
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <div className="space-y-2 text-sm">
              <Link href="/terms" className="block text-muted-foreground hover:text-foreground transition-colors">
                Términos y Condiciones
              </Link>
              <Link href="/privacy" className="block text-muted-foreground hover:text-foreground transition-colors">
                Política de Privacidad
              </Link>
              <Link href="/contact" className="block text-muted-foreground hover:text-foreground transition-colors">
                Contacto
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Eventos Agro. Todos los derechos reservados.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <p className="text-xs text-muted-foreground">
              🚧 Modo desarrollo - Sin autenticación
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}