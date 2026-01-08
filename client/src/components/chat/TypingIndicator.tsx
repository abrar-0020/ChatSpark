import { useEffect, useState } from 'react';
import { useMessageStore, useServerStore } from '../../store';

interface TypingIndicatorProps {
  channelId: string;
}

const TypingIndicator = ({ channelId }: TypingIndicatorProps) => {
  const { typingUsers } = useMessageStore();
  const { activeServer } = useServerStore();
  const [typingUsernames, setTypingUsernames] = useState<string[]>([]);

  useEffect(() => {
    const userIds = typingUsers.get(channelId) || [];
    
    if (activeServer && userIds.length > 0) {
      const usernames = userIds
        .map(userId => {
          const member = activeServer.members.find(
            m => (m.user._id || m.user.id) === userId
          );
          return member?.user.username;
        })
        .filter(Boolean) as string[];
      
      setTypingUsernames(usernames);
    } else {
      setTypingUsernames([]);
    }
  }, [typingUsers, channelId, activeServer]);

  if (typingUsernames.length === 0) {
    return <div className="h-6 px-4" />;
  }

  const getTypingText = () => {
    if (typingUsernames.length === 1) {
      return `${typingUsernames[0]} is typing`;
    } else if (typingUsernames.length === 2) {
      return `${typingUsernames[0]} and ${typingUsernames[1]} are typing`;
    } else if (typingUsernames.length === 3) {
      return `${typingUsernames[0]}, ${typingUsernames[1]}, and ${typingUsernames[2]} are typing`;
    } else {
      return 'Several people are typing';
    }
  };

  return (
    <div className="h-6 px-4 flex items-center gap-1 text-sm text-white">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="ml-1 text-neutral-400">{getTypingText()}...</span>
    </div>
  );
};

export default TypingIndicator;
