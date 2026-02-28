"use client";

import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

interface HeroCarouselProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items?: any[];
}

export function HeroCarousel({ items = [] }: HeroCarouselProps) {
    const t = useTranslations();

    if (!items || items.length === 0) {
        return null;
    }

    const displayItems = items.slice(0, 8).map(item => ({
        id: item.id,
        title: item.title,
        user: item.owner?.name || t('heroCarousel.defaultSeller'),
        image: item.images && item.images.length > 0 ? item.images[0].url : "https://images.unsplash.com/photo-1639322537228-ad714291f22c?q=80&w=2670&auto=format&fit=crop",
        time: t('heroCarousel.justNow'),
        avatarSeed: item.owner?.name || "user",
        live: false
    }));

    return (
        <section className="mb-12">
            <div className="flex items-end justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold mb-1">{t('heroCarousel.title')}</h2>
                    <p className="text-muted-foreground text-sm">{t('heroCarousel.subtitle')}</p>
                </div>
                <Link href="#" className="text-sm font-medium hover:underline text-foreground mb-1">
                    {t('heroCarousel.viewAll')}
                </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                {displayItems.map((slide) => (
                    <Link key={slide.id} href={`/items/${slide.id}`} className="min-w-[280px] md:min-w-[300px] group cursor-pointer block">
                        <div className="relative aspect-[4/5] rounded-xl overflow-hidden mb-3 bg-muted">
                            {slide.image && (
                                slide.image.startsWith("data:") ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={slide.image}
                                        alt={slide.title}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                ) : (
                                    <Image
                                        src={slide.image}
                                        alt={slide.title}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                        sizes="(max-width: 768px) 280px, 300px"
                                    />
                                )
                            )}
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                            {/* User Info Overlay */}
                            <div className="absolute bottom-4 left-4 flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-white border-2 border-white overflow-hidden flex items-center justify-center bg-gray-100">
                                    <Image
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${slide.avatarSeed}`}
                                        alt={slide.user}
                                        width={32}
                                        height={32}
                                    />
                                </div>
                                <span className="text-white font-bold text-sm drop-shadow-md">{slide.user}</span>
                            </div>

                            {/* Time Badge */}
                            <Badge variant="secondary" className="absolute top-4 left-4 bg-white text-black font-semibold shadow-sm hover:bg-white flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs">
                                <span className="text-blue-600 font-bold tracking-wider mr-1">NEW</span>
                                {slide.time}
                            </Badge>
                        </div>
                        <h3 className="font-medium text-sm leading-tight group-hover:underline line-clamp-2">
                            {slide.title}
                        </h3>
                    </Link>
                ))}
            </div>
        </section>
    );
}
