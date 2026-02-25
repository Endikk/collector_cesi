
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TransactionCard } from "../../_components/TransactionCard";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export async function PurchasesPageContent() {
    const session = await getServerSession(authOptions) as Session | null;

    if (!session || !session.user) {
        redirect("/api/auth/signin");
    }

    const purchases = await prisma.transaction.findMany({
        where: {
            buyerId: session.user.id,
        },
        include: {
            item: {
                include: { images: true },
            },
            seller: {
                select: { id: true, name: true, email: true },
            },
            review: {
                select: { id: true, rating: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="container mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Mes Achats</h1>
                <p className="text-muted-foreground">Retrouvez l&apos;historique de vos commandes</p>
            </div>

            {purchases.length === 0 ? (
                <div className="text-center py-16 bg-muted/30 rounded-lg border border-dashed">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                        <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Aucun achat effectué</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                        Explorez le catalogue pour trouver des objets rares et uniques.
                    </p>
                    <Button asChild variant="outline">
                        <Link href="/">Explorer le catalogue</Link>
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {purchases.map((purchase) => (
                        <TransactionCard
                            key={purchase.id}
                            transaction={{
                                ...purchase,
                                otherParty: purchase.seller
                            }}
                            type="purchase"
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
