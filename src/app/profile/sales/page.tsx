import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TransactionCard } from "@/components/pages/profile/TransactionCard";
import { Package } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default async function SalesPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/api/auth/signin");
    }

    const sales = await prisma.transaction.findMany({
        where: {
            sellerId: session.user.id,
        },
        include: {
            item: {
                include: { images: true },
            },
            buyer: {
                select: { name: true, email: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    const totalSales = sales.reduce((acc, sale) => acc + sale.amount, 0);

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Mes Ventes</h1>
                    <p className="text-muted-foreground">Suivez vos ventes et vos expéditions</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total des ventes</p>
                    <p className="text-2xl font-bold text-green-600">
                        {totalSales.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                    </p>
                </div>
            </div>

            {sales.length === 0 ? (
                <div className="text-center py-16 bg-muted/30 rounded-lg border border-dashed">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                        <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Aucune vente pour le moment</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                        Mettez en vente vos objets de collection pour commencer à gagner de l&apos;argent.
                    </p>
                    <Button asChild>
                        <Link href="/sell">Vendre un objet</Link>
                    </Button>
                </div>
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
        </div>
    );
}
