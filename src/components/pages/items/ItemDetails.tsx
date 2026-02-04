"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ContactSellerButton } from "@/components/common/ContactSellerButton";
import { buyItem } from "@/app/actions/transaction";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { PurchaseConfirmationModal } from "./PurchaseConfirmationModal";

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
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleBuyClick = () => {
        if (!currentUserId) {
            router.push("/api/auth/signin?callbackUrl=" + encodeURIComponent(window.location.href));
            return;
        }
        setShowConfirm(true);
    };

    const handleConfirmBuy = async () => {
        startTransition(async () => {
            const result = await buyItem(item.id);
            if (result.success) {
                setMessage({ type: 'success', text: result.message });
                setShowConfirm(false);
                router.refresh();
            } else {
                setMessage({ type: 'error', text: result.message });
                setShowConfirm(false);
            }
        });
    };

    return (
        <div className="space-y-6">
            <PurchaseConfirmationModal
                open={showConfirm}
                onOpenChange={setShowConfirm}
                onConfirm={handleConfirmBuy}
                submitting={isPending}
                itemName={item.title}
                itemPrice={item.price}
            />

            <div>
                <h1 className="text-4xl font-bold mb-2">{item.title}</h1>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                        {item.price.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                    </Badge>
                    <Badge variant={item.status === "SOLD" ? "destructive" : "outline"}>
                        {item.status === "SOLD" ? "Vendu" : item.status}
                    </Badge>
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

            {message && (
                <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            <div className="flex gap-4">
                <Button
                    size="lg"
                    className="flex-1"
                    disabled={item.status !== "AVAILABLE" || isOwner || isPending}
                    onClick={handleBuyClick}
                >
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Traitement...
                        </>
                    ) : item.status === "AVAILABLE" ? (
                        isOwner ? "Votre objet" : "Acheter maintenant"
                    ) : (
                        "Non disponible"
                    )}
                </Button>
            </div>
        </div>
    );
}
