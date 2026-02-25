import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
            <Package className="h-12 w-12 text-muted-foreground/50" />
            <h2 className="text-2xl font-bold">Page introuvable</h2>
            <p className="text-muted-foreground max-w-md">
                La page que vous recherchez n&apos;existe pas ou a été déplacée.
            </p>
            <Button asChild variant="outline">
                <Link href="/">Retour à l&apos;accueil</Link>
            </Button>
        </div>
    );
}
