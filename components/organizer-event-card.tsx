import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Store, BarChart3, QrCode } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface OrganizerEventCardProps {
  event: any
  isPast?: boolean
}

export function OrganizerEventCard({ event, isPast }: OrganizerEventCardProps) {
  const eventDate = new Date(event.date)
  const registrations = event.event_registrations?.length || 0
  const approvedVendors = event.event_vendors?.filter((ev: any) => ev.status === "approved").length || 0
  const pendingVendors = event.event_vendors?.filter((ev: any) => ev.status === "pending").length || 0

  const statusColors = {
    draft: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
    pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    approved: "bg-green-500/10 text-green-700 dark:text-green-400",
    rejected: "bg-red-500/10 text-red-700 dark:text-red-400",
  }

  const statusLabels = {
    draft: "Borrador",
    pending: "Pendiente",
    approved: "Aprobado",
    rejected: "Rechazado",
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <CardTitle className="text-lg text-balance flex-1">{event.name}</CardTitle>
          <Badge variant="secondary" className={statusColors[event.status as keyof typeof statusColors]}>
            {statusLabels[event.status as keyof typeof statusLabels]}
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

      <CardContent className="flex-1 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <span className="font-medium">{registrations}</span>
            <span className="text-muted-foreground">registros</span>
          </div>

          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <span className="font-medium">{approvedVendors}</span>
            <span className="text-muted-foreground">vendedores</span>
          </div>
        </div>

        {pendingVendors > 0 && (
          <Badge variant="outline" className="text-xs">
            {pendingVendors} vendedor{pendingVendors !== 1 ? "es" : ""} pendiente{pendingVendors !== 1 ? "s" : ""}
          </Badge>
        )}
      </CardContent>

      <CardFooter className="gap-2">
        {isPast ? (
          <Button asChild variant="outline" className="flex-1 bg-transparent">
            <Link href={`/organizer/events/${event.id}/report`}>
              <BarChart3 className="mr-2 h-4 w-4" aria-hidden="true" />
              Ver Reporte
            </Link>
          </Button>
        ) : (
          <>
            {event.status === "approved" && (
              <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                <Link href={`/organizer/events/${event.id}/scan`}>
                  <QrCode className="mr-2 h-4 w-4" aria-hidden="true" />
                  Escanear
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" className="flex-1 bg-transparent">
              <Link href={`/organizer/events/${event.id}/edit`}>Editar</Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href={`/organizer/events/${event.id}`}>Gestionar</Link>
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
