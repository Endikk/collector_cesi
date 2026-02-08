"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Fonction de modération du contenu
async function moderateContent(content: string): Promise<{
    allowed: boolean;
    flagged?: boolean;
    reasons?: string[];
    message?: string;
}> {
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi;
    const phonePatterns = [
        /\b0[1-9](?:[\s.-]*\d{2}){4}\b/g,
        /\b(?:\+33|0033)[1-9](?:[\s.-]*\d{2}){4}\b/g,
        /\b\d{10,}\b/g,
    ];
    const urlPattern = /(https?:\/\/[^\s]+)/gi;
    const suspiciousKeywords = [
        'whatsapp', 'telegram', 'signal', 'appel', 'appeler',
        'contacte', 'contactez', 'hors site', 'paypal', 'virement',
        'espèces', 'liquide', 'cash', 'western union', 'mandat',
    ];

    const reasons: string[] = [];
    let flagged = false;

    // Vérifier emails
    if (emailPattern.test(content)) {
        flagged = true;
        reasons.push('Adresse email détectée');
    }

    // Vérifier téléphones
    for (const pattern of phonePatterns) {
        if (pattern.test(content)) {
            flagged = true;
            reasons.push('Numéro de téléphone détecté');
            break;
        }
    }

    // Vérifier URLs externes
    const urls = content.match(urlPattern);
    if (urls) {
        const externalUrls = urls.filter(url => !url.includes('collector.shop'));
        if (externalUrls.length > 0) {
            flagged = true;
            reasons.push('Lien externe détecté');
        }
    }

    // Vérifier mots-clés suspects
    const lowerContent = content.toLowerCase();
    const foundKeywords = suspiciousKeywords.filter(keyword =>
        lowerContent.includes(keyword)
    );
    if (foundKeywords.length > 0) {
        flagged = true;
        reasons.push(`Mots suspects: ${foundKeywords.join(', ')}`);
    }

    if (flagged) {
        return {
            allowed: false,
            flagged: true,
            reasons,
            message: `❌ Message bloqué : ${reasons.join(', ')}.\n\n⚠️ Les échanges d'informations personnelles sont interdits.\n💳 Tous les paiements doivent passer par Collector.shop pour votre sécurité.`,
        };
    }

    return { allowed: true, flagged: false };
}

export async function getConversations() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return { success: false, message: "Non autorisé" };
    }

    try {
        const conversations = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: {
                        id: session.user.id,
                    },
                },
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
                messages: {
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 1,
                },
            },
            orderBy: {
                updatedAt: "desc",
            },
        });

        return { success: true, conversations };
    } catch (error) {
        console.error("Erreur récupération conversations:", error);
        return { success: false, message: "Erreur serveur" };
    }
}

export async function getMessages(conversationId: string) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return { success: false, message: "Non autorisé" };
    }

    try {
        // Verify participant
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                participants: {
                    select: { id: true },
                },
            },
        });

        if (!conversation) {
            return { success: false, message: "Conversation introuvable" };
        }

        const isParticipant = conversation.participants.some(
            (p: { id: string }) => p.id === session.user.id
        );

        if (!isParticipant) {
            return { success: false, message: "Accès refusé" };
        }

        const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: "asc" },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
        });

        return { success: true, messages };
    } catch (error) {
        console.error("Erreur récupération messages:", error);
        return { success: false, message: "Erreur serveur" };
    }
}

export async function sendMessage(conversationId: string, content: string) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return { success: false, message: "Non autorisé" };
    }

    // Modération du contenu
    const moderationResult = await moderateContent(content);
    
    if (!moderationResult.allowed) {
        return { 
            success: false, 
            message: moderationResult.message || "Message bloqué par la modération"
        };
    }

    try {
        // Verify participation
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { participants: true },
        });

        if (!conversation) {
            return { success: false, message: "Conversation introuvable" };
        }

        const isParticipant = conversation.participants.some(
            (p: { id: string }) => p.id === session.user.id
        );

        if (!isParticipant) {
            return { success: false, message: "Accès refusé" };
        }

        const newMessage = await prisma.message.create({
            data: {
                content,
                conversationId,
                senderId: session.user.id,
            },
        });

        await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
        });

        revalidatePath(`/chat/${conversationId}`);
        revalidatePath("/chat");

        return {
            success: true,
            data: {
                id: newMessage.id,
                content: newMessage.content,
                createdAt: newMessage.createdAt,
                senderId: newMessage.senderId,
            }
        };
    } catch (error) {
        console.error("Erreur envoi message:", error);
        return { success: false, error: "Erreur serveur" };
    }
}

export async function startConversation(targetUserId: string) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return { success: false, message: "Non autorisé" };
    }

    if (targetUserId === session.user.id) {
        return { success: false, message: "Vous ne pouvez pas discuter avec vous-même" };
    }

    try {
        // Check if conversation already exists
        const existingConversations = await prisma.conversation.findMany({
            where: {
                AND: [
                    { participants: { some: { id: session.user.id } } },
                    { participants: { some: { id: targetUserId } } },
                ],
            },
            take: 1
        });

        if (existingConversations.length > 0) {
            return { success: true, conversationId: existingConversations[0].id };
        }

        // Create new
        const newConversation = await prisma.conversation.create({
            data: {
                participants: {
                    connect: [
                        { id: session.user.id },
                        { id: targetUserId },
                    ],
                },
            },
        });

        revalidatePath("/chat");
        return { success: true, conversationId: newConversation.id };

    } catch (error) {
        console.error("Erreur création conversation:", error);
        return { success: false, message: "Erreur serveur" };
    }
}
