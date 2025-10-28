import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, FileText } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Encabezado */}
          <div className="space-y-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al inicio
              </Link>
            </Button>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Términos y Condiciones de Uso</h1>
                <p className="text-muted-foreground text-lg">
                  Última actualización: 28 de octubre de 2025
                </p>
              </div>
            </div>
          </div>

          {/* Contenido */}
          <Card>
            <CardHeader>
              <CardTitle>1. Aceptación de los Términos</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                Al acceder y utilizar la plataforma Eventos Agro ("la Plataforma"), usted acepta cumplir con estos
                Términos y Condiciones de Uso. Si no está de acuerdo con alguna parte de estos términos, no debe
                utilizar la Plataforma.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Descripción del Servicio</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                Eventos Agro es una plataforma digital que facilita la conexión entre organizadores de eventos
                agroproductivos, vendedores y asistentes. La Plataforma proporciona herramientas para:
              </p>
              <ul>
                <li>Crear y gestionar eventos agroproductivos</li>
                <li>Registrar y gestionar vendedores</li>
                <li>Control de asistencia mediante códigos QR</li>
                <li>Gestión de inventarios y catálogos de productos</li>
                <li>Generación de reportes y métricas</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Registro de Usuario</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>Para utilizar ciertas funcionalidades de la Plataforma, debe crear una cuenta proporcionando:</p>
              <ul>
                <li>Nombre completo</li>
                <li>Dirección de correo electrónico válida</li>
                <li>Contraseña segura</li>
                <li>Tipo de usuario (Normal, Vendedor, Organizador)</li>
              </ul>
              <p>
                Usted es responsable de mantener la confidencialidad de su cuenta y contraseña, y de todas las
                actividades que ocurran bajo su cuenta.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Roles y Responsabilidades</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <h3 className="font-semibold mt-4 mb-2">4.1 Usuarios Normales</h3>
              <ul>
                <li>Pueden registrarse y asistir a eventos</li>
                <li>Explorar catálogos de vendedores</li>
                <li>Generar códigos QR de asistencia</li>
              </ul>

              <h3 className="font-semibold mt-4 mb-2">4.2 Vendedores</h3>
              <ul>
                <li>Pueden crear y gestionar su catálogo de productos</li>
                <li>Solicitar participación en eventos</li>
                <li>Gestionar inventarios por evento</li>
                <li>Son responsables de la veracidad de la información de sus productos</li>
              </ul>

              <h3 className="font-semibold mt-4 mb-2">4.3 Organizadores</h3>
              <ul>
                <li>Pueden crear y gestionar eventos</li>
                <li>Aprobar o rechazar vendedores</li>
                <li>Controlar asistencia mediante escaneo QR</li>
                <li>Generar reportes de eventos</li>
                <li>Son responsables de la información y logística de sus eventos</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Uso Aceptable</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>Al utilizar la Plataforma, usted se compromete a NO:</p>
              <ul>
                <li>Publicar contenido falso, engañoso o fraudulento</li>
                <li>Violar derechos de propiedad intelectual de terceros</li>
                <li>Intentar acceder a cuentas de otros usuarios</li>
                <li>Interferir con el funcionamiento de la Plataforma</li>
                <li>Utilizar la Plataforma para actividades ilegales</li>
                <li>Enviar spam o contenido no solicitado</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Propiedad Intelectual</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                Todos los derechos de propiedad intelectual sobre la Plataforma, incluyendo pero no limitado a diseño,
                código fuente, logos y contenido, son propiedad de Eventos Agro o sus licenciantes.
              </p>
              <p>
                Los usuarios retienen los derechos sobre el contenido que publican, pero otorgan a la Plataforma una
                licencia para usar, mostrar y distribuir dicho contenido dentro del servicio.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Privacidad y Protección de Datos</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                El uso de sus datos personales está regido por nuestra{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Política de Privacidad
                </Link>
                . Al utilizar la Plataforma, usted acepta la recopilación y uso de información de acuerdo con dicha
                política.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Limitación de Responsabilidad</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                Eventos Agro proporciona la Plataforma "tal cual" y no garantiza que esté libre de errores o
                interrupciones. No nos hacemos responsables de:
              </p>
              <ul>
                <li>Pérdidas o daños resultantes del uso de la Plataforma</li>
                <li>Contenido publicado por usuarios</li>
                <li>Transacciones o acuerdos entre usuarios</li>
                <li>Problemas técnicos o interrupciones del servicio</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Modificaciones</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                Nos reservamos el derecho de modificar estos Términos en cualquier momento. Los cambios entrarán en
                vigor inmediatamente después de su publicación. Es su responsabilidad revisar periódicamente estos
                Términos.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Contacto</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>Para cualquier pregunta sobre estos Términos y Condiciones, puede contactarnos en:</p>
              <ul>
                <li>
                  <strong>Email:</strong> legal@eventosagro.com
                </li>
                <li>
                  <strong>Formulario de contacto:</strong>{" "}
                  <Link href="/contact" className="text-primary hover:underline">
                    /contact
                  </Link>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Footer de la página */}
          <div className="pt-8 border-t text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Al continuar utilizando Eventos Agro, usted acepta estos Términos y Condiciones.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild variant="outline">
                <Link href="/privacy">Política de Privacidad</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/contact">Contacto</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
