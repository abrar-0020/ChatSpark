import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Already running as installed PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setShow(false);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
    }
    setShow(false);
    setDeferredPrompt(null);
  };

  if (installed || !show) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-2rem)] max-w-sm
                    bg-neutral-800 border border-neutral-700 rounded-xl shadow-2xl
                    flex items-center gap-3 px-4 py-3 animate-in slide-in-from-bottom-4">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
        <img src="/chatspark.svg" alt="ChatSpark" className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm">Install ChatSpark</p>
        <p className="text-neutral-400 text-xs truncate">Add to home screen for the best experience</p>
      </div>
      <button
        onClick={handleInstall}
        className="flex-shrink-0 flex items-center gap-1.5 bg-primary hover:bg-primary/80
                   text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
      >
        <Download size={13} />
        Install
      </button>
      <button
        onClick={() => setShow(false)}
        className="flex-shrink-0 text-neutral-500 hover:text-neutral-300 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default InstallPWA;
