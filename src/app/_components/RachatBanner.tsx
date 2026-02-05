"use client";

import Autoplay from "embla-carousel-autoplay";
import { MoveRight, Pause, Play, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

export function RachatBanner({ shouldShow = true }: { shouldShow?: boolean }) {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

    const plugin = useRef(
        Autoplay({ delay: 5000, stopOnInteraction: false })
    );

    useEffect(() => {
        if (!api) return;

        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap() + 1);

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1);
        });
    }, [api]);

    // Don't render if shouldShow is false
    if (!shouldShow) {
        return null;
    }

    const togglePlay = () => {
        if (isPlaying) {
            plugin.current.stop();
        } else {
            plugin.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const slides = [
        {
            id: 1,
            title: "Vendez vos objets",
            subtitle: "Collector Seconde Vie",
            description: "Donnez une seconde vie à vos souvenirs. Commission réduite de 5% seulement.",
            buttonText: "Commencer à vendre",
            link: "/sell",
            images: [
                "/images/banner/slide1-1.jpg",
                "/images/banner/slide1-2.jpg",
                "/images/banner/slide1-3.jpg"
            ],
            colorFrom: "from-blue-600",
            colorTo: "to-purple-700"
        },
        {
            id: 2,
            title: "Achetez en confiance",
            subtitle: "Authenticité Garantie",
            description: "Des milliers d'objets vérifiés par la communauté. Achetez vos pépites sans stress.",
            buttonText: "Explorer le catalogue",
            link: "/#catalogue",
            images: [
                "/images/banner/slide2-1.jpg",
                "/images/banner/slide2-2.jpg",
                "/images/banner/slide2-3.jpg"
            ],
            colorFrom: "from-emerald-600",
            colorTo: "to-teal-800"
        },
        {
            id: 3,
            title: "Rejoignez nous !",
            subtitle: "Communauté Collector",
            description: "Discutez, échangez et partagez votre passion avec des experts et amateurs éclairés.",
            buttonText: "S'inscrire gratuitement",
            link: "/auth/register",
            images: [
                "/images/banner/slide3-1.jpg",
                "/images/banner/slide3-2.jpg",
                "/images/banner/slide3-3.jpg"
            ],
            colorFrom: "from-orange-500",
            colorTo: "to-red-700"
        }
    ];

    return (
        <section className="mb-8 rounded-2xl overflow-hidden relative shadow-lg">
            <Carousel
                setApi={setApi}
                plugins={[plugin.current]}
                className="w-full relative group"
                opts={{
                    loop: true,
                }}
            >
                <CarouselContent className="-ml-0">
                    {slides.map((slide) => (
                        <CarouselItem key={slide.id} className="pl-0">
                            <div className={cn("relative w-full h-[400px] sm:h-[450px] overflow-hidden bg-gradient-to-r", slide.colorFrom, slide.colorTo)}>
                                <div className="absolute inset-0 bg-black/10" />

                                <div className="absolute inset-0 container flex flex-col sm:flex-row items-center justify-between p-8 sm:p-12 z-20">
                                    {/* Content Left */}
                                    <div className="flex-1 text-white max-w-xl space-y-6 pt-8 sm:pt-0">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                                {slide.subtitle}
                                            </span>
                                        </div>
                                        <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
                                            {slide.title}
                                        </h2>
                                        <p className="text-lg text-white/90 font-medium max-w-md leading-relaxed">
                                            {slide.description}
                                        </p>
                                        <Button asChild size="lg" className="rounded-full bg-white text-black hover:bg-white/90 font-bold px-8 h-12 text-base shadow-xl">
                                            <Link href={slide.link}>
                                                {slide.buttonText}
                                                <MoveRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>

                                    {/* Images Right - Floating Effect */}
                                    <div className="hidden lg:flex relative w-[500px] h-full items-center justify-center perspective-1000">
                                        {/* Image 1 - Left Back */}
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-48 h-64 -rotate-12 hover:-rotate-6 transition-transform duration-500 z-10 rounded-xl overflow-hidden shadow-2xl border-4 border-white/10">
                                            <Image src={slide.images[0]} alt="Item" fill className="object-cover" />
                                        </div>
                                        {/* Image 2 - Center Front */}
                                        <div className="absolute left-24 top-1/2 -translate-y-1/2 w-56 h-72 rotate-0 hover:scale-105 transition-transform duration-500 z-20 rounded-xl overflow-hidden shadow-2xl border-4 border-white/20">
                                            <Image src={slide.images[1]} alt="Item" fill className="object-cover" />
                                        </div>
                                        {/* Image 3 - Right Back */}
                                        <div className="absolute right-12 top-1/2 -translate-y-1/2 w-48 h-64 rotate-12 hover:rotate-6 transition-transform duration-500 z-10 rounded-xl overflow-hidden shadow-2xl border-4 border-white/10">
                                            <Image src={slide.images[2]} alt="Item" fill className="object-cover" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>

                {/* Controls - Bottom Right */}
                <div className="absolute bottom-6 right-6 z-30 flex items-center gap-2">
                    <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/40 border-none text-white backdrop-blur-sm"
                        onClick={() => api?.scrollPrev()}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/40 border-none text-white backdrop-blur-sm"
                        onClick={togglePlay}
                    >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/40 border-none text-white backdrop-blur-sm"
                        onClick={() => api?.scrollNext()}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                {/* Dots - Bottom Center */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                    {Array.from({ length: count }).map((_, index) => (
                        <button
                            key={index}
                            className={cn(
                                "w-2.5 h-2.5 rounded-full transition-all duration-300",
                                index + 1 === current ? "bg-white scale-125" : "bg-white/40 hover:bg-white/60"
                            )}
                            onClick={() => api?.scrollTo(index)}
                        />
                    ))}
                </div>
            </Carousel>
        </section>
    );
}
