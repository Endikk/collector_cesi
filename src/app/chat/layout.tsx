import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getConversations } from "@/lib/actions/chat";
import { ChatSidebar } from "@/components/layout/ChatSidebar";
import { redirect } from "next/navigation";

export default async function ChatLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/api/auth/signin");
    }

    const { conversations } = await getConversations();

    return (
        <div className="flex h-[calc(100vh-4rem)] w-full">
            <ChatSidebar
                conversations={conversations || []}
                currentUserId={session.user.id}
            />
            <div className="flex-1 overflow-hidden">
                {children}
            </div>
        </div>
    );
}
