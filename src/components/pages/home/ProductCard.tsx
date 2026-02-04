"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import BlurFade from "@/components/ui/blur-fade";
import ItemDeleteButton from "@/components/common/ItemDeleteButton";
import { Package } from "lucide-react";

interface ProductCardProps {
    item: {
        id: string;
        title: string;
        price: number;
        description: string;
        ownerId: string;
        images: { url: string }[];
        owner: { name: string | null };
    };
    delay: number;
    currentUserId?: string;
}

export function ProductCard({ item, delay, currentUserId }: ProductCardProps) {
    return (
        <BlurFade delay={delay} inView>
            <Card className="group relative overflow-hidden border-0 bg-white shadow-md transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/5">
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                    {item.images.length > 0 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={item.images[0].url}
                            alt={item.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-secondary/50">
                            <Package className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                    )}

                    {/* Delete Button for Owner */}
                    {currentUserId && (currentUserId === item.ownerId) && (
                        <div className="absolute top-3 left-3 z-[20]">
                            <ItemDeleteButton itemId={item.id} />
                        </div>
                    )}

                    <div className="absolute top-3 right-3">
                        <Badge className="bg-white/90 backdrop-blur text-foreground font-bold shadow-sm">
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
                    <Button asChild className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground">
                        <Link href={`/items/${item.id}`}>Voir l&apos;offre</Link>
                    </Button>
                </CardFooter>
            </Card>
        </BlurFade>
    );
}
