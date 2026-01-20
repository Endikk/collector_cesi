import { prisma } from "@/lib/prisma";
import { Package, Search } from "lucide-react";
import BlurFade from "@/components/magicui/blur-fade";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const revalidate = 10;

async function getItems() {
  try {
    return await prisma.item.findMany({
      include: {
        owner: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export default async function Home() {
  const items = await getItems();
  const BLUR_FADE_DELAY = 0.04;

  return (
    <div className="container mx-auto py-12 px-4">
      <BlurFade delay={BLUR_FADE_DELAY}>
        <div className="flex flex-col items-center text-center mb-16 space-y-4">
          <Badge variant="outline" className="px-4 py-1 border-yellow-500/50 text-yellow-500 bg-yellow-500/10">
            Nouveautés 2026
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-gradient-to-br from-white via-white to-neutral-500 bg-clip-text text-transparent">
            Objets rares &<br /> uniques
          </h1>
          <p className="text-muted-foreground max-w-[600px] text-lg">
            Découvrez la marketplace de référence pour les collectionneurs exigeants.
            Authenticité garantie par nos experts.
          </p>
        </div>
      </BlurFade>

      <div id="catalogue" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, idx) => (
          <BlurFade key={item.id} delay={BLUR_FADE_DELAY * 2 + idx * 0.05} inView>
            <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10">
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-secondary/50">
                    <Package className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <Badge className="bg-background/80 backdrop-blur text-foreground border-0 font-bold shadow-sm">
                    {item.price.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                  </Badge>
                </div>
              </div>

              <CardHeader className="p-4 pb-2">
                <h3 className="font-bold text-lg leading-tight tracking-tight">{item.title}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Vendeur:</span>
                  <span className="font-medium text-foreground">{item.owner.name || "Expert"}</span>
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-2">
                <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <Button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground">
                  Voir l&apos;offre
                </Button>
              </CardFooter>

              {/* Shine effect on hover */}

            </Card>
          </BlurFade>
        ))}

        {items.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold">Aucun objet trouvé</h3>
            <p className="text-muted-foreground mt-2">Le catalogue est actuellement vide.</p>
          </div>
        )}
      </div>
    </div>
  );
}
