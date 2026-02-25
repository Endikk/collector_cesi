import { ConversationPage as ConversationPageComponent } from "@/app/chat/[conversationId]/_components/ConversationPage";

export default function ConversationPage({ params }: { params: Promise<{ conversationId: string }> }) {
    return <ConversationPageComponent params={params} />;
}
