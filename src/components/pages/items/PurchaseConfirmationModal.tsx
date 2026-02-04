"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface PurchaseConfirmationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    submitting: boolean;
    itemPrice: number;
    itemName: string;
}

export function PurchaseConfirmationModal({
    open,
    onOpenChange,
    onConfirm,
    submitting,
    itemPrice,
    itemName,
}: PurchaseConfirmationModalProps) {
    const total = itemPrice; // Buyer pays full price, commission is deducted from seller in backend logic usually, but here request is 5% commission on transaction. Usually buyer pays Price.

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirmer l&apos;achat</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-4">
                        <p>Vous êtes sur le point d&apos;acheter : <span className="font-semibold text-foreground">{itemName}</span></p>

                        <div className="bg-muted/50 p-4 rounded-md space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Prix de l&apos;objet</span>
                                <span>{itemPrice.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Frais de livraison</span>
                                <span>Offerts</span>
                            </div>
                            <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg text-foreground">
                                <span>Total à payer</span>
                                <span>{total.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</span>
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground">
                            En confirmant, vous acceptez les conditions générales de vente.
                            Collector prend une commission de 5% sur la transaction (à la charge du vendeur).
                        </p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={submitting}>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={(e) => { e.preventDefault(); onConfirm(); }} disabled={submitting} className="bg-green-600 hover:bg-green-700">
                        {submitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Traitement...
                            </>
                        ) : (
                            "Confirmer et Payer"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
