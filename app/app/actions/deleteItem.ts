"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteItem(itemId: string) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return { success: false, message: "Non autorisé" };
    }

    try {
        const item = await prisma.item.findUnique({
            where: { id: itemId },
        });

        if (!item) {
            return { success: false, message: "Objet non trouvé" };
        }

        if (item.ownerId !== session.user.id) {
            return { success: false, message: "Vous n'êtes pas le propriétaire de cet objet" };
        }

        await prisma.item.delete({
            where: { id: itemId },
        });

        revalidatePath("/");
        return { success: true, message: "Objet supprimé avec succès" };
    } catch (error) {
        console.error("Erreur destruction objet:", error);
        return { success: false, message: "Une erreur est survenue lors de la suppression" };
    }
}
