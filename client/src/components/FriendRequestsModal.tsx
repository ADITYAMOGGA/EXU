import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserCheck, UserX, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { useChats } from '@/hooks/useChats';

interface FriendRequest {
  id: string;
  senderId: string;
  sender: {
    fullName: string;
    email: string;
    avatarUrl: string | null;
  };
  createdAt: string;
  status: string;
}

interface FriendRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FriendRequestsModal({ isOpen, onClose }: FriendRequestsModalProps) {
  const { user } = useAuth();
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { fetchChats } = useChats();
  const refreshChats = fetchChats;

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    if (isOpen) {
      loadFriendRequests();
    }
  }, [isOpen]);

  const loadFriendRequests = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/friend-requests/pending/${user.id}`);
      if (response.ok) {
        const requests = await response.json();
        setFriendRequests(requests);
      }
    } catch (error) {
      console.error('Failed to load friend requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFriendRequest = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      const response = await fetch(`/api/friend-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action === 'accept' ? 'accepted' : 'rejected' }),
      });

      if (response.ok) {
        // Remove the request from the list
        setFriendRequests(prev => prev.filter(req => req.id !== requestId));
        
        if (action === 'accept') {
          // Smooth update without page reload
          // console.log('Friend request accepted!');
          // Manually refresh the chat list to show the new chat
          setTimeout(() => {
            refreshChats();
          }, 500); // Small delay to allow server to create the chat
          
          // Optional: Show a toast notification
          // toast({ title: "Friend request accepted!", description: "You can now start chatting." });
        }
      }
    } catch (error) {
      console.error(`Failed to ${action} friend request:`, error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 text-center flex items-center justify-center space-x-2">
            <Users size={20} />
            <span>Friend Requests</span>
            {friendRequests.length > 0 && (
              <Badge className="bg-red-500 text-white">
                {friendRequests.length}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-96 overflow-y-auto space-y-3">
          {loading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Loading requests...
            </div>
          ) : friendRequests.length === 0 ? (
            <div className="text-center py-8">
              <Users size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                No pending requests
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Friend requests will appear here
              </p>
            </div>
          ) : (
            friendRequests.map((request) => (
              <div 
                key={request.id} 
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={request.sender?.avatarUrl || ''} />
                    <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                      {getUserInitials(request.sender?.fullName || 'Unknown User')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {request.sender?.fullName || 'Unknown User'}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {request.sender?.email || 'No email'}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {formatTime(request.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleFriendRequest(request.id, 'accept')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                  >
                    <UserCheck size={16} className="mr-1" />
                    Accept
                  </Button>
                  <Button
                    onClick={() => handleFriendRequest(request.id, 'reject')}
                    variant="outline"
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                    size="sm"
                  >
                    <UserX size={16} className="mr-1" />
                    Decline
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}