"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Application error:", error);
    }, [error]);

    return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <h2 className="text-2xl font-bold">Une erreur est survenue</h2>
            <p className="text-muted-foreground max-w-md">
                Nous sommes désolés, quelque chose s&apos;est mal passé. Veuillez réessayer.
            </p>
            <Button onClick={reset} variant="outline">
                Réessayer
            </Button>
        </div>
    );
}
