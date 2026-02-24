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
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
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

  const sendGif = (gifText: string) => {
    sendMessage(channelId, gifText);
    setShowGifPicker(false);
    stopTypingIndicator();
  };

  const sendSticker = (stickerText: string) => {
    sendMessage(channelId, stickerText);
    setShowStickerPicker(false);
    stopTypingIndicator();
  };

  return (
    <div className="px-4 pb-6 relative">
      <div className="bg-neutral-800 rounded-lg flex items-end overflow-hidden">
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
          <div className="relative hidden md:block">
            
            {showGifPicker && (
              <div className="absolute bottom-full right-0 mb-2 bg-neutral-900 border border-neutral-800 rounded-lg p-4 w-72 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">Popular GIFs</h3>
                  <button onClick={() => setShowGifPicker(false)} className="text-neutral-400 hover:text-white">×</button>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {['🎉 Party!', '👍 Thumbs Up', '❤️ Love', '😂 LOL', '🔥 Fire', '⭐ Awesome'].map((gif) => (
                    <button
                      key={gif}
                      onClick={() => sendGif(gif)}
                      className="bg-neutral-800 hover:bg-neutral-700 p-3 rounded text-white text-sm transition-colors"
                    >
                      {gif}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="relative hidden md:block">
            
            {showStickerPicker && (
              <div className="absolute bottom-full right-0 mb-2 bg-neutral-900 border border-neutral-800 rounded-lg p-4 w-72 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">Stickers</h3>
                  <button onClick={() => setShowStickerPicker(false)} className="text-neutral-400 hover:text-white">×</button>
                </div>
                <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                  {['😀', '😂', '🥰', '😎', '🤔', '😴', '🎉', '❤️', '👍', '🔥', '⭐', '✨', '🚀', '💯', '👋', '🙌'].map((sticker) => (
                    <button
                      key={sticker}
                      onClick={() => sendSticker(sticker)}
                      className="bg-neutral-800 hover:bg-neutral-700 p-3 rounded text-3xl transition-colors hover:scale-110"
                    >
                      {sticker}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="relative">
            <button
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
                setShowGifPicker(false);
                setShowStickerPicker(false);
              }}
              className="p-1.5 text-neutral-400 hover:text-white transition-colors"
              title="Add emoji"
            >
              <Smile size={22} />
            </button>
            
            {showEmojiPicker && (
              <div className="fixed bottom-20 left-2 right-2 z-50 md:absolute md:bottom-full md:left-auto md:right-0 md:w-auto">
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
