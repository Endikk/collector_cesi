import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/utils";
import { Package, User as UserIcon, Calendar } from "lucide-react";
import Link from "next/link";

interface TransactionCardProps {
    transaction: {
        id: string;
        amount: number;
        status: string;
        createdAt: Date;
        item: {
            id: string;
            title: string;
            images: { url: string }[];
        };
        otherParty: {
            name: string | null;
            email: string | null;
        };
    };
    type: "sale" | "purchase";
}

export function TransactionCard({ transaction, type }: TransactionCardProps) {
    const isSale = type === "sale";
    const statusColor = {
        PENDING: "bg-yellow-500",
        COMPLETED: "bg-green-500",
        CANCELLED: "bg-red-500",
    }[transaction.status] || "bg-gray-500";

    const statusLabel = {
        PENDING: "En cours",
        COMPLETED: "Terminée",
        CANCELLED: "Annulée",
    }[transaction.status] || transaction.status;

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="h-20 w-20 rounded-md overflow-hidden bg-secondary/10 flex-shrink-0">
                    {transaction.item.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={transaction.item.images[0].url}
                            alt={transaction.item.title}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                    )}
                </div>

                <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                        <Link href={`/items/${transaction.item.id}`} className="hover:underline">
                            <h3 className="font-bold text-lg">{transaction.item.title}</h3>
                        </Link>
                        <Badge variant="secondary" className={cn("text-white", statusColor)}>
                            {statusLabel}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <UserIcon className="h-3 w-3" />
                            <span>
                                {isSale ? "Acheteur: " : "Vendeur: "}
                                <span className="font-medium text-foreground">
                                    {transaction.otherParty.name || transaction.otherParty.email}
                                </span>
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(transaction.createdAt).toLocaleDateString("fr-FR")}</span>
                        </div>
                    </div>
                </div>

                <div className="text-right font-bold text-xl md:border-l md:pl-6 md:h-12 flex items-center">
                    {isSale ? "+" : "-"}{transaction.amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                </div>
            </CardContent>
        </Card>
    );
}
