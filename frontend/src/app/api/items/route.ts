import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { z } from "zod";
import { sendResponse } from "@/lib/api-response";

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
                images: true,
            },
            orderBy: { createdAt: "desc" },
        });
        return sendResponse(200, items);
    } catch (error) {
        logger.error("Error fetching items", error);
        return sendResponse(500, null, "Error fetching items");
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        logger.warn("Unauthorized attempt to create item");
        return sendResponse(401, null, "Unauthorized");
    }

    try {
        const body = await req.json();

        // Validation des données entrantes (Sécurité / Qualité)
        const validation = createItemSchema.safeParse(body);

        if (!validation.success) {
            logger.warn("Validation error during item creation", { errors: validation.error.format() });
            return sendResponse(400, null, "Invalid data"); // Note: sendResponse types might need adjustment to support detailed errors if wanted, but adhering to signature
        }

        const { title, description, price, imageUrl } = validation.data;

        logger.info(`Creating item for user ${session.user.id}`, { title, price });

        const item = await prisma.item.create({
            data: {
                title,
                description,
                price,
                ownerId: session.user.id,
                published: true,
                // Create image if URL provided
                ...(imageUrl && {
                    images: {
                        create: {
                            url: imageUrl,
                        },
                    },
                }),
            },
            include: {
                images: true,
            },
        });

        return sendResponse(201, item);
    } catch (error) {
        logger.error("Error creating item", error, { userId: session.user.id });
        return sendResponse(500, null, "Error creating item");
    }
}
