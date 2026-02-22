"use client";

import Image from "next/image";
import { Package } from "lucide-react";

interface ItemGalleryProps {
    images: { id: string; url: string }[];
    title: string;
}

export function ItemGallery({ images, title }: ItemGalleryProps) {
    const mainImage = images[0]?.url;

    return (
        <div className="space-y-4">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-secondary/20 border">
                {mainImage ? (
                    <Image
                        src={mainImage}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-20 w-20 text-muted-foreground/50" />
                    </div>
                )}
            </div>
            {/* Thumbnail Grid (if multiple images) */}
            {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                    {images.map((img, index) => (
                        <div key={img.id} className="relative aspect-square rounded-md overflow-hidden bg-secondary/20 border cursor-pointer">
                            <Image
                                src={img.url}
                                alt={`${title} - Image ${index + 1}`}
                                fill
                                sizes="25vw"
                                className="object-cover"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
