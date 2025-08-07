import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

interface ChatWithLastMessage {
  id: string;
  name: string;
  isGroup: boolean;
  avatarUrl: string | null;
  lastMessage: string | null;
  lastMessageTime: string | null;
  unreadCount: number;
  isOnline?: boolean;
}

export function useChats() {
  const [chats, setChats] = useState<ChatWithLastMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    fetchChats();

    // Subscribe to chat changes
    const subscription = supabase
      .channel('chats')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'messages' },
        () => fetchChats()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const fetchChats = async () => {
    if (!user) return;

    try {
      // First, get all chats the user is a member of
      const { data: chatMembersData, error: chatMembersError } = await supabase
        .from('chat_members')
        .select(`
          chats!inner(
            id,
            name,
            is_group,
            avatar_url,
            created_at
          )
        `)
        .eq('user_id', user.id);

      if (chatMembersError) throw chatMembersError;

      if (!chatMembersData || chatMembersData.length === 0) {
        setChats([]);
        return;
      }

      // Get chat IDs
      const chatIds = chatMembersData.map((item: any) => item.chats.id);

      // Get the latest message for each chat
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('chat_id, content, created_at')
        .in('chat_id', chatIds)
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;

      // Create a map of latest messages per chat
      const latestMessages = new Map();
      if (messagesData) {
        messagesData.forEach((msg: any) => {
          if (!latestMessages.has(msg.chat_id)) {
            latestMessages.set(msg.chat_id, msg);
          }
        });
      }

      // Format the chats with their latest messages
      const formattedChats = chatMembersData.map((item: any) => {
        const chat = item.chats;
        const lastMessage = latestMessages.get(chat.id);
        
        return {
          id: chat.id,
          name: chat.name || 'Unknown',
          isGroup: chat.is_group,
          avatarUrl: chat.avatar_url,
          lastMessage: lastMessage?.content || null,
          lastMessageTime: lastMessage?.created_at || chat.created_at,
          unreadCount: 0, // TODO: Implement unread count
          isOnline: !chat.is_group, // For direct chats, we'll implement online status later
        };
      });

      // Sort by last message time
      formattedChats.sort((a, b) => {
        const timeA = new Date(a.lastMessageTime || 0).getTime();
        const timeB = new Date(b.lastMessageTime || 0).getTime();
        return timeB - timeA;
      });

      setChats(formattedChats);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const createChat = async (recipientId: string, isGroup = false, name?: string) => {
    if (!user) return null;

    try {
      // Create chat
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .insert({
          name,
          is_group: isGroup,
          created_by: user.id,
        })
        .select()
        .single();

      if (chatError) throw chatError;

      // Add members
      const members = [
        { chat_id: chatData.id, user_id: user.id },
        { chat_id: chatData.id, user_id: recipientId },
      ];

      const { error: membersError } = await supabase
        .from('chat_members')
        .insert(members);

      if (membersError) throw membersError;

      fetchChats();
      return chatData.id;
    } catch (error) {
      console.error('Error creating chat:', error);
      return null;
    }
  };

  return {
    chats,
    loading,
    createChat,
    refreshChats: fetchChats,
  };
}
