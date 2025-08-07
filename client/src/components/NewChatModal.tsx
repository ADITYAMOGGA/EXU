import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useChats } from '@/hooks/useChats';
import { supabase } from '@/lib/supabase';
import { Search, Users, X } from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  is_online: boolean;
}

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChatCreated: (chatId: string) => void;
}

export function NewChatModal({ isOpen, onClose, onChatCreated }: NewChatModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { createChat } = useChats();

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, avatar_url, is_online')
        .neq('id', user.id)
        .order('full_name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartChat = async (recipientId: string) => {
    const chatId = await createChat(recipientId);
    if (chatId) {
      onChatCreated(chatId);
      onClose();
      setSearchQuery('');
    }
  };

  const handleCreateGroup = () => {
    // TODO: Implement group creation
    console.log('Group creation not implemented yet');
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">New Chat</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </Button>
          </div>
        </DialogHeader>

        {/* Search Users */}
        <div className="border-b border-gray-100 dark:border-gray-700 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
            <Input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        {/* User List */}
        <div className="max-h-64 overflow-y-auto scrollbar-thin">
          {loading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              {searchQuery ? 'No users found' : 'No users available'}
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between transition-colors"
                onClick={() => handleStartChat(user.id)}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.avatar_url || ''} />
                    <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      {getUserInitials(user.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{user.full_name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  user.is_online ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
              </div>
            ))
          )}
        </div>

        {/* Actions */}
        <div className="bg-gray-50 dark:bg-gray-800 -mx-6 -mb-6 p-6 flex space-x-3">
          <Button
            onClick={handleCreateGroup}
            className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl"
          >
            <Users className="mr-2" size={16} />
            Create Group
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
