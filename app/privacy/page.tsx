import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Shield } from "lucide-react"

export default function PrivacyPage() {
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
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Política de Privacidad</h1>
                <p className="text-muted-foreground text-lg">
                  Última actualización: 28 de octubre de 2025
                </p>
              </div>
            </div>
          </div>

          {/* Introducción */}
          <Card>
            <CardContent className="pt-6 prose prose-sm max-w-none dark:prose-invert">
              <p>
                En Eventos Agro, nos tomamos muy en serio la privacidad de nuestros usuarios. Esta Política de
                Privacidad describe cómo recopilamos, usamos, almacenamos y protegemos su información personal cuando
                utiliza nuestra plataforma.
              </p>
            </CardContent>
          </Card>

          {/* Información que recopilamos */}
          <Card>
            <CardHeader>
              <CardTitle>1. Información que Recopilamos</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <h3 className="font-semibold mt-4 mb-2">1.1 Información que usted nos proporciona</h3>
              <ul>
                <li><strong>Datos de registro:</strong> Nombre completo, correo electrónico, contraseña (encriptada), tipo de usuario</li>
                <li><strong>Información de perfil:</strong> Número de teléfono, avatar, preferencias</li>
                <li><strong>Contenido del usuario:</strong> Información de eventos, productos, descripciones, imágenes</li>
                <li><strong>Comunicaciones:</strong> Mensajes enviados a través de formularios de contacto</li>
              </ul>

              <h3 className="font-semibold mt-4 mb-2">1.2 Información recopilada automáticamente</h3>
              <ul>
                <li><strong>Datos de uso:</strong> Páginas visitadas, tiempo de uso, interacciones</li>
                <li><strong>Información del dispositivo:</strong> Tipo de dispositivo, navegador, sistema operativo</li>
                <li><strong>Cookies y tecnologías similares:</strong> Para mejorar la experiencia del usuario</li>
                <li><strong>Códigos QR:</strong> Registros de asistencia a eventos</li>
              </ul>
            </CardContent>
          </Card>

          {/* Cómo usamos la información */}
          <Card>
            <CardHeader>
              <CardTitle>2. Cómo Usamos su Información</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>Utilizamos la información recopilada para:</p>
              <ul>
                <li>Proporcionar, mantener y mejorar nuestros servicios</li>
                <li>Crear y gestionar su cuenta de usuario</li>
                <li>Procesar su registro a eventos</li>
                <li>Facilitar la comunicación entre usuarios, organizadores y vendedores</li>
                <li>Generar códigos QR para control de asistencia</li>
                <li>Enviar notificaciones sobre eventos y actualizaciones importantes</li>
                <li>Analizar el uso de la plataforma para mejorar la experiencia</li>
                <li>Prevenir fraudes y garantizar la seguridad</li>
                <li>Cumplir con obligaciones legales</li>
              </ul>
            </CardContent>
          </Card>

          {/* Compartir información */}
          <Card>
            <CardHeader>
              <CardTitle>3. Compartir Información</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>No vendemos ni alquilamos su información personal a terceros. Podemos compartir su información en las siguientes circunstancias:</p>
              <ul>
                <li><strong>Con otros usuarios:</strong> Su nombre y rol son visibles para organizadores y otros participantes según el contexto</li>
                <li><strong>Organizadores de eventos:</strong> Tienen acceso a la información de asistentes registrados a sus eventos</li>
                <li><strong>Proveedores de servicios:</strong> Terceros que nos ayudan a operar la plataforma (hosting, analytics)</li>
                <li><strong>Requisitos legales:</strong> Si es requerido por ley o para proteger nuestros derechos</li>
                <li><strong>Con su consentimiento:</strong> Cuando usted nos autorice específicamente</li>
              </ul>
            </CardContent>
          </Card>

          {/* Almacenamiento y seguridad */}
          <Card>
            <CardHeader>
              <CardTitle>4. Almacenamiento y Seguridad</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <h3 className="font-semibold mt-4 mb-2">4.1 Almacenamiento</h3>
              <p>
                En la versión actual de desarrollo, los datos se almacenan localmente en su navegador (localStorage).
                En producción, los datos se almacenarían en servidores seguros con copias de seguridad regulares.
              </p>

              <h3 className="font-semibold mt-4 mb-2">4.2 Medidas de Seguridad</h3>
              <ul>
                <li>Encriptación de contraseñas</li>
                <li>Conexiones seguras (HTTPS)</li>
                <li>Autenticación de dos factores (próximamente)</li>
                <li>Monitoreo de actividad sospechosa</li>
                <li>Copias de seguridad periódicas</li>
              </ul>

              <p>
                Sin embargo, ningún método de transmisión por Internet es 100% seguro. Hacemos nuestro mejor esfuerzo,
                pero no podemos garantizar la seguridad absoluta.
              </p>
            </CardContent>
          </Card>

          {/* Derechos del usuario */}
          <Card>
            <CardHeader>
              <CardTitle>5. Sus Derechos</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>Usted tiene derecho a:</p>
              <ul>
                <li><strong>Acceder:</strong> Solicitar una copia de su información personal</li>
                <li><strong>Rectificar:</strong> Corregir información inexacta o incompleta</li>
                <li><strong>Eliminar:</strong> Solicitar la eliminación de su cuenta y datos</li>
                <li><strong>Portabilidad:</strong> Recibir sus datos en un formato estructurado</li>
                <li><strong>Oposición:</strong> Oponerse al procesamiento de sus datos en ciertas circunstancias</li>
                <li><strong>Revocar consentimiento:</strong> Retirar su consentimiento en cualquier momento</li>
              </ul>
              <p>
                Para ejercer estos derechos, puede acceder a la configuración de su perfil o contactarnos en
                privacy@eventosagro.com
              </p>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>6. Cookies y Tecnologías Similares</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>Utilizamos cookies y tecnologías similares para:</p>
              <ul>
                <li>Mantener su sesión activa</li>
                <li>Recordar sus preferencias</li>
                <li>Analizar el uso de la plataforma</li>
                <li>Personalizar su experiencia</li>
              </ul>
              <p>
                Puede configurar su navegador para rechazar cookies, pero esto puede afectar la funcionalidad de la
                plataforma.
              </p>
            </CardContent>
          </Card>

          {/* Menores de edad */}
          <Card>
            <CardHeader>
              <CardTitle>7. Menores de Edad</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                Nuestra plataforma no está dirigida a menores de 18 años. No recopilamos intencionalmente información
                personal de menores. Si descubrimos que un menor nos ha proporcionado información personal, la
                eliminaremos inmediatamente.
              </p>
            </CardContent>
          </Card>

          {/* Retención de datos */}
          <Card>
            <CardHeader>
              <CardTitle>8. Retención de Datos</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                Conservamos su información personal durante el tiempo que mantenga su cuenta activa o según sea
                necesario para proporcionarle servicios. Podemos conservar cierta información por más tiempo si:
              </p>
              <ul>
                <li>Es necesario para cumplir con obligaciones legales</li>
                <li>Se requiere para resolver disputas</li>
                <li>Es necesario para hacer cumplir nuestros acuerdos</li>
              </ul>
            </CardContent>
          </Card>

          {/* Cambios a la política */}
          <Card>
            <CardHeader>
              <CardTitle>9. Cambios a esta Política</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                Podemos actualizar esta Política de Privacidad periódicamente. Le notificaremos sobre cambios
                significativos publicando la nueva política en esta página y actualizando la fecha de "Última
                actualización". Se le recomienda revisar esta política periódicamente.
              </p>
            </CardContent>
          </Card>

          {/* Contacto */}
          <Card>
            <CardHeader>
              <CardTitle>10. Contacto</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>Si tiene preguntas sobre esta Política de Privacidad, puede contactarnos:</p>
              <ul>
                <li><strong>Email:</strong> privacy@eventosagro.com</li>
                <li><strong>Formulario de contacto:</strong> <Link href="/contact" className="text-primary hover:underline">/contact</Link></li>
              </ul>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="pt-8 border-t text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Al utilizar Eventos Agro, usted acepta esta Política de Privacidad.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild variant="outline">
                <Link href="/terms">Términos y Condiciones</Link>
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
