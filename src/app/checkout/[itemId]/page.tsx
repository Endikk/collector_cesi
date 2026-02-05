import { CheckoutPage as CheckoutPageComponent } from "@/app/checkout/[itemId]/_components/CheckoutPage";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function CheckoutPage({ params }: { params: Promise<{ itemId: string }> }) {
    const { itemId } = await params;

    const item = await prisma.item.findUnique({
        where: { id: itemId },
        include: {
            images: true,
        },
    });

    if (!item) {
        notFound();
    }

    return <CheckoutPageComponent item={item} />;
}
