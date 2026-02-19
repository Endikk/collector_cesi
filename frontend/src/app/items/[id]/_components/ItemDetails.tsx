"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart, CreditCard, ChevronRight, Trash2, Star, ShieldCheck } from "lucide-react";
import { PurchaseConfirmationModal } from "./PurchaseConfirmationModal";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { deleteItemAsAdmin } from "@/app/actions/items";

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
    isAdmin?: boolean;
    currentUserId?: string;
    sellerStats?: {
        salesCount: number;
        itemsCount: number;
        reviewCount: number;
        avgRating: number | null;
    };
    categoryName?: string;
}

export function ItemDetails({ item, isOwner, isAdmin, currentUserId, sellerStats, categoryName }: ItemDetailsProps) {
    const router = useRouter();
    const [showConfirm, setShowConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const isSold = item.status !== "AVAILABLE";

    const handleAction = (action: () => void) => {
        if (!currentUserId) {
            router.push(`/auth/login?callbackUrl=${encodeURIComponent(window.location.href)}`);
        } else {
            action();
        }
    };

    const handleBuyClick = () => {
        if (isSold) return;
        handleAction(() => setShowConfirm(true));
    };

    const handleConfirmBuy = () => {
        router.push(`/checkout/${item.id}`);
        setShowConfirm(false);
    };

    const handleDeleteItem = async () => {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer l'annonce "${item.title}" ?`)) {
            return;
        }

        setIsDeleting(true);
        try {
            const result = await deleteItemAsAdmin(item.id);
            if (result.success) {
                alert("Annonce supprimée avec succès");
                router.push("/");
                router.refresh();
            } else {
                alert(result.message || "Erreur lors de la suppression");
            }
        } catch (error) {
            console.error("Error deleting item:", error);
            alert("Erreur lors de la suppression");
        } finally {
            setIsDeleting(false);
        }
    };

    const ratingPercent = sellerStats?.avgRating
        ? Math.round((sellerStats.avgRating / 5) * 100)
        : null;

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
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl font-bold text-foreground">{item.title}</h1>
                    {isAdmin && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDeleteItem}
                            disabled={isDeleting}
                            className="ml-2"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {isDeleting ? "Suppression..." : "Supprimer"}
                        </Button>
                    )}
                </div>

                {/* Category Badge */}
                {categoryName && (
                    <Badge variant="secondary" className="mb-3">{categoryName}</Badge>
                )}

                {/* Status Badge */}
                {isSold && (
                    <Badge variant="destructive" className="mb-3 ml-2">Vendu</Badge>
                )}

                {/* Seller Info */}
                <div className="flex items-center gap-2 text-sm text-foreground mb-4">
                    <Link href={`/shop/${item.ownerId}`} className="h-8 w-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs text-muted-foreground hover:ring-2 ring-primary transition-all">
                        {item.owner.name?.charAt(0)?.toUpperCase() || "U"}
                    </Link>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                            <Link href={`/shop/${item.ownerId}`} className="font-bold underline hover:text-primary">
                                {item.owner.name || "Vendeur"}
                            </Link>
                            {sellerStats && sellerStats.reviewCount > 0 && (
                                <>
                                    <span className="text-muted-foreground">({sellerStats.reviewCount} avis)</span>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-1 text-xs flex-wrap">
                            {ratingPercent !== null && (
                                <span className="flex items-center gap-0.5">
                                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                    {ratingPercent}% positif
                                </span>
                            )}
                            {sellerStats && sellerStats.salesCount > 0 && (
                                <>
                                    <span className="text-muted-foreground">·</span>
                                    <span className="text-muted-foreground">{sellerStats.salesCount} ventes</span>
                                </>
                            )}
                            <span className="text-muted-foreground">·</span>
                            <Link href={`/shop/${item.ownerId}`} className="hover:underline text-primary">
                                Voir la boutique
                            </Link>
                            <span className="text-muted-foreground">·</span>
                            <button
                                onClick={() => handleAction(() => router.push(`/chat?userId=${item.ownerId}`))}
                                className="hover:underline text-primary bg-transparent border-none p-0 cursor-pointer"
                            >
                                Contacter le vendeur
                            </button>
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

                {/* Description */}
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">Description</h3>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{item.description}</p>
                </div>

                {/* Action Buttons */}
                {!isOwner ? (
                    <div className="space-y-3">
                        <Button
                            size="lg"
                            className="w-full bg-[#3665f3] hover:bg-[#2b52c9] text-white font-bold rounded-full h-12 text-base disabled:opacity-50"
                            onClick={handleBuyClick}
                            disabled={isSold}
                        >
                            {isSold ? "Cet objet a été vendu" : "Achat immédiat"}
                        </Button>
                        {!isSold && (
                            <Button
                                size="lg"
                                variant="outline"
                                className="w-full border-[#3665f3] text-[#3665f3] hover:bg-blue-50 font-bold rounded-full h-12 text-base flex items-center gap-2"
                                onClick={() => handleAction(() => router.push(`/chat?userId=${item.ownerId}`))}
                            >
                                <Heart className="h-4 w-4" />
                                Contacter le vendeur
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="p-4 bg-muted/50 rounded-lg text-center text-muted-foreground">
                        Vous êtes le vendeur de cet objet.
                        <Link href="/profile/sales" className="block text-primary hover:underline mt-2">
                            Gérer mes ventes
                        </Link>
                    </div>
                )}

                <Separator className="my-6" />

                {/* Shipping & Payment Info */}
                <div className="space-y-4 text-sm">
                    <div className="flex gap-4">
                        <span className="text-muted-foreground w-24 shrink-0">Livraison :</span>
                        <div>
                            <p>Consultez la description ou{" "}
                                <button
                                    onClick={() => handleAction(() => router.push(`/chat?userId=${item.ownerId}`))}
                                    className="underline text-primary bg-transparent border-none p-0 inline cursor-pointer"
                                >
                                    contactez le vendeur
                                </button>{" "}
                                pour les options de livraison.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-center">
                        <span className="text-muted-foreground w-24 shrink-0">Paiement :</span>
                        <div className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                            <span>Paiement sécurisé via Collector</span>
                        </div>
                    </div>

                    <div className="flex gap-4 items-center">
                        <span className="text-muted-foreground w-24 shrink-0">Garantie :</span>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-emerald-500" />
                            <span>Protection acheteur Collector</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
