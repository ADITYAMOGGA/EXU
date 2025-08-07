import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, UserPlus, QrCode, Mail, Phone, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface AddFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddFriendsModal({ isOpen, onClose }: AddFriendsModalProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('search');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    setLoading(true);
    try {
      console.log('Searching for:', searchQuery);
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery.trim())}`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }
      
      const users = await response.json();
      console.log('Search results:', users);
      
      // Filter out current user if they exist in results
      const filteredUsers = Array.isArray(users) ? users.filter((u: any) => u.id !== user?.id) : [];
      setSearchResults(filteredUsers);
      
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Clear results when search query is empty
  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value);
    if (!value.trim()) {
      setSearchResults([]);
    }
  };

  const sendFriendRequest = async (userId: string) => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/friend-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          senderId: user.id,
          receiverId: userId 
        }),
      });
      
      if (response.ok) {
        // Update UI to show request sent
        setSearchResults(prev => 
          prev.map(searchUser => 
            searchUser.id === userId 
              ? { ...searchUser, friendRequestSent: true }
              : searchUser
          )
        );
      }
    } catch (error) {
      console.error('Failed to send friend request:', error);
    }
  };

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/invite/${user?.id}`;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaEmail = () => {
    const subject = "Join me on ChatterLite!";
    const body = `Hey! I'm using ChatterLite for messaging. Join me here: ${window.location.origin}/invite/${user?.id}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 text-center">
            Add Friends
          </DialogTitle>
        </DialogHeader>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search" className="text-xs">
              <Search size={14} className="mr-1" />
              Search
            </TabsTrigger>
            <TabsTrigger value="invite" className="text-xs">
              <UserPlus size={14} className="mr-1" />
              Invite
            </TabsTrigger>
            <TabsTrigger value="qr" className="text-xs">
              <QrCode size={14} className="mr-1" />
              QR Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={(e) => handleSearchQueryChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button 
                onClick={handleSearch} 
                disabled={loading}
                className="px-3"
              >
                <Search size={16} />
              </Button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {loading ? (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  Searching...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  {searchQuery ? 'No users found' : 'Start typing to search for friends'}
                </div>
              ) : (
                searchResults.map((foundUser) => (
                  <div key={foundUser.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={foundUser.avatarUrl || ''} />
                        <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                          {getUserInitials(foundUser.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {foundUser.fullName}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {foundUser.email}
                        </p>
                      </div>
                    </div>
                    {foundUser.friendRequestSent ? (
                      <Badge variant="secondary" className="text-xs">
                        Request Sent
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => sendFriendRequest(foundUser.id)}
                        className="text-xs"
                      >
                        <UserPlus size={14} className="mr-1" />
                        Add
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="invite" className="space-y-4">
            <div className="text-center space-y-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Share your invite link with friends
              </div>
              
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <code className="text-xs text-gray-600 dark:text-gray-400 break-all flex-1 min-w-0">
                    {window.location.origin}/invite/{user?.id}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={copyInviteLink}
                    className="p-2 shrink-0"
                    title={copied ? "Copied!" : "Copy invite link"}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button onClick={shareViaEmail} variant="outline" className="flex items-center justify-center space-x-2">
                  <Mail size={16} />
                  <span>Email</span>
                </Button>
                <Button 
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Join me on ChatterLite!',
                        url: `${window.location.origin}/invite/${user?.id}`
                      });
                    }
                  }}
                  variant="outline" 
                  className="flex items-center justify-center space-x-2"
                >
                  <Phone size={16} />
                  <span>Share</span>
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="qr" className="space-y-4">
            <div className="text-center space-y-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Let friends scan your QR code
              </div>
              
              <div className="flex justify-center">
                <div className="w-48 h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <QrCode size={64} className="mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      QR Code will be generated here
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                Friends can scan this code with their camera to add you instantly
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}