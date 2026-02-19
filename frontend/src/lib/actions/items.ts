"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const createItemSchema = z.object({
    title: z.string().min(5, "Le titre doit faire au moins 5 caractères").max(100),
    description: z.string().min(20, "La description doit être détaillée (min 20 caractères)"),
    price: z.preprocess((val) => Number(val), z.number().min(1, "Le prix minimum est de 1€")),
    imageUrl: z.string().url("URL d'image invalide").optional().or(z.literal("")),
    categoryId: z.string().min(1, "Veuillez sélectionner une catégorie"),
});

export type State = {
    errors?: {
        title?: string[];
        description?: string[];
        price?: string[];
        imageUrl?: string[];
        categoryId?: string[];
    };
    message?: string | null;
    success?: boolean;
};

export async function createItem(prevState: State, formData: FormData) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return {
            message: "Vous devez être connecté pour publier une annonce.",
            success: false,
        };
    }

    const validatedFields = createItemSchema.safeParse({
        title: formData.get("title"),
        description: formData.get("description"),
        price: formData.get("price"),
        imageUrl: formData.get("imageUrl"),
        categoryId: formData.get("categoryId"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Veuillez corriger les erreurs dans le formulaire.",
            success: false,
        };
    }

    const { title, description, price, imageUrl, categoryId } = validatedFields.data;

    try {
        const item = await prisma.item.create({
            data: {
                title,
                description,
                price,
                ownerId: session.user.id,
                published: true,
                categoryId,
                ...(imageUrl && {
                    images: {
                        create: { url: imageUrl },
                    },
                }),
            },
        });

        // Trigger notifications in background (don't wait for it)
        fetch(`${process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:4000'}/notifications/trigger-new-item`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                itemId: item.id,
                title: item.title,
                description: item.description,
                price: item.price,
                categoryId: item.categoryId,
                ownerId: item.ownerId,
            }),
        }).catch(err => console.error('Failed to trigger notifications:', err));

        revalidatePath("/");
        revalidatePath("/profile/sales");

        return { success: true, message: "Votre annonce a été publiée avec succès !" };
    } catch (err) {
        console.error("Database Error:", err);
        return {
            message: "Une erreur est survenue lors de la création de l'annonce.",
            success: false,
        };
    }
}

export async function getCategories() {
    try {
        return await prisma.category.findMany({
            orderBy: { name: "asc" },
        });
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return [];
    }
}

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
            return { success: false, message: "Objet introuvable" };
        }

        if (item.ownerId !== session.user.id) {
            return { success: false, message: "Vous n'êtes pas le propriétaire de cet objet" };
        }

        await prisma.item.delete({
            where: { id: itemId },
        });

        revalidatePath("/");
        revalidatePath("/profile/sales");

        return { success: true, message: "Annonce supprimée" };
    } catch (error) {
        console.error("Delete Error:", error);
        return { success: false, message: "Erreur lors de la suppression" };
    }
}
