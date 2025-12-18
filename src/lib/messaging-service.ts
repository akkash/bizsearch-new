import { supabase } from '@/lib/supabase';

export interface Conversation {
    id: string;
    participant_1: string;
    participant_2: string;
    last_message: string;
    last_message_at: string;
    unread_count: number;
    participant: {
        id: string;
        display_name: string;
        avatar_url: string | null;
        role: string;
    };
    listing?: {
        id: string;
        name: string;
        type: 'business' | 'franchise';
    };
}

export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    created_at: string;
    read_at: string | null;
    attachments?: {
        name: string;
        url: string;
        type: string;
    }[];
}

export class MessagingService {
    /**
     * Get all conversations for a user
     */
    static async getConversations(userId: string): Promise<Conversation[]> {
        const { data, error } = await supabase
            .from('conversations')
            .select(`
        id,
        participant_1,
        participant_2,
        last_message,
        last_message_at,
        listing_id,
        listing_type
      `)
            .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
            .order('last_message_at', { ascending: false });

        if (error || !data) return [];

        // Fetch participant details
        const conversations = await Promise.all(
            data.map(async (conv) => {
                const otherUserId = conv.participant_1 === userId ? conv.participant_2 : conv.participant_1;

                const { data: participant } = await supabase
                    .from('profiles')
                    .select('id, display_name, avatar_url, role')
                    .eq('id', otherUserId)
                    .single();

                // Get unread count
                const { count } = await supabase
                    .from('messages')
                    .select('*', { count: 'exact', head: true })
                    .eq('conversation_id', conv.id)
                    .neq('sender_id', userId)
                    .is('read_at', null);

                let listing = null;
                if (conv.listing_id && conv.listing_type) {
                    const table = conv.listing_type === 'franchise' ? 'franchises' : 'businesses';
                    const nameField = conv.listing_type === 'franchise' ? 'brand_name' : 'name';
                    const { data: listingData } = await supabase
                        .from(table)
                        .select(`id, ${nameField}`)
                        .eq('id', conv.listing_id)
                        .single();

                    if (listingData) {
                        listing = {
                            id: conv.listing_id,
                            name: listingData[nameField as keyof typeof listingData] as string,
                            type: conv.listing_type,
                        };
                    }
                }

                return {
                    ...conv,
                    unread_count: count || 0,
                    participant,
                    listing,
                };
            })
        );

        return conversations as Conversation[];
    }

    /**
     * Get messages in a conversation
     */
    static async getMessages(conversationId: string): Promise<Message[]> {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) return [];
        return data as Message[];
    }

    /**
     * Send a message
     */
    static async sendMessage(
        conversationId: string,
        senderId: string,
        content: string,
        attachments?: Message['attachments']
    ): Promise<Message | null> {
        const { data, error } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: senderId,
                content,
                attachments,
            })
            .select()
            .single();

        if (error) return null;

        // Update conversation's last message
        await supabase
            .from('conversations')
            .update({
                last_message: content,
                last_message_at: new Date().toISOString(),
            })
            .eq('id', conversationId);

        return data as Message;
    }

    /**
     * Start a new conversation or get existing one
     */
    static async getOrCreateConversation(
        userId1: string,
        userId2: string,
        listingId?: string,
        listingType?: 'business' | 'franchise'
    ): Promise<string | null> {
        // Check if conversation already exists
        const { data: existing } = await supabase
            .from('conversations')
            .select('id')
            .or(
                `and(participant_1.eq.${userId1},participant_2.eq.${userId2}),and(participant_1.eq.${userId2},participant_2.eq.${userId1})`
            )
            .single();

        if (existing) return existing.id;

        // Create new conversation
        const { data, error } = await supabase
            .from('conversations')
            .insert({
                participant_1: userId1,
                participant_2: userId2,
                listing_id: listingId,
                listing_type: listingType,
            })
            .select('id')
            .single();

        if (error) return null;
        return data.id;
    }

    /**
     * Mark messages as read
     */
    static async markAsRead(conversationId: string, userId: string): Promise<void> {
        await supabase
            .from('messages')
            .update({ read_at: new Date().toISOString() })
            .eq('conversation_id', conversationId)
            .neq('sender_id', userId)
            .is('read_at', null);
    }

    /**
     * Get unread message count for a user
     */
    static async getUnreadCount(userId: string): Promise<number> {
        // Get user's conversations
        const { data: conversations } = await supabase
            .from('conversations')
            .select('id')
            .or(`participant_1.eq.${userId},participant_2.eq.${userId}`);

        if (!conversations || conversations.length === 0) return 0;

        const conversationIds = conversations.map(c => c.id);

        const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .in('conversation_id', conversationIds)
            .neq('sender_id', userId)
            .is('read_at', null);

        return count || 0;
    }
}
