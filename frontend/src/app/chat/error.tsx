"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function ChatError({ reset }: { error: Error; reset: () => void }) {
    return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <h2 className="text-2xl font-bold">Erreur de messagerie</h2>
            <p className="text-muted-foreground">
                Impossible de charger la conversation. Veuillez réessayer.
            </p>
            <Button onClick={reset} variant="outline">Réessayer</Button>
        </div>
    );
}
