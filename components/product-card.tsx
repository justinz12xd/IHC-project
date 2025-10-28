import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Package } from "lucide-react"

interface ProductCardProps {
  product: any
  isOwner?: boolean
}

export function ProductCard({ product, isOwner }: ProductCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        {product.image_url ? (
          <img
            src={product.image_url || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
        ) : (
          <div className="w-full h-48 bg-muted rounded-lg mb-4 flex items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
          </div>
        )}

        <CardTitle className="text-xl text-balance">{product.name}</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <p className="text-sm text-muted-foreground text-pretty line-clamp-3">{product.description}</p>

        {product.benefits && (
          <div className="flex flex-wrap gap-1">
            {product.benefits
              .split(",")
              .slice(0, 3)
              .map((benefit: string, idx: number) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {benefit.trim()}
                </Badge>
              ))}
          </div>
        )}

        {product.creation_story && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground line-clamp-2 text-pretty">{product.creation_story}</p>
          </div>
        )}
      </CardContent>

      {isOwner && (
        <CardFooter>
          <Button asChild variant="outline" className="w-full bg-transparent">
            <Link href={`/vendor/products/${product.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" aria-hidden="true" />
              Editar
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
