"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function buyItem(itemId: string) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
        return { success: false, message: "Vous devez être connecté pour acheter." };
    }

    const userId = session.user.id;

    try {
        const item = await prisma.item.findUnique({
            where: { id: itemId },
        });

        if (!item) {
            return { success: false, message: "Objet introuvable." };
        }

        if (item.status !== "AVAILABLE") {
            return { success: false, message: "Cet objet n'est plus disponible." };
        }

        if (item.ownerId === userId) {
            return { success: false, message: "Vous ne pouvez pas acheter votre propre objet." };
        }

        // Create Transaction
        await prisma.$transaction([
            prisma.transaction.create({
                data: {
                    amount: item.price,
                    status: "COMPLETED", // Simulating immediate payment for V1
                    itemId: item.id,
                    buyerId: userId,
                    sellerId: item.ownerId,
                    commission: item.price * 0.05,
                },
            }),
            prisma.item.update({
                where: { id: item.id },
                data: { status: "SOLD" },
            }),
        ]);

        revalidatePath(`/items/${itemId}`);
        revalidatePath("/profile/purchases");
        revalidatePath("/profile/sales");
        revalidatePath("/");

        return { success: true, message: "Achat effectué avec succès !" };
    } catch (error) {
        console.error("Purchase error:", error);
        return { success: false, message: "Une erreur est survenue lors de l'achat." };
    }
}
