
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ItemGallery } from "./ItemGallery";
import { ItemDetails } from "./ItemDetails";
import { notFound } from "next/navigation";

export async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const item = await prisma.item.findUnique({
        where: { id },
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                    _count: {
                        select: {
                            sales: true,
                            items: true,
                            reviewsReceived: true,
                        },
                    },
                },
            },
            images: true,
            category: {
                select: { name: true },
            },
        },
    });

    if (!item) {
        notFound();
    }

    // Get average rating for seller
    const sellerReviews = await prisma.review.aggregate({
        where: { targetId: item.ownerId },
        _avg: { rating: true },
        _count: { rating: true },
    });

    const session = await getServerSession(authOptions) as Session | null;
    const isOwner = session?.user?.id === item.ownerId;
    const isAdmin = session?.user?.role === 'ADMIN';

    return (
        <div className="container mx-auto py-12 px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ItemGallery images={item.images} title={item.title} />
                <ItemDetails
                    item={item}
                    isOwner={isOwner}
                    isAdmin={isAdmin}
                    currentUserId={session?.user?.id}
                    sellerStats={{
                        salesCount: item.owner._count.sales,
                        itemsCount: item.owner._count.items,
                        reviewCount: sellerReviews._count.rating,
                        avgRating: sellerReviews._avg.rating,
                    }}
                    categoryName={item.category?.name}
                />
            </div>
        </div>
    );
}
