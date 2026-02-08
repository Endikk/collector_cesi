"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart, Zap, CreditCard, ChevronRight } from "lucide-react";
import { PurchaseConfirmationModal } from "./PurchaseConfirmationModal";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

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
            id: string;
        };
    };
    isOwner: boolean;
    currentUserId?: string;
}

export function ItemDetails({ item, isOwner, currentUserId }: ItemDetailsProps) {
    const router = useRouter();
    const [showConfirm, setShowConfirm] = useState(false);

    const handleAction = (action: () => void) => {
        if (!currentUserId) {
            router.push(`/auth/login?callbackUrl=${encodeURIComponent(window.location.href)}`);
        } else {
            action();
        }
    };

    const handleBuyClick = () => {
        handleAction(() => setShowConfirm(true));
    };

    const handleConfirmBuy = () => {
        // Redirect to checkout page instead of direct purchase
        router.push(`/checkout/${item.id}`);
        setShowConfirm(false);
    };

    return (
        <div className="space-y-6">
            <PurchaseConfirmationModal
                open={showConfirm}
                onOpenChange={setShowConfirm}
                onConfirm={handleConfirmBuy}
                submitting={false}
                itemName={item.title}
                itemPrice={item.price}
            />

            <div>
                <h1 className="text-2xl font-bold mb-2 text-foreground">{item.title}</h1>

                {/* Seller Info */}
                <div className="flex items-center gap-2 text-sm text-foreground mb-4">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs text-gray-600">
                        {item.owner.name?.charAt(0) || "U"}
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                            <span className="font-bold underline cursor-pointer hover:text-blue-600">
                                {item.owner.name || "Vendeur"}
                            </span>
                            <span className="text-muted-foreground">(3789)</span>
                            <span className="text-muted-foreground">·</span>
                            <span className="text-muted-foreground">Pro</span>
                            <span className="text-muted-foreground">ℹ️</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                            <span className="hover:underline cursor-pointer">97,7% d&apos;évaluations positives</span>
                            <span className="text-muted-foreground">·</span>
                            <Link href={`/shop/${item.ownerId}`} className="hover:underline cursor-pointer">Autres objets du vendeur</Link>
                            <span className="text-muted-foreground">·</span>
                            <Link href={`/chat?userId=${item.ownerId}`} className="hover:underline cursor-pointer text-[#3665f3]">Contacter le vendeur</Link>
                        </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                </div>

                <Separator className="my-4" />

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-bold block">
                        {item.price.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                    </span>
                </div>

                {/* Condition */}
                <div className="flex gap-8 text-sm mb-6">
                    <span className="text-muted-foreground w-20">État :</span>
                    <div className="flex flex-col">
                        <span className="font-bold">--</span>
                        <span className="italic text-muted-foreground">&quot;Etat correct Bonne stabilité Traces d&apos;usure pour le vernis&quot;</span>
                    </div>
                </div>

                {/* Action Buttons */}
                {!isOwner ? (
                    <div className="space-y-3">
                        <Button
                            size="lg"
                            className="w-full bg-[#3665f3] hover:bg-[#2b52c9] text-white font-bold rounded-full h-12 text-base"
                            onClick={handleBuyClick}
                        >
                            {item.status === "AVAILABLE" ? "Achat immédiat" : "Vendu"}
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="w-full border-[#3665f3] text-[#3665f3] hover:bg-blue-50 font-bold rounded-full h-12 text-base"
                            onClick={() => handleAction(() => console.log("Add to cart"))}
                        >
                            Ajouter au panier
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="w-full border-[#3665f3] text-[#3665f3] hover:bg-blue-50 font-bold rounded-full h-12 text-base flex items-center gap-2"
                            onClick={() => handleAction(() => console.log("Watch item"))}
                        >
                            <Heart className="h-4 w-4" />
                            Suivre cet objet
                        </Button>
                    </div>
                ) : (
                    <div className="p-4 bg-muted/50 rounded-lg text-center text-muted-foreground">
                        Vous êtes le vendeur de cet objet.
                        <Link href="/profile/sales" className="block text-[#3665f3] hover:underline mt-2">
                            Gérer mes ventes
                        </Link>
                    </div>
                )}

                {/* Social Proof */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg flex items-center gap-3">
                    <Zap className="h-5 w-5 text-gray-700" />
                    <span className="text-sm">
                        <span className="font-bold">D&apos;autres personnes sont intéressées.</span> 11 personnes suivent cet objet.
                    </span>
                </div>

                <Separator className="my-6" />

                {/* Shipping & Payment Info */}
                <div className="space-y-4 text-sm">
                    <div className="flex gap-4">
                        <span className="text-muted-foreground w-24 shrink-0">Livraison :</span>
                        <div>
                            <p>Livraison possible vers : États-Unis. Consultez la description de l&apos;objet ou <Link href={`/chat?userId=${item.ownerId}`} className="underline cursor-pointer text-[#3665f3]">contactez le vendeur</Link> pour en savoir plus sur les options de livraison.</p>
                            <span className="underline cursor-pointer text-[#3665f3] block mt-1">Afficher les détails</span>
                            <p className="text-muted-foreground text-xs mt-1">Lieu où se trouve l&apos;objet : Paris, France</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <span className="text-muted-foreground w-24 shrink-0">Délai :</span>
                        <span>Varie</span>
                    </div>

                    <div className="flex gap-4">
                        <span className="text-muted-foreground w-24 shrink-0">Retours :</span>
                        <div>
                            <span>Retours refusés.</span> <span className="underline cursor-pointer text-[#3665f3]">Afficher les détails</span>
                        </div>
                    </div>

                    <div className="flex gap-4 items-center">
                        <span className="text-muted-foreground w-24 shrink-0">Paiements :</span>
                        <div className="flex gap-2">
                            <CreditCard className="h-8 w-8 text-gray-400" />
                            {/* Add payment icons here if needed */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
