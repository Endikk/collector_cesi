
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TransactionCard } from "../../_components/TransactionCard";
import { Package } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ItemDeleteButton from "@/components/common/ItemDeleteButton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export async function SalesPageContent() {
    const session = await getServerSession(authOptions) as Session | null;

    if (!session || !session.user) {
        redirect("/api/auth/signin");
    }

    // Unsold Items (Active Listings)
    const activeItems = await prisma.item.findMany({
        where: {
            ownerId: session.user.id,
            status: "AVAILABLE",
        },
        include: { images: true },
        orderBy: { createdAt: "desc" },
    });

    // Completed Sales
    const sales = await prisma.transaction.findMany({
        where: {
            sellerId: session.user.id,
        },
        include: {
            item: {
                include: { images: true },
            },
            buyer: {
                select: { id: true, name: true, email: true },
            },
            review: {
                select: { id: true, rating: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    const totalSales = sales.reduce((acc, sale) => acc + sale.amount, 0);

    return (
        <div className="container mx-auto py-8 space-y-12">

            {/* Header */}
            <div className="flex justify-between items-center bg-card p-6 rounded-xl border shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Gérer mes ventes</h1>
                    <p className="text-muted-foreground mt-1">Suivez vos objets en vente et votre historique</p>
                </div>
                <div className="text-right bg-secondary/20 p-4 rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">Total encaissé</p>
                    <p className="text-3xl font-bold text-emerald-600">
                        {totalSales.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                    </p>
                </div>
            </div>

            {/* Active Listings Section */}
            <section>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Package className="h-6 w-6 text-blue-500" />
                        En vente ({activeItems.length})
                    </h2>
                    <Button asChild className="bg-blue-600 hover:bg-blue-700">
                        <Link href="/sell">Vendre un nouvel objet</Link>
                    </Button>
                </div>

                {activeItems.length === 0 ? (
                    <div className="text-center py-12 bg-muted/30 rounded-xl border-2 border-dashed">
                        <p className="text-muted-foreground mb-4">Vous n&apos;avez aucun objet en vente actuellement.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {activeItems.map((item) => (
                            <Card key={item.id} className="overflow-hidden hover:shadow-md transition-all">
                                <CardContent className="p-0 flex h-32 md:h-40">
                                    {/* Image */}
                                    <div className="w-32 md:w-48 bg-secondary/10 flex-shrink-0 relative">
                                        {item.images[0] ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={item.images[0].url}
                                                alt={item.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="h-8 w-8 text-muted-foreground/40" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 p-4 md:p-6 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <Link href={`/items/${item.id}`} className="font-bold text-lg md:text-xl hover:text-blue-600 hover:underline line-clamp-1">
                                                    {item.title}
                                                </Link>
                                                <div className="flex gap-2 mt-1">
                                                    <Badge variant="outline" className="text-xs">
                                                        {item.price.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                                                    </Badge>
                                                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0 text-xs">
                                                        En ligne
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <ItemDeleteButton itemId={item.id} />
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-end mt-2">
                                            <p className="text-sm text-muted-foreground line-clamp-1 max-w-[70%]">
                                                {item.description}
                                            </p>
                                            <Button variant="link" size="sm" className="h-auto p-0 text-blue-600" asChild>
                                                <Link href={`/items/${item.id}`}>Voir l&apos;annonce</Link>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </section>

            {/* Sales History Section */}
            <section>
                <h2 className="text-2xl font-bold flex items-center gap-2 mb-6 text-muted-foreground">
                    historique des ventes ({sales.length})
                </h2>

                {sales.length === 0 ? (
                    <p className="text-muted-foreground italic">Aucune vente passée.</p>
                ) : (
                    <div className="space-y-4">
                        {sales.map((sale) => (
                            <TransactionCard
                                key={sale.id}
                                transaction={{
                                    ...sale,
                                    otherParty: sale.buyer
                                }}
                                type="sale"
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
