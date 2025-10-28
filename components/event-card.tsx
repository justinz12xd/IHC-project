import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, CheckCircle2, QrCode } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface EventCardProps {
  event: any
  registered?: boolean
  attended?: boolean
}

export function EventCard({ event, registered, attended }: EventCardProps) {
  const eventDate = new Date(event.date)
  const vendorCount = event.event_vendors?.length || 0

  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-xl font-semibold leading-tight text-balance">{event.name}</h3>
          {registered && (
            <Badge variant="secondary" className="shrink-0">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Registrado
            </Badge>
          )}
          {attended && (
            <Badge variant="outline" className="shrink-0">
              Asistido
            </Badge>
          )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 text-pretty">{event.description}</p>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
          <time dateTime={event.date}>{format(eventDate, "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}</time>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
          <span className="line-clamp-1">{event.location}</span>
        </div>

        {event.capacity && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
            <span>Capacidad: {event.capacity} personas</span>
          </div>
        )}

        {vendorCount > 0 && (
          <div className="pt-2">
            <p className="text-sm font-medium mb-2">
              {vendorCount} {vendorCount === 1 ? "vendedor" : "vendedores"}
            </p>
            <div className="flex -space-x-2">
              {event.event_vendors.slice(0, 3).map((ev: any, idx: number) => (
                <div
                  key={idx}
                  className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium"
                  title={ev.vendors?.business_name}
                >
                  {ev.vendors?.business_name?.charAt(0).toUpperCase()}
                </div>
              ))}
              {vendorCount > 3 && (
                <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                  +{vendorCount - 3}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2">
        {registered && !attended && (
          <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
            <Link href={`/events/${event.id}/qr`}>
              <QrCode className="mr-2 h-4 w-4" aria-hidden="true" />
              Mi QR
            </Link>
          </Button>
        )}
        <Button
          asChild
          className={registered && !attended ? "flex-1" : "w-full"}
          variant={attended ? "outline" : "default"}
        >
          <Link href={`/events/${event.id}`}>{attended ? "Ver Detalles" : registered ? "Ver Evento" : "Ver Más"}</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
