"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ItemError({ reset }: { error: Error; reset: () => void }) {
    return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <h2 className="text-2xl font-bold">Article introuvable</h2>
            <p className="text-muted-foreground">
                Cet article n&apos;existe pas ou n&apos;est plus disponible.
            </p>
            <div className="flex gap-3">
                <Button onClick={reset} variant="outline">Réessayer</Button>
                <Button asChild><Link href="/">Retour à l&apos;accueil</Link></Button>
            </div>
        </div>
    );
}
