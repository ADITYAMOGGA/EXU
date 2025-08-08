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
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'chat_members' },
        () => fetchChats()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'chats' },
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

      if (chatMembersError) {
        console.error('Error fetching chat members:', chatMembersError);
        throw chatMembersError;
      }

      console.log('Chat members data:', chatMembersData);

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

      // Format the chats with their latest messages and proper names
      const formattedChats = await Promise.all(
        chatMembersData.map(async (item: any) => {
          const chat = item.chats;
          const lastMessage = latestMessages.get(chat.id);
          
          let chatName = chat.name;
          let avatarUrl = chat.avatar_url;
          
          // For direct chats (non-group), get the other user's name
          if (!chat.is_group && !chatName) {
            const { data: otherMembers } = await supabase
              .from('chat_members')
              .select(`
                user_id,
                users!inner(
                  full_name,
                  avatar_url
                )
              `)
              .eq('chat_id', chat.id)
              .neq('user_id', user.id)
              .limit(1);
            
            if (otherMembers && otherMembers.length > 0 && otherMembers[0].users) {
              chatName = otherMembers[0].users.full_name || 'Unknown User';
              if (!avatarUrl) {
                avatarUrl = otherMembers[0].users.avatar_url;
              }
            }
          }
          
          return {
            id: chat.id,
            name: chatName || 'Unknown Chat',
            isGroup: chat.is_group,
            avatarUrl: avatarUrl,
            lastMessage: lastMessage?.content || null,
            lastMessageTime: lastMessage?.created_at || chat.created_at,
            unreadCount: 0, // TODO: Implement unread count
            isOnline: !chat.is_group, // For direct chats, we'll implement online status later
          };
        })
      );

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
