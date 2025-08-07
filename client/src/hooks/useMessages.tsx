import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { Message } from '@shared/schema';

interface MessageWithSender extends Message {
  sender: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
  reactions?: Array<{
    emoji: string;
    count: number;
    users: string[];
  }>;
}

export function useMessages(chatId: string | null) {
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState<string[]>([]);
  const { user } = useAuth();
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!chatId || !user) {
      setMessages([]);
      return;
    }

    fetchMessages();

    // Subscribe to new messages
    subscriptionRef.current = supabase
      .channel(`messages-${chatId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          fetchMessages();
        }
      )
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [chatId, user]);

  const fetchMessages = async () => {
    if (!chatId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(
            id,
            full_name,
            avatar_url
          ),
          message_reactions(
            emoji,
            user_id
          )
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages = data?.map((msg: any) => ({
        ...msg,
        sender: {
          id: msg.sender.id,
          fullName: msg.sender.full_name,
          avatarUrl: msg.sender.avatar_url,
        },
        reactions: groupReactions(msg.message_reactions || []),
      })) || [];

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, messageType = 'text') => {
    if (!chatId || !user || !content.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          content: content.trim(),
          message_type: messageType,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const reactToMessage = async (messageId: string, emoji: string) => {
    if (!user) return;

    try {
      // Check if user already reacted with this emoji
      const { data: existing } = await supabase
        .from('message_reactions')
        .select()
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('emoji', emoji)
        .single();

      if (existing) {
        // Remove reaction
        await supabase
          .from('message_reactions')
          .delete()
          .eq('id', existing.id);
      } else {
        // Add reaction
        await supabase
          .from('message_reactions')
          .insert({
            message_id: messageId,
            user_id: user.id,
            emoji,
          });
      }

      fetchMessages();
    } catch (error) {
      console.error('Error reacting to message:', error);
    }
  };

  const uploadFile = async (file: File, chatId: string) => {
    if (!user) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);

      // Send file message
      await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          content: `Shared ${file.name}`,
          message_type: file.type.startsWith('image/') ? 'image' : 'file',
          file_url: data.publicUrl,
          file_name: file.name,
          file_size: file.size,
        });

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  const groupReactions = (reactions: any[]) => {
    const grouped: { [emoji: string]: { emoji: string; count: number; users: string[] } } = {};
    
    reactions.forEach((reaction) => {
      if (!grouped[reaction.emoji]) {
        grouped[reaction.emoji] = {
          emoji: reaction.emoji,
          count: 0,
          users: [],
        };
      }
      grouped[reaction.emoji].count++;
      grouped[reaction.emoji].users.push(reaction.user_id);
    });

    return Object.values(grouped);
  };

  return {
    messages,
    loading,
    typing,
    sendMessage,
    reactToMessage,
    uploadFile,
  };
}
