import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Star } from "lucide-react";
import Link from "next/link";

export async function ShopPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            bio: true,
            image: true,
            createdAt: true,
            items: {
                where: { status: "AVAILABLE", published: true },
                include: { images: true },
                orderBy: { createdAt: "desc" },
            },
            reviewsReceived: {
                include: {
                    author: { select: { name: true } },
                },
                orderBy: { createdAt: "desc" },
                take: 10,
            },
            _count: {
                select: {
                    reviewsReceived: true,
                    sales: true,
                },
            },
        },
    });

    if (!user) {
        notFound();
    }

    // Average rating
    const ratingAgg = await prisma.review.aggregate({
        where: { targetId: id },
        _avg: { rating: true },
    });

    const avgRating = ratingAgg._avg.rating ? ratingAgg._avg.rating.toFixed(1) : null;

    return (
        <div className="container mx-auto py-10 px-4">
            {/* Shop Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-8 sm:p-10 rounded-xl mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold">Boutique de {user.name}</h1>
                        <p className="opacity-90 mt-1">
                            Membre depuis {new Date(user.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                        </p>
                    </div>
                </div>
                {user.bio && <p className="opacity-90 mb-4">{user.bio}</p>}
                <div className="flex gap-3 flex-wrap">
                    {avgRating && (
                        <Badge className="bg-white/20 border-0 text-white">
                            <Star className="h-3 w-3 fill-yellow-300 text-yellow-300 mr-1" />
                            {avgRating}/5
                        </Badge>
                    )}
                    <Badge className="bg-white/20 border-0 text-white">
                        {user._count.reviewsReceived} avis
                    </Badge>
                    <Badge className="bg-white/20 border-0 text-white">
                        {user._count.sales} ventes
                    </Badge>
                    <Badge className="bg-white/20 border-0 text-white">
                        {user.items.length} en vente
                    </Badge>
                </div>
            </div>

            {/* Items Grid */}
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Package className="h-6 w-6 text-primary" />
                Articles en vente ({user.items.length})
            </h2>

            {user.items.length === 0 ? (
                <div className="text-center py-16 bg-muted/30 rounded-lg border-dashed border-2">
                    <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucun article en vente pour le moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {user.items.map((item) => (
                        <Link key={item.id} href={`/items/${item.id}`} className="group">
                            <Card className="overflow-hidden hover:shadow-lg transition-all group-hover:scale-[1.02]">
                                <div className="relative aspect-square bg-muted">
                                    {item.images[0] ? (
                                        <Image
                                            src={item.images[0].url}
                                            alt={item.title}
                                            fill
                                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package className="h-8 w-8 text-muted-foreground/40" />
                                        </div>
                                    )}
                                    <Badge className="absolute top-2 right-2 bg-white/90 text-foreground font-bold shadow-sm">
                                        {item.price.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                                    </Badge>
                                </div>
                                <CardHeader className="p-4">
                                    <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
                                        {item.title}
                                    </CardTitle>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}

            {/* Reviews Section */}
            {user.reviewsReceived.length > 0 && (
                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Star className="h-6 w-6 text-yellow-500" />
                        Avis clients ({user._count.reviewsReceived})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {user.reviewsReceived.map((review) => (
                            <Card key={review.id}>
                                <CardHeader className="p-4 flex flex-row justify-between items-start">
                                    <div>
                                        <p className="font-bold">{review.author?.name || "Utilisateur"}</p>
                                        <div className="flex items-center gap-0.5 mt-1">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-4 w-4 ${
                                                        i < review.rating
                                                            ? "text-yellow-500 fill-yellow-500"
                                                            : "text-muted-foreground/30"
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(review.createdAt).toLocaleDateString("fr-FR")}
                                    </span>
                                </CardHeader>
                                {review.comment && (
                                    <CardContent className="p-4 pt-0">
                                        <p className="text-muted-foreground italic">&quot;{review.comment}&quot;</p>
                                    </CardContent>
                                )}
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Contact Button */}
            <div className="mt-8 text-center">
                <Button asChild size="lg" className="rounded-full">
                    <Link href={`/chat?userId=${user.id}`}>
                        Contacter le vendeur
                    </Link>
                </Button>
            </div>
        </div>
    );
}
