"use client";

import { Package } from "lucide-react";

interface ItemGalleryProps {
    images: { id: string; url: string }[];
    title: string;
}

export function ItemGallery({ images, title }: ItemGalleryProps) {
    const mainImage = images[0]?.url;

    return (
        <div className="space-y-4">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-secondary/20 border">
                {mainImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={mainImage}
                        alt={title}
                        className="h-full w-full object-cover"
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
                    {images.map((img) => (
                        <div key={img.id} className="aspect-square rounded-md overflow-hidden bg-secondary/20 border cursor-pointer">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img.url} alt="" className="h-full w-full object-cover" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
