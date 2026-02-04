import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ItemGallery } from "@/components/pages/items/ItemGallery";
import { ItemDetails } from "@/components/pages/items/ItemDetails";
import { notFound } from "next/navigation";

export default async function ItemPage({ params }: { params: { id: string } }) {
    const item = await prisma.item.findUnique({
        where: { id: params.id },
        include: {
            owner: {
                select: { id: true, name: true, image: true },
            },
            images: true,
        },
    });

    if (!item) {
        notFound();
    }


    const session = await getServerSession(authOptions);
    const isOwner = session?.user?.id === item.ownerId;

    return (
        <div className="container mx-auto py-12 px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ItemGallery images={item.images} title={item.title} />
                <ItemDetails
                    item={item}
                    isOwner={isOwner}
                    currentUserId={session?.user?.id}
                />
            </div>
        </div>
    );
}
