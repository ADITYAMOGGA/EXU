import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useMessages } from '@/hooks/useMessages';
import { MessageBubble } from './MessageBubble';
import { ArrowLeft, Phone, Video, Info, Plus, Smile, Send, Mic, Paperclip } from 'lucide-react';

interface ChatAreaProps {
  chatId: string | null;
  chatName: string;
  chatAvatar?: string | null;
  isOnline?: boolean;
  onBack?: () => void;
}

export function ChatArea({ chatId, chatName, chatAvatar, isOnline, onBack }: ChatAreaProps) {
  const [messageText, setMessageText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { messages, loading, sendMessage, reactToMessage, uploadFile } = useMessages(chatId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    
    await sendMessage(messageText);
    setMessageText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px';
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && chatId) {
      await uploadFile(file, chatId);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (!chatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="text-white" size={24} />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Welcome to ChatterLite</h3>
          <p className="text-gray-500 dark:text-gray-400">Select a chat to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Chat Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={onBack}
            >
              <ArrowLeft size={20} />
            </Button>
          )}
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarImage src={chatAvatar || ''} />
              <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                {getUserInitials(chatName)}
              </AvatarFallback>
            </Avatar>
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
              isOnline ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{chatName}</h3>
            <p className="text-sm text-green-600 dark:text-green-400">
              {isOnline ? 'Online • Last seen now' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400">
            <Phone size={20} />
          </Button>
          <Button variant="ghost" size="sm" className="p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400">
            <Video size={20} />
          </Button>
          <Button variant="ghost" size="sm" className="p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400">
            <Info size={20} />
          </Button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500 dark:text-gray-400">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                <Send className="text-gray-400 dark:text-gray-500" size={20} />
              </div>
              <p className="text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onReact={reactToMessage}
            />
          ))
        )}
        
        {/* Typing Indicator */}
        {/* TODO: Implement typing indicator */}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-end space-x-3">
          {/* File Attachment */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <Button
            variant="ghost"
            size="sm"
            className="p-3 text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full"
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus size={20} />
          </Button>

          {/* Message Input */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={messageText}
              onChange={handleTextareaInput}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none max-h-32 min-h-12"
              rows={1}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400"
            >
              <Smile size={16} />
            </Button>
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
            className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-md"
          >
            <Send size={16} />
          </Button>

          {/* Voice Message */}
          <Button
            variant="ghost"
            size="sm"
            className={`p-3 rounded-full transition-all ${
              isRecording 
                ? 'text-red-500 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50'
                : 'text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
            }`}
            onClick={() => setIsRecording(!isRecording)}
          >
            <Mic size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}
