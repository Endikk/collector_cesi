import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function CheckoutSuccessPage() {

    return (
        <div className="container mx-auto py-16 px-4 max-w-2xl">
            <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6 text-center space-y-6">
                    <CheckCircle2 className="h-20 w-20 text-green-600 mx-auto" />
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-green-900">
                            Paiement réussi !
                        </h1>
                        <p className="text-green-700 text-lg">
                            Votre achat a été confirmé avec succès.
                        </p>
                    </div>

                    <div className="bg-white rounded-lg p-6 text-left space-y-4">
                        <h2 className="font-semibold text-lg">Prochaines étapes :</h2>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 mt-1">✓</span>
                                <span>Vous allez recevoir un email de confirmation</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 mt-1">✓</span>
                                <span>Le vendeur a été notifié de votre achat</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 mt-1">✓</span>
                                <span>Vous pouvez contacter le vendeur via la messagerie</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 mt-1">✓</span>
                                <span>Une fois l&apos;article reçu, vous pourrez laisser un avis</span>
                            </li>
                        </ul>
                    </div>

                    <div className="flex gap-4 justify-center pt-4">
                        <Button asChild>
                            <Link href="/profile/purchases">
                                Voir mes achats
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/">
                                Retour à l&apos;accueil
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
