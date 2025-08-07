import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Download, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: {
    id: string;
    content: string | null;
    messageType: string;
    fileUrl: string | null;
    fileName: string | null;
    fileSize: number | null;
    createdAt: string;
    senderId: string;
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
  };
  onReact: (messageId: string, emoji: string) => void;
}

export function MessageBubble({ message, onReact }: MessageBubbleProps) {
  const { user } = useAuth();
  const isOwn = message.senderId === user?.id;

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const quickReactions = ['👍', '❤️', '😄', '😢', '😮'];

  return (
    <div className={cn(
      "flex items-start space-x-2 group",
      isOwn ? "justify-end" : "justify-start"
    )}>
      {!isOwn && (
        <Avatar className="w-8 h-8 mt-1 flex-shrink-0">
          <AvatarImage src={message.sender.avatarUrl || ''} />
          <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs">
            {getUserInitials(message.sender.fullName)}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn(
        "max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg message-bubble",
        isOwn && "order-first",
        isOwn ? "message-enter-own" : "message-enter-other"
      )}>
        <div className={cn(
          "rounded-2xl p-3 shadow-sm mobile-friendly",
          isOwn 
            ? "bg-gradient-to-r from-indigo-500 to-purple-600 rounded-tr-md" 
            : "bg-white dark:bg-gray-800 rounded-tl-md"
        )}>
          {message.messageType === 'image' && message.fileUrl && (
            <img
              src={message.fileUrl}
              alt={message.fileName || 'Shared image'}
              className="rounded-xl w-full h-auto mb-2 max-w-sm"
            />
          )}

          {message.messageType === 'file' && message.fileUrl && (
            <div className={cn(
              "flex items-center space-x-3 rounded-lg p-2 mb-2",
              isOwn ? "bg-white bg-opacity-20" : "bg-gray-100 dark:bg-gray-700"
            )}>
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                isOwn ? "bg-white bg-opacity-30" : "bg-gray-200 dark:bg-gray-600"
              )}>
                <Download className={cn(
                  "w-5 h-5",
                  isOwn ? "text-white" : "text-gray-600 dark:text-gray-300"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-medium text-sm truncate",
                  isOwn ? "text-white" : "text-gray-900 dark:text-gray-100"
                )}>
                  {message.fileName}
                </p>
                <p className={cn(
                  "text-xs",
                  isOwn ? "text-white opacity-80" : "text-gray-500 dark:text-gray-400"
                )}>
                  {message.fileSize ? formatFileSize(message.fileSize) : ''}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "p-1",
                  isOwn 
                    ? "text-white hover:bg-white hover:bg-opacity-20" 
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                )}
                onClick={() => window.open(message.fileUrl!, '_blank')}
              >
                <Download size={16} />
              </Button>
            </div>
          )}

          {message.content && (
            <p className={cn(
              isOwn ? "text-white" : "text-gray-800 dark:text-gray-200"
            )}>
              {message.content}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-1 px-2">
          {!isOwn && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
              {quickReactions.map((emoji) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  className="text-lg p-1 h-8 w-8 hover:scale-125 transition-transform"
                  onClick={() => onReact(message.id, emoji)}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          )}

          <div className={cn(
            "flex items-center space-x-1",
            !isOwn && "order-first"
          )}>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatTime(message.createdAt)}
            </span>
            {message.reactions && message.reactions.length > 0 && (
              <div className="flex space-x-1">
                {message.reactions.map((reaction) => (
                  <Badge
                    key={reaction.emoji}
                    variant="secondary"
                    className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-full cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900/50"
                    onClick={() => onReact(message.id, reaction.emoji)}
                  >
                    {reaction.emoji} {reaction.count}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {isOwn && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
              {quickReactions.map((emoji) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  className="text-lg p-1 h-8 w-8 hover:scale-125 transition-transform"
                  onClick={() => onReact(message.id, emoji)}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
