import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subscriberRedis } from "@/lib/redis";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ conversationId: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return new Response("Unauthorized", { status: 401 });
    }

    const { conversationId } = await params;

    // Verify participation
    const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { participants: { select: { id: true } } },
    });

    if (!conversation) {
        return new Response("Not Found", { status: 404 });
    }

    const isParticipant = conversation.participants.some(
        (p) => p.id === session.user.id
    );

    if (!isParticipant) {
        return new Response("Forbidden", { status: 403 });
    }

    // Set up SSE headers
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            const channel = `chat:${conversationId}`;

            // Send initial connection successful message
            controller.enqueue(encoder.encode(`data: {"type": "connected"}\n\n`));

            const redisClient = subscriberRedis.duplicate();

            redisClient.on("message", (ch, message) => {
                if (ch === channel) {
                    controller.enqueue(encoder.encode(`data: ${message}\n\n`));
                }
            });

            await redisClient.subscribe(channel);

            // Keep connection alive
            const pingInterval = setInterval(() => {
                try {
                    controller.enqueue(encoder.encode(`:\n\n`));
                } catch (e) {
                    clearInterval(pingInterval);
                    redisClient.unsubscribe(channel);
                    redisClient.quit();
                }
            }, 30000);

            request.signal.addEventListener("abort", () => {
                clearInterval(pingInterval);
                redisClient.unsubscribe(channel);
                redisClient.quit();
                try { controller.close() } catch (e) { }
            });
        }
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
        },
    });
}
