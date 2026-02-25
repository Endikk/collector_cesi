import { CheckoutPage as CheckoutPageComponent } from "@/app/checkout/[itemId]/_components/CheckoutPage";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function CheckoutPage({ params }: { params: Promise<{ itemId: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        const { itemId } = await params;
        redirect(`/api/auth/signin?callbackUrl=/checkout/${itemId}`);
    }

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
