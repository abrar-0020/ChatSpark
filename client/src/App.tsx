import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';
import { useSocket } from './hooks';
import { Login, Register } from './pages';
import { ProtectedRoute, ServerList, ChannelList, ChatArea } from './components';
import InstallPWA from './components/InstallPWA';
import { MessageSquare } from 'lucide-react';

export type MobilePanel = 'servers' | 'channels' | 'chat';
export const MobileNavContext = createContext<{
  panel: MobilePanel;
  setPanel: (p: MobilePanel) => void;
  showDM: boolean;
  setShowDM: (v: boolean) => void;
}>({ panel: 'servers', setPanel: () => {}, showDM: false, setShowDM: () => {} });

export const useMobileNav = () => useContext(MobileNavContext);

// Sliding DM Panel
const DMPanel = ({ show, onClose }: { show: boolean; onClose: () => void }) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (show) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [show, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-30 bg-black/50 transition-opacity duration-200
                   ${show ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      {/* Sliding Panel */}
      <div
        ref={panelRef}
        className={`fixed top-0 left-20 h-full w-64 bg-neutral-850 border-r border-neutral-800
                   z-40 flex flex-col shadow-2xl
                   transition-transform duration-200 ease-in-out
                   ${show ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-neutral-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-neutral-400" />
            <span className="font-semibold text-white">Direct Messages</span>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-14 h-14 bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={28} className="text-neutral-500" />
            </div>
            <p className="text-white font-semibold mb-1">No Direct Messages</p>
            <p className="text-neutral-400 text-sm">Direct messaging is coming soon.</p>
          </div>
        </div>
      </div>
    </>
  );
};

// Main App Layout Component
const MainLayout = () => {
  useSocket();
  const [panel, setPanel] = useState<MobilePanel>('servers');
  const [showDM, setShowDM] = useState(false);

  return (
    <MobileNavContext.Provider value={{ panel, setPanel, showDM, setShowDM }}>
      <div className="h-screen flex overflow-hidden relative">
        <ServerList />
        <ChannelList />
        <ChatArea />
        <DMPanel show={showDM} onClose={() => setShowDM(false)} />
        <InstallPWA />
      </div>
    </MobileNavContext.Provider>
  );
};

function App() {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-neutral-900">
        <div className="text-center">
          {/* ChatSpark Logo */}
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto animate-pulse shadow-medium">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">ChatSpark</h2>
          <p className="text-neutral-400 text-sm">Connecting college students...</p>
        </div>
      </div>
    );
  }

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
