import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useChats } from '@/hooks/useChats';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AddFriendsModal } from '@/components/AddFriendsModal';
import { FriendRequestsModal } from '@/components/FriendRequestsModal';
import { useFriendRequests } from '@/hooks/useFriendRequests';
import { Search, Edit, Settings, Users, Archive, LogOut, UserPlus, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation } from 'wouter';

interface SidebarProps {
  selectedChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
}

export function Sidebar({ selectedChatId, onChatSelect, onNewChat }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'groups' | 'archived'>('all');
  const [showAddFriends, setShowAddFriends] = useState(false);
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const { user, signOut } = useAuth();
  const { chats, loading } = useChats();
  const { pendingCount } = useFriendRequests();
  const [, setLocation] = useLocation();

  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'groups' && chat.isGroup) ||
                      (activeTab === 'archived' && false); // TODO: implement archived chats
    return matchesSearch && matchesTab;
  });

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short' 
    });
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="w-full md:w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-purple-600">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center space-x-3 cursor-pointer hover:bg-white hover:bg-opacity-10 rounded-lg p-2 transition-colors"
            onClick={() => setLocation('/profile')}
            title="Edit Profile"
          >
            <div className="relative">
              <Avatar className="w-10 h-10 border-2 border-white">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-white text-indigo-600">
                  {user?.user_metadata?.full_name ? getUserInitials(user.user_metadata.full_name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h2 className="font-semibold text-white">
                {user?.user_metadata?.full_name || 'User'}
              </h2>
              <p className="text-xs text-white opacity-80">Online</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full text-white relative"
              onClick={() => setShowFriendRequests(true)}
              title="Friend Requests"
            >
              <Bell size={16} />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full text-white"
              onClick={() => setShowAddFriends(true)}
              title="Add Friends"
              data-testid="button-add-friends"
            >
              <UserPlus size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full text-white"
              onClick={onNewChat}
              title="New Chat"
            >
              <Edit size={16} />
            </Button>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full text-white"
              onClick={signOut}
              title="Sign Out"
            >
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-100 dark:bg-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 border-gray-200 dark:border-gray-600"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 dark:border-gray-700">
        <Button
          variant="ghost"
          className={cn(
            "flex-1 py-3 px-4 text-sm font-medium rounded-none",
            activeTab === 'all' 
              ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30" 
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          )}
          onClick={() => setActiveTab('all')}
        >
          All Chats
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "flex-1 py-3 px-4 text-sm font-medium rounded-none",
            activeTab === 'groups' 
              ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30" 
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          )}
          onClick={() => setActiveTab('groups')}
        >
          Groups
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "flex-1 py-3 px-4 text-sm font-medium rounded-none",
            activeTab === 'archived' 
              ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30" 
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          )}
          onClick={() => setActiveTab('archived')}
        >
          Archived
        </Button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {loading ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading chats...</div>
        ) : filteredChats.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {searchQuery ? 'No chats found' : 'No chats yet. Start a new conversation!'}
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              className={cn(
                "flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors chat-item-hover mobile-friendly touch-target",
                selectedChatId === chat.id && "border-l-4 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
              )}
              onClick={() => onChatSelect(chat.id)}
            >
              <div className="relative mr-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={chat.avatarUrl || ''} />
                  <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                    {chat.isGroup ? <Users size={20} /> : getUserInitials(chat.name)}
                  </AvatarFallback>
                </Avatar>
                {!chat.isGroup && (
                  <div className={cn(
                    "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white",
                    chat.isOnline ? "bg-green-500" : "bg-gray-400"
                  )}></div>
                )}
                {chat.isGroup && chat.unreadCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 text-white text-xs flex items-center justify-center"
                  >
                    {chat.unreadCount}
                  </Badge>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={cn(
                    "truncate",
                    selectedChatId === chat.id ? "font-semibold text-gray-900 dark:text-gray-100" : "font-medium text-gray-900 dark:text-gray-100"
                  )}>
                    {chat.name}
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTime(chat.lastMessageTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                    {chat.lastMessage || 'No messages yet'}
                  </p>
                  <div className="flex items-center space-x-1">
                    {chat.unreadCount > 0 && !chat.isGroup && (
                      <Badge className="w-5 h-5 bg-indigo-500 text-white text-xs flex items-center justify-center">
                        {chat.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Friend Connection Modals */}
      <AddFriendsModal 
        isOpen={showAddFriends} 
        onClose={() => setShowAddFriends(false)} 
      />
      <FriendRequestsModal 
        isOpen={showFriendRequests} 
        onClose={() => setShowFriendRequests(false)} 
      />
    </div>
  );
}
