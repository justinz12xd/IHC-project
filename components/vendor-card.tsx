import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Package, Target, BookOpen } from "lucide-react"

interface VendorCardProps {
  vendor: any
}

export function VendorCard({ vendor }: VendorCardProps) {
  const products = vendor.products || []

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start gap-4">
          {vendor.logo_url ? (
            <img
              src={vendor.logo_url || "/placeholder.svg"}
              alt={`Logo de ${vendor.business_name}`}
              className="h-16 w-16 rounded-lg object-cover"
            />
          ) : (
            <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
              <span className="text-2xl font-bold">{vendor.business_name?.charAt(0).toUpperCase()}</span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl text-balance">{vendor.business_name}</CardTitle>
            <CardDescription className="mt-1 text-pretty">{vendor.description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {vendor.story && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <BookOpen className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span>Nuestra Historia</span>
            </div>
            <p className="text-sm text-muted-foreground text-pretty pl-6">{vendor.story}</p>
          </div>
        )}

        {vendor.objectives && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Target className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span>Objetivos</span>
            </div>
            <p className="text-sm text-muted-foreground text-pretty pl-6">{vendor.objectives}</p>
          </div>
        )}

        {products.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Package className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span>Productos ({products.length})</span>
              </div>

              <div className="space-y-3 pl-6">
                {products.map((product: any) => (
                  <div key={product.id} className="space-y-1">
                    <h4 className="font-medium text-sm">{product.name}</h4>
                    <p className="text-sm text-muted-foreground text-pretty">{product.description}</p>
                    {product.benefits && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.benefits.split(",").map((benefit: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {benefit.trim()}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
