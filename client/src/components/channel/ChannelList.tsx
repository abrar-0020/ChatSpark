import { useState } from 'react';
import { useServerStore, useAuthStore } from '../../store';
import { Hash, Plus, Settings, ChevronDown, ChevronRight, UserPlus, Trash2, LogOut, Copy, Search } from 'lucide-react';
import { useMobileNav } from '../../App';
import CreateChannelModal from './CreateChannelModal';
import InviteModal from '../server/InviteModal';

const ChannelList = () => {
  const { activeServer, activeChannel, setActiveChannel, leaveServer, deleteServer } = useServerStore();
  const { user } = useAuthStore();
  const { panel, setPanel } = useMobileNav();
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showServerMenu, setShowServerMenu] = useState(false);
  const [isTextExpanded, setIsTextExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  if (!activeServer) {
    return (
      <div className={`${panel === 'chat' ? 'hidden' : 'flex flex-1'} md:flex md:w-72 md:flex-none bg-neutral-950 flex-col border-r border-neutral-800 pb-14 md:pb-0`}>
        <div className="h-14 px-5 flex items-center border-b border-neutral-800 bg-neutral-900/60">
          <span className="font-semibold text-white">Direct Messages</span>
        </div>
        <div className="px-4 py-3 border-b border-neutral-800">
          <div className="flex items-center gap-2 bg-neutral-900 rounded-lg px-3 py-2 border border-neutral-800">
            <Search size={14} className="text-neutral-500 flex-shrink-0" />
            <input
              type="text"
              placeholder="Find or start a conversation"
              className="bg-transparent text-sm text-white placeholder-neutral-500 flex-1 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center max-w-xs">
            <div className="w-12 h-12 bg-neutral-800 rounded-xl flex items-center justify-center mx-auto mb-3 border border-neutral-700">
              <Hash size={24} className="text-neutral-500" />
            </div>
            <p className="text-neutral-400 text-sm">Select a server to view channels</p>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = activeServer.owner._id === (user?._id || user?.id);
  const member = activeServer.members.find(
    m => (m.user._id || m.user.id) === (user?._id || user?.id)
  );
  const isAdmin = member?.role === 'admin' || isOwner;

  const handleLeaveServer = async () => {
    if (confirm('Are you sure you want to leave this server?')) {
      try {
        await leaveServer(activeServer._id);
      } catch (error) {
        console.error('Failed to leave server:', error);
      }
    }
    setShowServerMenu(false);
  };

  const handleDeleteServer = async () => {
    if (confirm('Are you sure you want to delete this server? This action cannot be undone.')) {
      try {
        await deleteServer(activeServer._id);
      } catch (error) {
        console.error('Failed to delete server:', error);
      }
    }
    setShowServerMenu(false);
  };

  return (
    <>
      <div className={`${panel === 'chat' ? 'hidden' : 'flex flex-1'} md:flex md:w-72 md:flex-none bg-neutral-950 flex-col border-r border-neutral-800 pb-14 md:pb-0`}>
        <div className="relative">
          <button
            onClick={() => setShowServerMenu(!showServerMenu)}
            className="w-full h-14 px-5 flex items-center justify-between border-b border-neutral-800 bg-neutral-900/60 hover:bg-neutral-900 transition-colors"
          >
            <div className="flex flex-col items-start text-left min-w-0">
              <span className="font-semibold text-white truncate">{activeServer.name}</span>
              <span className="text-[11px] text-neutral-500 truncate">Premium Tier Workspace</span>
            </div>
            <ChevronDown size={18} className={`text-neutral-400 transition-transform ${showServerMenu ? 'rotate-180' : ''}`} />
          </button>

          {showServerMenu && (
            <div className="absolute top-16 left-2 right-2 bg-neutral-800 rounded-xl shadow-hard z-50 overflow-hidden border border-neutral-700">
              <button
                onClick={() => {
                  setShowInviteModal(true);
                  setShowServerMenu(false);
                }}
                className="w-full px-4 py-2.5 text-left text-primary hover:bg-primary/10
                         flex items-center gap-3 transition-colors font-medium"
              >
                <UserPlus size={18} />
                Invite People
              </button>

              {isAdmin && (
                <button
                  onClick={() => {
                    setShowChannelModal(true);
                    setShowServerMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-neutral-300 hover:bg-neutral-700 hover:text-white
                           flex items-center gap-3 transition-colors font-medium"
                >
                  <Plus size={18} />
                  Create Channel
                </button>
              )}

              <button
                onClick={() => {
                  navigator.clipboard.writeText(activeServer.inviteCode);
                  setShowServerMenu(false);
                }}
                className="w-full px-4 py-2.5 text-left text-neutral-300 hover:bg-neutral-700 hover:text-white
                         flex items-center gap-3 transition-colors font-medium"
              >
                <Copy size={18} />
                Copy Invite Code
              </button>

              <div className="h-px bg-neutral-700 my-1" />

              {isOwner ? (
                <button
                  onClick={handleDeleteServer}
                  className="w-full px-4 py-2.5 text-left text-danger hover:bg-danger/10
                           flex items-center gap-3 transition-colors font-medium"
                >
                  <Trash2 size={18} />
                  Delete Server
                </button>
              ) : (
                <button
                  onClick={handleLeaveServer}
                  className="w-full px-4 py-2.5 text-left text-danger hover:bg-danger/10
                           flex items-center gap-3 transition-colors font-medium"
                >
                  <LogOut size={18} />
                  Leave Server
                </button>
              )}
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-b border-neutral-800">
          <div className="flex items-center gap-2 bg-neutral-900 rounded-lg px-3 py-2 border border-neutral-800">
            <Search size={14} className="text-neutral-500 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-white placeholder-neutral-500 flex-1 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pt-4">
          <div className="px-3">
            <button
              onClick={() => setIsTextExpanded(!isTextExpanded)}
              className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 uppercase tracking-wider hover:text-neutral-200 transition-colors mb-2 px-1"
            >
              {isTextExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              Channels
              {isAdmin && (
                <Plus
                  size={16}
                  className="ml-auto hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowChannelModal(true);
                  }}
                />
              )}
            </button>

            {isTextExpanded && (
              <div className="space-y-1">
                {activeServer.channels
                  .filter(channel => channel.type === 'text')
                  .filter(channel => !searchQuery || channel.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((channel) => (
                    <button
                      key={channel._id}
                      onClick={() => { setActiveChannel(channel); setPanel('chat'); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg group transition-all ${activeChannel?._id === channel._id ? 'bg-primary/10 text-white border-l-2 border-primary' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'}`}
                    >
                      <Hash size={18} className="flex-shrink-0" />
                      <span className="truncate text-sm font-medium flex-1 text-left">{channel.name}</span>
                      {isAdmin && <Settings size={16} className="opacity-0 group-hover:opacity-100 hover:text-primary transition-all" />}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>

        <div className="h-16 bg-neutral-900 border-t border-neutral-800 px-3 hidden md:flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white text-sm font-semibold">
                  {user?.username?.[0]?.toUpperCase()}
                </span>
              )}
            </div>
            <div
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-neutral-900
                        ${user?.status === 'online' ? 'bg-success' :
                          user?.status === 'idle' ? 'bg-warning' :
                          user?.status === 'dnd' ? 'bg-danger' : 'bg-neutral-500'
                        }`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.username}</p>
            <p className="text-xs text-neutral-400 capitalize">{user?.status}</p>
          </div>
        </div>
      </div>

      {showChannelModal && (
        <CreateChannelModal
          serverId={activeServer._id}
          onClose={() => setShowChannelModal(false)}
        />
      )}

      {showInviteModal && (
        <InviteModal
          serverId={activeServer._id}
          serverName={activeServer.name}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </>
  );
};

export default ChannelList;
