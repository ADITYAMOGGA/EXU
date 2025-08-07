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
      const { data, error } = await supabase
        .from('chat_members')
        .select(`
          chats!inner(
            id,
            name,
            is_group,
            avatar_url
          ),
          messages(
            content,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedChats = data?.map((item: any) => ({
        id: item.chats.id,
        name: item.chats.name || 'Unknown',
        isGroup: item.chats.is_group,
        avatarUrl: item.chats.avatar_url,
        lastMessage: item.messages?.[0]?.content || null,
        lastMessageTime: item.messages?.[0]?.created_at || null,
        unreadCount: 0, // TODO: Implement unread count
        isOnline: !item.chats.is_group, // For direct chats, we'll implement online status later
      })) || [];

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
