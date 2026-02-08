"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Lock, CheckCircle2, Loader2, CreditCard } from "lucide-react";
import { buyItem } from "@/app/actions/transaction";

interface CheckoutPageProps {
    item: {
        id: string;
        title: string;
        price: number;
        images: { url: string }[];
    };
}

export function CheckoutPage({ item }: CheckoutPageProps) {
    const router = useRouter();
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [cardNumber, setCardNumber] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [cvv, setCvv] = useState("");
    const [cardName, setCardName] = useState("");

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Process the actual purchase
        const result = await buyItem(item.id);

        if (result.success) {
            setSuccess(true);
            // Redirect to home after 2 seconds
            setTimeout(() => {
                router.push("/");
            }, 2000);
        } else {
            setProcessing(false);
            alert("Erreur lors du paiement. Veuillez réessayer.");
        }
    };

    if (success) {
        return (
            <div className="container mx-auto py-16 px-4 max-w-2xl">
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-6 text-center space-y-4">
                        <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
                        <h2 className="text-2xl font-bold text-green-900">Paiement réussi !</h2>
                        <p className="text-green-700">
                            Votre achat a été confirmé. Vous allez être redirigé vers la page d&apos;accueil...
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            <h1 className="text-3xl font-bold mb-8">Paiement sécurisé</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Payment Form */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="h-5 w-5 text-green-600" />
                                Informations de paiement
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePayment} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="cardNumber">Numéro de carte</Label>
                                    <div className="relative">
                                        <Input
                                            id="cardNumber"
                                            placeholder="1234 5678 9012 3456"
                                            value={cardNumber}
                                            onChange={(e) => setCardNumber(e.target.value)}
                                            maxLength={19}
                                            required
                                            className="pl-10"
                                        />
                                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="cardName">Nom sur la carte</Label>
                                    <Input
                                        id="cardName"
                                        placeholder="Jean Dupont"
                                        value={cardName}
                                        onChange={(e) => setCardName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="expiry">Date d&apos;expiration</Label>
                                        <Input
                                            id="expiry"
                                            placeholder="MM/AA"
                                            value={expiryDate}
                                            onChange={(e) => setExpiryDate(e.target.value)}
                                            maxLength={5}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cvv">CVV</Label>
                                        <Input
                                            id="cvv"
                                            placeholder="123"
                                            value={cvv}
                                            onChange={(e) => setCvv(e.target.value)}
                                            maxLength={3}
                                            type="password"
                                            required
                                        />
                                    </div>
                                </div>

                                <Separator />

                                <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-900">
                                    <p className="flex items-center gap-2">
                                        <Lock className="h-4 w-4" />
                                        <span className="font-semibold">Paiement 100% sécurisé</span>
                                    </p>
                                    <p className="text-xs mt-1 text-blue-700">
                                        Vos informations sont cryptées et protégées. Ceci est une simulation de paiement pour démonstration.
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-green-600 hover:bg-green-700 h-12 text-base font-bold"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Traitement en cours...
                                        </>
                                    ) : (
                                        `Payer ${item.price.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}`
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-4">
                        <CardHeader>
                            <CardTitle>Récapitulatif</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {item.images[0] && (
                                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={item.images[0].url}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            <div>
                                <h3 className="font-semibold line-clamp-2">{item.title}</h3>
                            </div>

                            <Separator />

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Prix de l&apos;objet</span>
                                    <span className="font-medium">
                                        {item.price.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Frais de livraison</span>
                                    <span className="font-medium text-green-600">Offerts</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span>
                                        {item.price.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-muted p-3 rounded-md text-xs text-muted-foreground mt-4">
                                <p>
                                    Collector prend une commission de 5% sur la transaction (à la charge du vendeur).
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
