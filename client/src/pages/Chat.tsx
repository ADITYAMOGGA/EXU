import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ChatArea } from '@/components/ChatArea';
import { NewChatModal } from '@/components/NewChatModal';
import { AuthModal } from '@/components/AuthModal';
import { useAuth } from '@/hooks/useAuth';
import { useChats } from '@/hooks/useChats';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Chat() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const { user, loading } = useAuth();
  const { chats } = useChats();
  const isMobile = useIsMobile();

  const selectedChat = selectedChatId 
    ? chats.find(c => c.id === selectedChatId)
    : null;

  useEffect(() => {
    if (isMobile && selectedChatId) {
      setShowSidebar(false);
    }
  }, [selectedChatId, isMobile]);

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  const handleBackToSidebar = () => {
    if (isMobile) {
      setShowSidebar(true);
      setSelectedChatId(null);
    }
  };

  const handleNewChat = () => {
    setShowNewChatModal(true);
  };

  const handleChatCreated = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthModal isOpen={true} onClose={() => {}} />;
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      {(!isMobile || showSidebar) && (
        <Sidebar
          selectedChatId={selectedChatId}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
        />
      )}

      {/* Chat Area */}
      {(!isMobile || !showSidebar) && (
        <ChatArea
          chatId={selectedChatId}
          chatName={selectedChat?.name || ''}
          chatAvatar={selectedChat?.avatarUrl}
          isOnline={selectedChat?.isOnline}
          onBack={isMobile ? handleBackToSidebar : undefined}
        />
      )}

      {/* Floating Action Button for Mobile */}
      {isMobile && showSidebar && (
        <Button
          onClick={handleNewChat}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          <Edit size={18} />
        </Button>
      )}

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onChatCreated={handleChatCreated}
      />
    </div>
  );
}
