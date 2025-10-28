import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Package, QrCode } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface VendorEventCardProps {
  eventVendor: any
  vendorId: string
  isPast?: boolean
}

export function VendorEventCard({ eventVendor, vendorId, isPast }: VendorEventCardProps) {
  const event = eventVendor.events
  if (!event) return null

  const eventDate = new Date(event.date)

  const statusColors = {
    pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    approved: "bg-green-500/10 text-green-700 dark:text-green-400",
    rejected: "bg-red-500/10 text-red-700 dark:text-red-400",
  }

  const statusLabels = {
    pending: "Pendiente",
    approved: "Aprobado",
    rejected: "Rechazado",
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <CardTitle className="text-lg text-balance flex-1">{event.name}</CardTitle>
          <Badge variant="secondary" className={statusColors[eventVendor.status as keyof typeof statusColors]}>
            {statusLabels[eventVendor.status as keyof typeof statusLabels]}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
            <time dateTime={event.date}>{format(eventDate, "d 'de' MMMM, yyyy", { locale: es })}</time>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-2 text-pretty">{event.description}</p>
      </CardContent>

      <CardFooter className="gap-2">
        {eventVendor.status === "approved" && !isPast && (
          <>
            <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
              <Link href={`/vendor/events/${event.id}/qr`}>
                <QrCode className="mr-2 h-4 w-4" aria-hidden="true" />
                Mi QR
              </Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href={`/vendor/events/${event.id}/inventory`}>
                <Package className="mr-2 h-4 w-4" aria-hidden="true" />
                Inventario
              </Link>
            </Button>
          </>
        )}
        {(eventVendor.status !== "approved" || isPast) && (
          <Button asChild variant="outline" className="w-full bg-transparent">
            <Link href={`/events/${event.id}`}>Ver Detalles</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
