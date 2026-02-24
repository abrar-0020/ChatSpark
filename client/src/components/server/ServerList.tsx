import { useEffect, useState, useRef } from 'react';
import { useServerStore, useAuthStore } from '../../store';
import { Plus, Compass, Download, LogOut, User as UserIcon } from 'lucide-react';
import { useMobileNav } from '../../App';
import InstallPWA from '../InstallPWA';
import CreateServerModal from './CreateServerModal';
import JoinServerModal from './JoinServerModal';
import ProfileModal from '../profile/ProfileModal';

const ServerList = () => {
  const { servers, activeServer, setActiveServer, fetchServers } = useServerStore();
  const { user, logout } = useAuthStore();
  const { panel, setPanel } = useMobileNav();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showInstall, setShowInstall] = useState(false);
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
      <div className={`${panel !== 'servers' ? 'hidden md:flex' : 'flex'} w-20 bg-neutral-850 flex-col items-center py-4 gap-3 border-r border-neutral-800`}>
        {/* Home / DM Button */}
        <button
          className={`w-14 h-14 rounded-2xl transition-all duration-200
                     flex items-center justify-center shadow-sm
                     ${!activeServer 
                       ? 'bg-gradient-to-br from-primary to-accent text-white shadow-medium' 
                       : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'}`}
          onClick={() => { setActiveServer(null); setPanel('channels'); }}
        >
          {/* Modern Academic Icon - Stacked layers for knowledge/learning */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-current">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Divider */}
        <div className="w-10 h-px bg-neutral-700 rounded-full" />

        {/* Server List */}
        {servers.map((server) => (
          <div key={server._id} className="relative group">
            {/* Active Indicator - Modern pill shape */}
            <div
              className={`absolute -left-1 top-1/2 -translate-y-1/2 w-1 bg-primary rounded-r-full transition-all duration-200
                         ${activeServer?._id === server._id ? 'h-8' : 'h-0 group-hover:h-4'}`}
            />
            
            <button
              onClick={() => { setActiveServer(server); setPanel('channels'); }}
              className={`w-14 h-14 rounded-2xl transition-all duration-200
                         flex items-center justify-center text-white font-semibold text-sm
                         ${activeServer?._id === server._id 
                           ? 'bg-gradient-to-br from-primary to-accent shadow-medium' 
                           : 'bg-neutral-800 hover:bg-neutral-700 hover:rounded-xl'
                         }`}
              title={server.name}
            >
              {server.icon ? (
                <img
                  src={server.icon}
                  alt={server.name}
                  className="w-full h-full object-cover rounded-[inherit]"
                />
              ) : (
                <span>{getServerInitial(server.name)}</span>
              )}
            </button>

            {/* Tooltip */}
            <div className="absolute left-24 top-1/2 -translate-y-1/2 z-50 hidden group-hover:block pointer-events-none">
              <div className="bg-neutral-800 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-medium border border-neutral-700">
                {server.name}
              </div>
            </div>
          </div>
        ))}

        {/* Add Server Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-14 h-14 rounded-2xl transition-all duration-200
                   flex items-center justify-center bg-neutral-800 text-success
                   hover:bg-success hover:text-white hover:rounded-xl group shadow-sm"
          title="Add a Server"
        >
          <Plus size={24} className="group-hover:scale-110 transition-transform" />
        </button>

        {/* Explore Servers / Join Server */}
        <button
          onClick={() => setShowJoinModal(true)}
          className="w-14 h-14 rounded-2xl transition-all duration-200
                   flex items-center justify-center bg-neutral-800 text-accent
                   hover:bg-accent hover:text-white hover:rounded-xl group shadow-sm"
          title="Join a Server"
        >
          <Compass size={24} className="group-hover:scale-110 transition-transform" />
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Install App Button */}
        {!window.matchMedia('(display-mode: standalone)').matches && (
          <button
            onClick={() => setShowInstall(true)}
            className="w-14 h-14 rounded-2xl transition-all duration-200
                     flex items-center justify-center bg-neutral-800 text-neutral-400
                     hover:bg-neutral-700 hover:text-white"
            title="Install App"
          >
            <Download size={20} />
          </button>
        )}
        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-14 h-14 rounded-full bg-neutral-800 flex items-center justify-center
                     hover:ring-2 hover:ring-primary transition-all border-2 border-neutral-700"
            title={user?.username}
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-semibold">
                {user?.username?.[0]?.toUpperCase()}
              </span>
            )}
          </button>

          {showMenu && (
            <div className="fixed bottom-24 left-2 w-64 bg-neutral-800 rounded-xl shadow-hard overflow-hidden z-[9999] border border-neutral-700">
              <div className="p-4 bg-gradient-to-br from-primary to-accent">
                <div className="w-16 h-16 mx-auto rounded-full bg-neutral-900/50 flex items-center justify-center mb-3 overflow-hidden border-2 border-white/20">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-2xl font-semibold">
                      {user?.username?.[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <p className="text-white font-semibold text-center text-base">{user?.username}</p>
                {user?.customStatus && (
                  <p className="text-white/80 text-center text-xs mt-1">{user.customStatus}</p>
                )}
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
              <button
                onClick={() => {
                  setShowProfileModal(true);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-3 text-left text-neutral-300 hover:bg-neutral-700 hover:text-white
                         flex items-center gap-3 transition-colors"
              >
                <UserIcon size={18} />
                <span className="font-medium">Edit Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left text-danger hover:bg-danger/10
                         flex items-center gap-3 transition-colors border-t border-neutral-700"
              >
                <LogOut size={18} />
                <span className="font-medium">Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {showInstall && <InstallPWA onClose={() => setShowInstall(false)} />}

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
