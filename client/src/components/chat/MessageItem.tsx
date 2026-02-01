import { useState, useCallback } from 'react';
import { Message } from '../../types';
import { useMessageStore, useAuthStore } from '../../store';
import { socketService } from '../../services';
import { Trash2, MoreHorizontal, Smile } from 'lucide-react';
import EmojiPicker from './EmojiPicker';
import UserProfileModal from '../profile/UserProfileModal';

interface MessageItemProps {
  message: Message;
  showAvatar: boolean;
  isOwn: boolean;
}

const MessageItem = ({ message, showAvatar, isOwn }: MessageItemProps) => {
  const [showActions, setShowActions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const { deleteMessage } = useMessageStore();
  const { user } = useAuthStore();

  // Get author info - handle both populated and unpopulated author
  const authorName = typeof message.author === 'object' 
    ? (message.author.username || 'Unknown User')
    : 'Unknown User';
  const authorAvatar = typeof message.author === 'object' 
    ? message.author.avatar 
    : null;
  const authorInitial = authorName[0]?.toUpperCase() || '?';

  // Generate a consistent color based on username
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
      'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
      'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
      'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const avatarColor = getAvatarColor(authorName);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === date.toDateString();

    const time = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });

    if (isToday) {
      return `Today at ${time}`;
    } else if (isYesterday) {
      return `Yesterday at ${time}`;
    } else {
      return `${date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })} ${time}`;
    }
  };

  const handleDelete = useCallback(() => {
    if (confirm('Are you sure you want to delete this message?')) {
      socketService.deleteMessage(message._id);
      deleteMessage(message.channel, message._id);
    }
    setShowActions(false);
  }, [message._id, message.channel, deleteMessage]);

  // Parse message content for emoji
  const renderContent = (content: string) => {
    // Simple emoji pattern - could be enhanced with emoji library
    const emojiPattern = /:[a-zA-Z0-9_]+:/g;
    const parts = content.split(emojiPattern);
    const emojis = content.match(emojiPattern) || [];
    
    return content;
  };

  const canDelete = isOwn;

  if (showAvatar) {
    return (
      <div
        className="message-container relative flex gap-4 py-2 px-4 mt-4 hover:bg-neutral-800/50 group transition-colors"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => {
          setShowActions(false);
          setShowEmojiPicker(false);
        }}
      >
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div 
            className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center cursor-pointer hover:opacity-80 shadow-md`}
            onClick={() => setShowUserProfile(true)}
          >
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-bold text-sm">
                {authorInitial}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span 
              className={`font-semibold ${isOwn ? 'text-primary' : 'text-white'} hover:underline cursor-pointer`}
              onClick={() => setShowUserProfile(true)}
            >
              {authorName}
            </span>
            <span className="text-xs text-neutral-500">
              {formatTime(message.createdAt)}
            </span>
            {message.edited && (
              <span className="text-xs text-neutral-500 italic">(edited)</span>
            )}
          </div>
          <div className="text-neutral-200 break-words whitespace-pre-wrap leading-relaxed">
            {renderContent(message.content)}
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="absolute -top-4 right-4 flex items-center gap-0.5 bg-neutral-850 rounded border border-neutral-800 shadow-lg">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <Smile size={18} />
            </button>
            {canDelete && (
              <button
                onClick={handleDelete}
                className="p-1.5 text-danger hover:text-white hover:bg-danger transition-colors"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
              <MoreHorizontal size={18} />
            </button>
          </div>
        )}

        {showEmojiPicker && (
          <div className="absolute right-0 top-8 z-50">
            <EmojiPicker
              onSelect={(emoji) => {
                // In a full implementation, this would add a reaction
                console.log('Emoji selected:', emoji);
                setShowEmojiPicker(false);
              }}
              onClose={() => setShowEmojiPicker(false)}
            />
          </div>
        )}

        {/* User Profile Modal */}
        {showUserProfile && typeof message.author === 'object' && (
          <UserProfileModal
            user={message.author}
            onClose={() => setShowUserProfile(false)}
          />
        )}
      </div>
    );
  }

  // Compact message (same author, within time window)
  return (
    <div
      className="message-container relative flex gap-4 py-0.5 px-4 hover:bg-neutral-800/50 group transition-colors"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowEmojiPicker(false);
      }}
    >
      {/* Timestamp placeholder */}
      <div className="w-10 flex-shrink-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] text-neutral-500">
          {new Date(message.createdAt).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          })}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-neutral-200 break-words whitespace-pre-wrap leading-relaxed">
          {renderContent(message.content)}
          {message.edited && (
            <span className="text-xs text-neutral-500 ml-1 italic">(edited)</span>
          )}
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="absolute -top-4 right-4 flex items-center gap-0.5 bg-neutral-850 rounded border border-neutral-800 shadow-lg">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <Smile size={18} />
          </button>
          {canDelete && (
            <button
              onClick={handleDelete}
              className="p-1.5 text-danger hover:text-white hover:bg-danger transition-colors"
            >
              <Trash2 size={18} />
            </button>
          )}
          <button className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
            <MoreHorizontal size={18} />
          </button>
        </div>
      )}

      {/* User Profile Modal */}
      {showUserProfile && typeof message.author === 'object' && (
        <UserProfileModal
          user={message.author}
          onClose={() => setShowUserProfile(false)}
        />
      )}
    </div>
  );
};

export default MessageItem;
