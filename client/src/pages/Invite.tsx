import { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, MessageCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';

export default function Invite() {
  const [, params] = useRoute('/invite/:userId');
  const { user: currentUser } = useAuth();
  const [inviteUser, setInviteUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  useEffect(() => {
    const fetchInviteUser = async () => {
      if (!params?.userId) return;
      
      try {
        const response = await fetch(`/api/users/${params.userId}`);
        if (response.ok) {
          const userData = await response.json();
          setInviteUser(userData);
        } else {
          console.error('Failed to fetch user');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInviteUser();
  }, [params?.userId]);

  const sendFriendRequest = async () => {
    if (!currentUser || !inviteUser) return;

    setSending(true);
    try {
      const response = await fetch('/api/friend-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          senderId: currentUser.id, 
          receiverId: inviteUser.id 
        }),
      });

      if (response.ok) {
        toast({
          title: "Friend request sent!",
          description: `You've sent a friend request to ${inviteUser.fullName}`,
        });
      } else {
        throw new Error('Failed to send friend request');
      }
    } catch (error) {
      console.error('Failed to send friend request:', error);
      toast({
        title: "Failed to send request",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (!inviteUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Invitation Not Found</CardTitle>
            <CardDescription>
              This invitation link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">You're Invited!</CardTitle>
          <CardDescription>
            {inviteUser.fullName} wants to connect with you on ChatterLite
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={inviteUser.avatarUrl || ''} />
              <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-lg">
                {getUserInitials(inviteUser.fullName)}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {inviteUser.fullName}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {inviteUser.email}
              </p>
            </div>
          </div>

          {currentUser ? (
            <div className="space-y-4">
              <Button 
                onClick={sendFriendRequest} 
                disabled={sending}
                className="w-full"
                size="lg"
              >
                {sending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Sending Request...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add {inviteUser.fullName}
                  </>
                )}
              </Button>
              
              <div className="text-center">
                <Link href="/chat">
                  <Button variant="outline" className="w-full">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Go to Chat
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Sign in to connect with {inviteUser.fullName}
              </p>
              <Link href="/">
                <Button className="w-full" size="lg">
                  Sign In to Connect
                </Button>
              </Link>
            </div>
          )}

          <div className="text-center">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}