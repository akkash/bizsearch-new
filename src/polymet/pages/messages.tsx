import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    MessageSquare,
    Send,
    Search,
    Loader2,
    Building2,
    ExternalLink,
    RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MessagingService, type Conversation, type Message } from '@/lib/messaging-service';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const CONVERSATIONS_POLL_INTERVAL = 30000; // 30 seconds for conversations list
const MESSAGES_POLL_INTERVAL = 5000; // 5 seconds for active messages

export function MessagesPage() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isPolling, setIsPolling] = useState(false);
    const [lastPolled, setLastPolled] = useState<Date | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const selectedConvRef = useRef<string | null>(null);

    // Keep selectedConvRef in sync
    useEffect(() => {
        selectedConvRef.current = selectedConv?.id || null;
    }, [selectedConv]);

    // Load conversations on mount
    useEffect(() => {
        if (user) {
            loadConversations();
        }
    }, [user]);

    // Load messages when conversation changes
    useEffect(() => {
        if (selectedConv) {
            loadMessages(selectedConv.id);
            MessagingService.markAsRead(selectedConv.id, user!.id);
        }
    }, [selectedConv, user]);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Polling for conversations (every 30 seconds)
    useEffect(() => {
        if (!user) return;

        const pollConversations = async () => {
            const data = await MessagingService.getConversations(user.id);
            setConversations(data);
            setLastPolled(new Date());
        };

        const intervalId = setInterval(pollConversations, CONVERSATIONS_POLL_INTERVAL);
        return () => clearInterval(intervalId);
    }, [user]);

    // Polling for messages (every 5 seconds when conversation is selected)
    useEffect(() => {
        if (!user || !selectedConv) return;

        const pollMessages = async () => {
            setIsPolling(true);
            const convId = selectedConvRef.current;
            if (convId) {
                const data = await MessagingService.getMessages(convId);
                // Only update if we got new messages
                if (data.length !== messages.length) {
                    setMessages(data);
                }
            }
            setIsPolling(false);
        };

        const intervalId = setInterval(pollMessages, MESSAGES_POLL_INTERVAL);
        return () => clearInterval(intervalId);
    }, [user, selectedConv?.id]);

    const loadConversations = async () => {
        if (!user) return;
        setLoading(true);
        const data = await MessagingService.getConversations(user.id);
        setConversations(data);
        setLastPolled(new Date());
        setLoading(false);
    };

    const loadMessages = useCallback(async (conversationId: string) => {
        const data = await MessagingService.getMessages(conversationId);
        setMessages(data);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async () => {
        if (!newMessage.trim() || !selectedConv || !user) return;

        setSending(true);
        const message = await MessagingService.sendMessage(
            selectedConv.id,
            user.id,
            newMessage.trim()
        );

        if (message) {
            setMessages(prev => [...prev, message]);
            setNewMessage('');
            // Update conversation in list
            setConversations(prev =>
                prev.map(c =>
                    c.id === selectedConv.id
                        ? { ...c, last_message: newMessage.trim(), last_message_at: new Date().toISOString() }
                        : c
                )
            );
        } else {
            toast.error('Failed to send message');
        }
        setSending(false);
    };

    const handleManualRefresh = async () => {
        if (selectedConv) {
            setIsPolling(true);
            await loadMessages(selectedConv.id);
            setIsPolling(false);
            toast.success('Messages refreshed');
        }
    };

    const filteredConversations = conversations.filter(conv =>
        conv.participant?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.listing?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container max-w-6xl mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Messages</h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                        Your conversations with sellers and franchisors
                        {isPolling && (
                            <span className="flex items-center text-xs text-primary">
                                <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                                Syncing...
                            </span>
                        )}
                        {lastPolled && !isPolling && (
                            <span className="text-xs text-muted-foreground">
                                • Last updated {formatDistanceToNow(lastPolled, { addSuffix: true })}
                            </span>
                        )}
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
                {/* Conversations List */}
                <Card className="lg:col-span-1">
                    <CardHeader className="pb-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search conversations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardHeader>
                    <ScrollArea className="h-[500px]">
                        <CardContent className="p-2">
                            {filteredConversations.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>No conversations yet</p>
                                    <p className="text-sm mt-1">Start by inquiring about a listing</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {filteredConversations.map((conv) => (
                                        <button
                                            key={conv.id}
                                            onClick={() => setSelectedConv(conv)}
                                            className={cn(
                                                'w-full text-left p-3 rounded-lg transition-colors',
                                                selectedConv?.id === conv.id
                                                    ? 'bg-primary/10'
                                                    : 'hover:bg-muted'
                                            )}
                                        >
                                            <div className="flex items-start gap-3">
                                                <Avatar>
                                                    <AvatarImage src={conv.participant?.avatar_url || ''} />
                                                    <AvatarFallback>
                                                        {conv.participant?.display_name?.charAt(0) || '?'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium truncate">
                                                            {conv.participant?.display_name || 'Unknown'}
                                                        </span>
                                                        {conv.unread_count > 0 && (
                                                            <Badge variant="default" className="ml-2">
                                                                {conv.unread_count}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {conv.listing && (
                                                        <p className="text-xs text-primary truncate">{conv.listing.name}</p>
                                                    )}
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        {conv.last_message || 'No messages yet'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </ScrollArea>
                </Card>

                {/* Messages View */}
                <Card className="lg:col-span-2 flex flex-col">
                    {selectedConv ? (
                        <>
                            {/* Header */}
                            <CardHeader className="border-b pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={selectedConv.participant?.avatar_url || ''} />
                                            <AvatarFallback>
                                                {selectedConv.participant?.display_name?.charAt(0) || '?'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="text-lg">
                                                {selectedConv.participant?.display_name}
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground capitalize">
                                                {selectedConv.participant?.role}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {selectedConv.listing && (
                                            <Button variant="outline" size="sm" asChild>
                                                <Link to={`/${selectedConv.listing.type}/${selectedConv.listing.id}`}>
                                                    <Building2 className="h-4 w-4 mr-1" />
                                                    {selectedConv.listing.name}
                                                    <ExternalLink className="h-3 w-3 ml-1" />
                                                </Link>
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleManualRefresh}
                                            disabled={isPolling}
                                        >
                                            <RefreshCw className={cn("h-4 w-4", isPolling && "animate-spin")} />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>

                            {/* Messages */}
                            <ScrollArea className="flex-1 p-4">
                                {messages.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <p>No messages yet. Send the first message!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {messages.map((message) => {
                                            const isOwnMessage = message.sender_id === user?.id;
                                            return (
                                                <div
                                                    key={message.id}
                                                    className={cn(
                                                        'flex',
                                                        isOwnMessage ? 'justify-end' : 'justify-start'
                                                    )}
                                                >
                                                    <div
                                                        className={cn(
                                                            'max-w-[70%] rounded-lg px-4 py-2',
                                                            isOwnMessage
                                                                ? 'bg-primary text-primary-foreground'
                                                                : 'bg-muted'
                                                        )}
                                                    >
                                                        <p className="text-sm">{message.content}</p>
                                                        <p
                                                            className={cn(
                                                                'text-xs mt-1',
                                                                isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                                            )}
                                                        >
                                                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>
                                )}
                            </ScrollArea>

                            {/* Input */}
                            <div className="p-4 border-t">
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSend();
                                    }}
                                    className="flex gap-2"
                                >
                                    <Input
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        disabled={sending}
                                    />
                                    <Button type="submit" disabled={!newMessage.trim() || sending}>
                                        {sending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Send className="h-4 w-4" />
                                        )}
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">Select a conversation</p>
                                <p className="text-sm">Choose from your conversations on the left</p>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
