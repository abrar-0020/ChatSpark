import { useState } from 'react';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

// Common emojis organized by category
const EMOJI_CATEGORIES = {
  'Smileys': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕'],
  'Gestures': ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🙏', '💪', '🦾'],
  'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝'],
  'Objects': ['⭐', '🌟', '✨', '💫', '🔥', '💯', '💢', '💥', '💦', '💨', '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉', '⚽', '🏀', '🏈', '⚾', '🎾', '🎮', '🎲', '🎯', '🎪'],
  'Symbols': ['✅', '❌', '❓', '❗', '💤', '💬', '👁️‍🗨️', '🗨️', '💭', '🔔', '🔕', '📢', '📣', '⚠️', '🚫', '⛔', '📛', '♻️', '✳️', '❇️', '✴️', '🔰', '🔱', '⚜️', '🔶', '🔷', '🔸', '🔹'],
};

const EmojiPicker = ({ onSelect, onClose }: EmojiPickerProps) => {
  const [activeCategory, setActiveCategory] = useState<keyof typeof EMOJI_CATEGORIES>('Smileys');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEmojis = searchQuery
    ? Object.values(EMOJI_CATEGORIES).flat().filter(() => true) // In a real app, filter by emoji name
    : EMOJI_CATEGORIES[activeCategory];

  return (
    <div 
      className="w-[352px] h-[420px] bg-neutral-850 rounded-lg shadow-xl overflow-hidden flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Search */}
      <div className="p-2 border-b border-neutral-800">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search emoji"
          className="w-full px-3 py-2 bg-neutral-900 text-white rounded text-sm
                   placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-1 p-2 border-b border-neutral-800">
        {Object.keys(EMOJI_CATEGORIES).map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category as keyof typeof EMOJI_CATEGORIES)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors
                      ${activeCategory === category 
                        ? 'bg-neutral-800 text-white' 
                        : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                      }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Emoji Grid */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-9 gap-1">
          {filteredEmojis.map((emoji, index) => (
            <button
              key={`${emoji}-${index}`}
              onClick={() => onSelect(emoji)}
              className="w-8 h-8 flex items-center justify-center text-2xl hover:bg-neutral-800 
                       rounded transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-neutral-800 flex items-center justify-between">
        <span className="text-xs text-neutral-400">
          {activeCategory}
        </span>
        <button
          onClick={onClose}
          className="text-xs text-neutral-400 hover:text-white transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default EmojiPicker;
