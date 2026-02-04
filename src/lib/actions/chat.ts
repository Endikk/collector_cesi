"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
