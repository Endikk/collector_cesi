
import { getServerSession } from "next-auth/next";
import { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMessages, getConversations } from "@/lib/actions/chat";
import { ChatWindow } from "@/components/common/ChatWindow";
import { redirect } from "next/navigation";

export async function ConversationPage({ params }: { params: Promise<{ conversationId: string }> }) {
    const session = await getServerSession(authOptions) as Session | null;

    if (!session || !session.user) {
        redirect("/api/auth/signin");
    }

    const { conversationId } = await params;

    // Fetch messages
    const { messages } = await getMessages(conversationId);

    // Fetch conversation details to get other participant name
    // Optimization: create a specific function for this or reuse getConversations
    // For now, let's reuse getConversations and find the current one
    const { conversations } = await getConversations();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentConversation = conversations?.find((c: any) => c.id === conversationId);

    if (!currentConversation) {
        return (
            <div className="flex items-center justify-center h-full">
                <p>Conversation introuvable</p>
            </div>
        );
    }

    const otherParticipant = currentConversation.participants.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (p: any) => p.id !== session.user.id
    ) || currentConversation.participants[0];

    return (
        <div className="h-full w-full">
            <ChatWindow
                conversationId={conversationId}
                initialMessages={messages || []}
                currentUserId={session.user.id}
                otherUserName={otherParticipant?.name || "Utilisateur"}
            />
        </div>
    );
}
