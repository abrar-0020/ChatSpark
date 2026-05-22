import { useEffect, useState, useRef } from 'react';
import { useServerStore, useAuthStore, useNotificationStore } from '../../store';
import { Plus, Compass, LogOut, User as UserIcon, Bell } from 'lucide-react';
import { useMobileNav } from '../../App';
import CreateServerModal from './CreateServerModal';
import JoinServerModal from './JoinServerModal';
import ProfileModal from '../profile/ProfileModal';

const ServerList = () => {
  const { servers, activeServer, setActiveServer, fetchServers } = useServerStore();
  const { user, logout } = useAuthStore();
  const { panel, setPanel } = useMobileNav();
  const { openPanel, unreadCount } = useNotificationStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchServers();
    }
  }, [fetchServers]);

  const getServerInitial = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      <aside className={`${panel === 'chat' ? 'hidden md:flex' : 'flex'} w-16 flex-shrink-0 bg-neutral-950 border-r border-neutral-800 z-20 flex-col items-center py-4 hidden md:flex`}>
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-6 cursor-pointer hover:bg-primary-hover transition-colors shadow-glow">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="w-8 h-px bg-neutral-700 rounded-full mb-6" />

        <div className="flex flex-col gap-4 items-center flex-grow overflow-y-auto w-full px-2">
          <button
            className={`w-12 h-12 rounded-xl transition-all duration-200 flex items-center justify-center ${!activeServer ? 'bg-primary text-white shadow-glow' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'}`}
            onClick={() => { setActiveServer(null); setPanel('channels'); }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-current">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {servers.map((server) => (
            <div key={server._id} className="relative group w-full flex justify-center">
              <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-primary rounded-r-full transition-all duration-200 ${activeServer?._id === server._id ? 'h-8' : 'h-0 group-hover:h-4'}`} />
              <button
                onClick={() => { setActiveServer(server); setPanel('channels'); }}
                className={`w-12 h-12 rounded-xl transition-all duration-200 flex items-center justify-center text-white font-semibold text-sm overflow-hidden ${activeServer?._id === server._id ? 'bg-primary shadow-glow' : 'bg-neutral-800 hover:bg-neutral-700 hover:rounded-lg'}`}
                title={server.name}
              >
                {server.icon ? <img src={server.icon} alt={server.name} className="w-full h-full object-cover" /> : <span>{getServerInitial(server.name)}</span>}
              </button>

              <div className="absolute left-20 top-1/2 -translate-y-1/2 z-50 hidden group-hover:block pointer-events-none">
                <div className="bg-neutral-800 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-hard border border-neutral-700">
                  {server.name}
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={() => setShowCreateModal(true)}
            className="w-12 h-12 rounded-xl transition-all duration-200 flex items-center justify-center bg-neutral-800 text-success hover:bg-success hover:text-white hover:rounded-lg group shadow-sm"
            title="Add a Server"
          >
            <Plus size={22} className="group-hover:scale-110 transition-transform" />
          </button>

          <button
            onClick={() => setShowJoinModal(true)}
            className="w-12 h-12 rounded-xl transition-all duration-200 flex items-center justify-center bg-neutral-800 text-accent hover:bg-accent hover:text-white hover:rounded-lg group shadow-sm"
            title="Join a Server"
          >
            <Compass size={22} className="group-hover:scale-110 transition-transform" />
          </button>

          <div className="flex-1" />

          <div className="relative hidden md:block mb-2">
            <button
              onClick={openPanel}
              className="w-12 h-12 rounded-xl flex items-center justify-center bg-neutral-800 text-neutral-400 hover:bg-primary hover:text-white hover:rounded-lg transition-all shadow-sm"
              title="Notifications"
            >
              <Bell size={20} />
            </button>
            {unreadCount() > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1 pointer-events-none">
                {unreadCount() > 99 ? '99+' : unreadCount()}
              </span>
            )}
          </div>

          <div className="relative hidden md:block">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center hover:ring-2 hover:ring-primary transition-all border-2 border-neutral-700 overflow-hidden"
              title={user?.username}
            >
              {user?.avatar ? <img src={user.avatar} alt={user.username} className="w-full h-full rounded-full object-cover" /> : <span className="text-white font-semibold">{user?.username?.[0]?.toUpperCase()}</span>}
            </button>

            {showMenu && (
              <div className="fixed bottom-24 left-2 w-64 bg-neutral-800 rounded-xl shadow-hard overflow-hidden z-[9999] border border-neutral-700">
                <div className="p-4 bg-primary">
                  <div className="w-16 h-16 mx-auto rounded-full bg-neutral-900/50 flex items-center justify-center mb-3 overflow-hidden border-2 border-white/20">
                    {user?.avatar ? <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" /> : <span className="text-white text-2xl font-semibold">{user?.username?.[0]?.toUpperCase()}</span>}
                  </div>
                  <p className="text-white font-semibold text-center text-base">{user?.username}</p>
                  {user?.customStatus && <p className="text-white/80 text-center text-xs mt-1">{user.customStatus}</p>}
                </div>
                <div className="p-4 border-b border-neutral-700 bg-neutral-850">
                  <p className="text-neutral-400 text-xs font-medium uppercase tracking-wide mb-1">Email</p>
                  <p className="text-neutral-200 text-sm truncate">{user?.email}</p>
                  {user?.aboutMe && (
                    <div className="mt-3">
                      <p className="text-neutral-400 text-xs font-medium uppercase tracking-wide mb-1">About Me</p>
                      <p className="text-neutral-200 text-sm line-clamp-2">{user.aboutMe}</p>
                    </div>
                  )}
                </div>
                <button onClick={() => { setShowProfileModal(true); setShowMenu(false); }} className="w-full px-4 py-3 text-left text-neutral-300 hover:bg-neutral-700 hover:text-white flex items-center gap-3 transition-colors">
                  <UserIcon size={18} />
                  <span className="font-medium">Edit Profile</span>
                </button>
                <button onClick={handleLogout} className="w-full px-4 py-3 text-left text-danger hover:bg-danger/10 flex items-center gap-3 transition-colors border-t border-neutral-700">
                  <LogOut size={18} />
                  <span className="font-medium">Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {showCreateModal && (
        <CreateServerModal onClose={() => setShowCreateModal(false)} />
      )}
      
      {showJoinModal && (
        <JoinServerModal onClose={() => setShowJoinModal(false)} />
      )}

      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} />
      )}
    </>
  );
};

export default ServerList;
