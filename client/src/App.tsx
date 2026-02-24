import { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';
import { useSocket } from './hooks';
import { Login, Register } from './pages';
import { ProtectedRoute, ServerList, ChannelList, ChatArea } from './components';

export type MobilePanel = 'channels' | 'chat';
export const MobileNavContext = createContext<{
  panel: MobilePanel;
  setPanel: (p: MobilePanel) => void;
}>({ panel: 'channels', setPanel: () => {} });

export const useMobileNav = () => useContext(MobileNavContext);

// Main App Layout Component
const MainLayout = () => {
  useSocket();
  const [panel, setPanel] = useState<MobilePanel>('channels');

  return (
    <MobileNavContext.Provider value={{ panel, setPanel }}>
      <div className="h-screen flex overflow-hidden">
        <ServerList />
        <ChannelList />
        <ChatArea />
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
