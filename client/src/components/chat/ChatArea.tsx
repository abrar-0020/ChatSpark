import { useEffect, useRef, useState } from 'react';
import { useServerStore, useMessageStore, useAuthStore } from '../../store';
import { socketService } from '../../services';
import { Hash, Users, Bell, BellOff, Pin, Search, Inbox, HelpCircle, X, Keyboard, MessageSquare, AtSign } from 'lucide-react';
import MessageItem from './MessageItem';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import MemberList from '../members/MemberList';

const ChatArea = () => {
  const { activeChannel, activeServer } = useServerStore();
  const { messages, fetchMessages, isLoading } = useMessageStore();
  const { user } = useAuthStore();
  const [showMembers, setShowMembers] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showPinned, setShowPinned] = useState(false);
  const [showInbox, setShowInbox] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const prevChannelRef = useRef<string | null>(null);

  // Fetch messages when channel changes
  useEffect(() => {
    if (activeChannel && activeChannel._id !== prevChannelRef.current) {
      prevChannelRef.current = activeChannel._id;
      
      // Leave old channel and join new one
      socketService.joinChannel(activeChannel._id);
      fetchMessages(activeChannel._id);
      setShouldAutoScroll(true);
    }
  }, [activeChannel, fetchMessages]);

  // Auto scroll to bottom
  useEffect(() => {
    if (shouldAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, shouldAutoScroll, activeChannel]);

  // Handle scroll to detect if user scrolled up
  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldAutoScroll(isNearBottom);
    }
  };

  // Search messages
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const channelMessages = messages.get(activeChannel?._id || '') || [];
    const results = channelMessages.filter(msg => 
      msg.content.toLowerCase().includes(query.toLowerCase()) ||
      msg.author.username.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(results);
  };

  // Get pinned messages (simulated - messages with certain keywords for demo)
  const getPinnedMessages = () => {
    const channelMessages = messages.get(activeChannel?._id || '') || [];
    // For demo, consider messages containing "important" or "pin" as pinned
    return channelMessages.filter(msg => 
      msg.content.toLowerCase().includes('important') || 
      msg.content.toLowerCase().includes('announcement')
    ).slice(0, 5);
  };

  // Get mentions (messages mentioning current user)
  const getMentions = () => {
    const allMessages: any[] = [];
    messages.forEach((channelMsgs) => {
      channelMsgs.forEach(msg => {
        if (msg.content.toLowerCase().includes(`@${user?.username?.toLowerCase()}`)) {
          allMessages.push(msg);
        }
      });
    });
    return allMessages.slice(0, 10);
  };

  if (!activeChannel || !activeServer) {
    return (
      <div className="flex-1 bg-neutral-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-bold text-white mb-2">No Channel Selected</h2>
          <p className="text-neutral-400">Select a channel to start chatting</p>
        </div>
      </div>
    );
  }

  const channelMessages = messages.get(activeChannel._id) || [];

  return (
    <div className="flex-1 flex">
      {/* Main Chat Area */}
      <div className="flex-1 bg-neutral-800 flex flex-col relative">
        {/* Channel Header */}
        <div className="h-12 px-4 flex items-center justify-between border-b border-neutral-900 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-2">
            <Hash size={24} className="text-neutral-400" />
            <span className="font-semibold text-white">{activeChannel.name}</span>
            {activeChannel.description && (
              <>
                <div className="w-px h-6 bg-neutral-700 mx-2" />
                <span className="text-sm text-neutral-400 truncate max-w-xs">
                  {activeChannel.description}
                </span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {/* Mute/Unmute Notifications */}
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`transition-colors ${isMuted ? 'text-danger' : 'text-neutral-400 hover:text-white'}`}
              title={isMuted ? 'Unmute channel' : 'Mute channel'}
            >
              {isMuted ? <BellOff size={20} /> : <Bell size={20} />}
            </button>
            
            {/* Pinned Messages */}
            <button 
              onClick={() => { setShowPinned(!showPinned); setShowInbox(false); setShowHelp(false); }}
              className={`transition-colors ${showPinned ? 'text-white' : 'text-neutral-400 hover:text-white'}`}
              title="Pinned messages"
            >
              <Pin size={20} />
            </button>
            
            {/* Members Toggle */}
            <button
              onClick={() => setShowMembers(!showMembers)}
              className={`transition-colors ${showMembers ? 'text-white' : 'text-neutral-400 hover:text-white'}`}
              title="Toggle member list"
            >
              <Users size={20} />
            </button>
            
            {/* Search */}
            <div className="relative">
              <Search size={18} className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-36 pl-8 pr-2 py-1 bg-neutral-900 text-white text-sm rounded
                         placeholder-neutral-400 focus:w-48 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => handleSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            
            {/* Inbox */}
            <button 
              onClick={() => { setShowInbox(!showInbox); setShowPinned(false); setShowHelp(false); }}
              className={`transition-colors ${showInbox ? 'text-white' : 'text-neutral-400 hover:text-white'}`}
              title="Inbox"
            >
              <Inbox size={20} />
            </button>
            
            {/* Help */}
            <button 
              onClick={() => { setShowHelp(!showHelp); setShowPinned(false); setShowInbox(false); }}
              className={`transition-colors ${showHelp ? 'text-white' : 'text-neutral-400 hover:text-white'}`}
              title="Help"
            >
              <HelpCircle size={20} />
            </button>
          </div>
        </div>

        {/* Dropdown Panels */}
        {(showPinned || showInbox || showHelp || isSearching) && (
          <div className="absolute top-12 right-4 z-50 w-96 max-h-[70vh] bg-neutral-900 rounded-lg shadow-2xl border border-neutral-850 overflow-hidden">
            {/* Pinned Messages Panel */}
            {showPinned && (
              <div>
                <div className="p-4 border-b border-neutral-850 flex items-center justify-between">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Pin size={18} /> Pinned Messages
                  </h3>
                  <button onClick={() => setShowPinned(false)} className="text-neutral-400 hover:text-white">
                    <X size={18} />
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto p-2">
                  {getPinnedMessages().length === 0 ? (
                    <div className="text-center py-8">
                      <Pin size={40} className="mx-auto text-neutral-700 mb-2" />
                      <p className="text-neutral-400">No pinned messages yet</p>
                      <p className="text-neutral-700 text-sm">Pin important messages to find them later</p>
                    </div>
                  ) : (
                    getPinnedMessages().map(msg => (
                      <div key={msg._id} className="p-3 hover:bg-neutral-900 rounded-lg mb-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium text-sm">{msg.author.username}</span>
                          <span className="text-neutral-700 text-xs">
                            {new Date(msg.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-neutral-400 text-sm">{msg.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Inbox Panel */}
            {showInbox && (
              <div>
                <div className="p-4 border-b border-neutral-850 flex items-center justify-between">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Inbox size={18} /> Inbox
                  </h3>
                  <button onClick={() => setShowInbox(false)} className="text-neutral-400 hover:text-white">
                    <X size={18} />
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-neutral-400 mb-4">
                      <AtSign size={16} />
                      <span className="font-medium">Mentions</span>
                    </div>
                    {getMentions().length === 0 ? (
                      <div className="text-center py-6">
                        <MessageSquare size={40} className="mx-auto text-neutral-700 mb-2" />
                        <p className="text-neutral-400">No mentions</p>
                        <p className="text-neutral-700 text-sm">When someone @mentions you, it'll show here</p>
                      </div>
                    ) : (
                      getMentions().map(msg => (
                        <div key={msg._id} className="p-3 hover:bg-neutral-900 rounded-lg mb-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-medium text-sm">{msg.author.username}</span>
                            <span className="text-neutral-700 text-xs">
                              {new Date(msg.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-neutral-400 text-sm">{msg.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Help Panel */}
            {showHelp && (
              <div>
                <div className="p-4 border-b border-neutral-850 flex items-center justify-between">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <HelpCircle size={18} /> Help & Shortcuts
                  </h3>
                  <button onClick={() => setShowHelp(false)} className="text-neutral-400 hover:text-white">
                    <X size={18} />
                  </button>
                </div>
                <div className="p-4 max-h-80 overflow-y-auto">
                  <div className="mb-4">
                    <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                      <Keyboard size={16} /> Keyboard Shortcuts
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Send message</span>
                        <kbd className="bg-neutral-950 px-2 py-1 rounded text-xs text-white">Enter</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">New line</span>
                        <kbd className="bg-neutral-950 px-2 py-1 rounded text-xs text-white">Shift + Enter</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Toggle members</span>
                        <span className="text-neutral-700">Click 👥 icon</span>
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <h4 className="text-white font-medium mb-2">Formatting</h4>
                    <div className="space-y-2 text-sm text-neutral-400">
                      <p><code className="bg-neutral-950 px-1 rounded">**bold**</code> → <strong className="text-white">bold</strong></p>
                      <p><code className="bg-neutral-950 px-1 rounded">*italic*</code> → <em className="text-white">italic</em></p>
                      <p><code className="bg-neutral-950 px-1 rounded">~~strikethrough~~</code> → <s className="text-white">strikethrough</s></p>
                      <p><code className="bg-neutral-950 px-1 rounded">`code`</code> → <code className="text-white bg-neutral-950 px-1 rounded">code</code></p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-2">Features</h4>
                    <ul className="text-sm text-neutral-400 space-y-1">
                      <li>• Create and join servers</li>
                      <li>• Real-time messaging</li>
                      <li>• Emoji support 😊</li>
                      <li>• File attachments</li>
                      <li>• Typing indicators</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Search Results Panel */}
            {isSearching && !showPinned && !showInbox && !showHelp && (
              <div>
                <div className="p-4 border-b border-neutral-850 flex items-center justify-between">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Search size={18} /> Search Results
                  </h3>
                  <button onClick={() => handleSearch('')} className="text-neutral-400 hover:text-white">
                    <X size={18} />
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto p-2">
                  {searchResults.length === 0 ? (
                    <div className="text-center py-8">
                      <Search size={40} className="mx-auto text-neutral-700 mb-2" />
                      <p className="text-neutral-400">No results found</p>
                      <p className="text-neutral-700 text-sm">Try a different search term</p>
                    </div>
                  ) : (
                    searchResults.map(msg => (
                      <div key={msg._id} className="p-3 hover:bg-neutral-900 rounded-lg mb-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium text-sm">{msg.author.username}</span>
                          <span className="text-neutral-700 text-xs">
                            {new Date(msg.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-neutral-400 text-sm">{msg.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Messages Area */}
        <div
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto"
        >
          {/* Channel Welcome */}
          <div className="px-4 pt-6 pb-4">
            <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mb-4">
              <Hash size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome to #{activeChannel.name}!
            </h1>
            <p className="text-neutral-400">
              This is the start of the #{activeChannel.name} channel.
              {activeChannel.description && ` ${activeChannel.description}`}
            </p>
          </div>

          {/* Messages */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="spinner" />
            </div>
          ) : (
            <div className="px-4 pb-4">
              {channelMessages.map((message, index) => {
                const prevMessage = index > 0 ? channelMessages[index - 1] : null;
                const showAvatar = !prevMessage || 
                  (prevMessage.author._id || prevMessage.author.id) !== (message.author._id || message.author.id) ||
                  new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() > 420000; // 7 minutes

                return (
                  <MessageItem
                    key={message._id}
                    message={message}
                    showAvatar={showAvatar}
                    isOwn={(message.author._id || message.author.id) === (user?._id || user?.id)}
                  />
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Typing Indicator */}
        <TypingIndicator channelId={activeChannel._id} />

        {/* Message Input */}
        <MessageInput channelId={activeChannel._id} channelName={activeChannel.name} />
      </div>

      {/* Members Sidebar */}
      {showMembers && <MemberList />}
    </div>
  );
};

export default ChatArea;
