"use client";

import { Badge } from "@/components/ui/badge";
import BlurFade from "@/components/ui/blur-fade";

export function HomePageHero() {
    const BLUR_FADE_DELAY = 0.04;

    return (
        <BlurFade delay={BLUR_FADE_DELAY}>
            <div className="flex flex-col items-center text-center mb-16 space-y-4">
                <Badge variant="outline" className="px-4 py-1 border-yellow-500/50 text-yellow-500 bg-yellow-500/10">
                    Nouveautés 2026
                </Badge>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-gradient-to-br from-white via-white to-neutral-500 bg-clip-text text-transparent">
                    Objets rares &<br /> uniques
                </h1>
                <p className="text-muted-foreground max-w-[600px] text-lg">
                    Découvrez la marketplace de référence pour les collectionneurs exigeants.
                    Authenticité garantie par nos experts.
                </p>
            </div>
        </BlurFade>
    );
}
