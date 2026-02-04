"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ContactSellerButton } from "@/components/common/ContactSellerButton";

interface ItemDetailsProps {
    item: {
        id: string;
        title: string;
        price: number;
        status: string;
        description: string;
        ownerId: string;
        owner: {
            name: string | null;
        };
    };
    isOwner: boolean;
    currentUserId?: string;
}

export function ItemDetails({ item, isOwner, currentUserId }: ItemDetailsProps) {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold mb-2">{item.title}</h1>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                        {item.price.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                    </Badge>
                    <Badge variant="outline">{item.status}</Badge>
                </div>
            </div>

            <Card>
                <CardContent className="p-6 space-y-4">
                    <div>
                        <h3 className="font-semibold mb-1">Description</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            {item.description}
                        </p>
                    </div>

                    <hr />

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {/* Owner Avatar placeholder */}
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold">
                                {item.owner.name?.charAt(0) || "U"}
                            </div>
                            <div>
                                <p className="font-medium text-sm">Vendu par</p>
                                <p className="font-bold">{item.owner.name || "Utilisateur"}</p>
                            </div>
                        </div>

                        {!isOwner && currentUserId && (
                            <ContactSellerButton sellerId={item.ownerId} />
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="flex gap-4">
                <Button size="lg" className="flex-1" disabled={item.status !== "AVAILABLE"}>
                    {item.status === "AVAILABLE" ? "Acheter maintenant" : "Indisponible"}
                </Button>
            </div>
        </div>
    );
}
