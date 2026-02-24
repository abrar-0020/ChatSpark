import { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Download, Home, Bell, User as UserIcon } from 'lucide-react';
import { useAuthStore, useServerStore } from './store';
import { useSocket } from './hooks';
import { Login, Register } from './pages';
import { ProtectedRoute, ServerList, ChannelList, ChatArea } from './components';
import InstallPWA from './components/InstallPWA';
import ProfileModal from './components/profile/ProfileModal';

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as any).standalone === true;

export type MobilePanel = 'channels' | 'chat';
export const MobileNavContext = createContext<{
  panel: MobilePanel;
  setPanel: (p: MobilePanel) => void;
}>({ panel: 'channels', setPanel: () => {} });

export const useMobileNav = () => useContext(MobileNavContext);

const isMobile = () => /iphone|ipad|ipod|android/i.test(navigator.userAgent);

// Main App Layout Component
const MainLayout = () => {
  useSocket();
  const [panel, setPanel] = useState<MobilePanel>('channels');
  const [showInstall, setShowInstall] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { setActiveServer } = useServerStore();

  // Intercept Android/browser back button to navigate panels instead of exiting
  useEffect(() => {
    if (panel === 'chat') {
      // Push a dummy history entry so back button fires popstate instead of leaving the app
      window.history.pushState({ panel: 'chat' }, '');
    }

    const handlePopState = () => {
      if (panel === 'chat') {
        setPanel('channels');
        // Push again so back stays within the app if user goes chat → channels → back
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [panel]);

  // Auto-show install prompt once per session on mobile if not installed
  useEffect(() => {
    if (isStandalone()) return;
    if (!isMobile()) return;
    // Use sessionStorage — resets each browser session, not permanent
    if (sessionStorage.getItem('pwa-prompt-shown')) return;

    const timer = setTimeout(() => {
      setShowInstall(true);
      sessionStorage.setItem('pwa-prompt-shown', '1');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <MobileNavContext.Provider value={{ panel, setPanel }}>
      <div className="h-[100dvh] flex overflow-hidden">
        <ServerList />
        <ChannelList />
        <ChatArea />
      </div>

      {/* Floating install button — always accessible on mobile */}
      {!isStandalone() && (
        <button
          onClick={() => setShowInstall(true)}
          className="md:hidden fixed bottom-20 right-4 z-50 w-12 h-12 rounded-full
                     bg-primary shadow-lg flex items-center justify-center
                     text-white hover:bg-primary/90 transition-colors"
          title="Install App"
        >
          <Download size={20} />
        </button>
      )}

      {showInstall && <InstallPWA onClose={() => setShowInstall(false)} />}

      {/* Mobile bottom tab bar */}
      <nav className={`${panel === 'chat' ? 'hidden' : 'flex'} md:hidden fixed bottom-0 inset-x-0 z-40 h-14 bg-neutral-900 border-t border-neutral-800 items-center justify-around`}>
        <button
          onClick={() => { setActiveServer(null); setPanel('channels'); }}
          className="flex flex-col items-center gap-0.5 text-neutral-400 hover:text-white transition-colors"
        >
          <Home size={22} />
          <span className="text-[10px] font-medium">Home</span>
        </button>
        <button className="flex flex-col items-center gap-0.5 text-neutral-400 hover:text-white transition-colors">
          <Bell size={22} />
          <span className="text-[10px] font-medium">Notifications</span>
        </button>
        <button
          onClick={() => setShowProfile(true)}
          className="flex flex-col items-center gap-0.5 text-neutral-400 hover:text-white transition-colors"
        >
          <UserIcon size={22} />
          <span className="text-[10px] font-medium">You</span>
        </button>
      </nav>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </MobileNavContext.Provider>
  );
};

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/channels/*"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/channels/@me" replace />} />
        <Route path="*" element={<Navigate to="/channels/@me" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
