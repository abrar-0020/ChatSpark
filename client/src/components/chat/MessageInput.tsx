import { useState, useRef, useCallback, KeyboardEvent } from 'react';
import { useMessageStore } from '../../store';
import { PlusCircle, Gift, Sticker, Smile, Send } from 'lucide-react';
import { useTypingIndicator } from '../../hooks';
import EmojiPicker from './EmojiPicker';

interface MessageInputProps {
  channelId: string;
  channelName: string;
}

const MessageInput = ({ channelId, channelName }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, startTyping, stopTyping } = useMessageStore();

  const { handleTyping, stopTyping: stopTypingIndicator } = useTypingIndicator(
    () => startTyping(channelId),
    () => stopTyping(channelId),
    2000
  );

  const handleSend = useCallback(() => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || !channelId) {
      console.log('[MessageInput] Cannot send:', { trimmedMessage, channelId });
      return;
    }

    console.log('[MessageInput] Sending message:', { channelId, trimmedMessage });
    sendMessage(channelId, trimmedMessage);
    setMessage('');
    stopTypingIndicator();
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [message, channelId, sendMessage, stopTypingIndicator]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    handleTyping();

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const insertEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="px-4 pb-6 relative">
      <div className="bg-neutral-800 rounded-lg flex items-end">
        {/* Attachment Button */}
        <button className="p-3 text-neutral-400 hover:text-white transition-colors">
          <PlusCircle size={24} />
        </button>

        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={`Message #${channelName}`}
          rows={1}
          className="flex-1 py-3 bg-transparent text-white placeholder-neutral-400 
                   resize-none max-h-[200px] focus:outline-none"
        />

        {/* Action Buttons */}
        <div className="flex items-center gap-1 p-2">
          <button className="p-1.5 text-neutral-400 hover:text-white transition-colors">
            <Gift size={22} />
          </button>
          <button className="p-1.5 text-neutral-400 hover:text-white transition-colors">
            <Sticker size={22} />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1.5 text-neutral-400 hover:text-white transition-colors"
            >
              <Smile size={22} />
            </button>
            
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2">
                <EmojiPicker
                  onSelect={insertEmoji}
                  onClose={() => setShowEmojiPicker(false)}
                />
              </div>
            )}
          </div>
          
          {message.trim() && (
            <button
              onClick={handleSend}
              className="p-1.5 text-primary hover:text-primary-hover transition-colors"
            >
              <Send size={22} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
