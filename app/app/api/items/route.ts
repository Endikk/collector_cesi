import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { logger } from "@/lib/logger";
import { z } from "zod";

// Schema de validation pour la création d'objet
const createItemSchema = z.object({
    title: z.string().min(3, "Le titre doit faire au moins 3 caractères"),
    description: z.string().min(10, "La description doit être plus détaillée"),
    price: z.preprocess((val) => Number(val), z.number().positive("Le prix doit être positif")),
    imageUrl: z.string().url().optional().or(z.literal("")),
});

export async function GET() {
    try {
        logger.info("Fetching all items");
        const items = await prisma.item.findMany({
            include: {
                owner: {
                    select: { name: true, email: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(items);
    } catch (error) {
        logger.error("Error fetching items", error);
        return NextResponse.json({ error: "Error fetching items" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        logger.warn("Unauthorized attempt to create item");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();

        // Validation des données entrantes (Sécurité / Qualité)
        const validation = createItemSchema.safeParse(body);

        if (!validation.success) {
            logger.warn("Validation error during item creation", { errors: validation.error.format() });
            return NextResponse.json({ error: "Invalid data", details: validation.error.format() }, { status: 400 });
        }

        const { title, description, price, imageUrl } = validation.data;

        logger.info(`Creating item for user ${session.user.id}`, { title, price });

        const item = await prisma.item.create({
            data: {
                title,
                description,
                price,
                imageUrl: imageUrl || "https://placehold.co/600x400/png",
                ownerId: session.user.id,
                published: true,
            },
        });

        return NextResponse.json(item, { status: 201 });
    } catch (error) {
        logger.error("Error creating item", error, { userId: session.user.id });
        return NextResponse.json({ error: "Error creating item" }, { status: 500 });
    }
}
