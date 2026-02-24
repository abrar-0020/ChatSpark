import { useState } from 'react';
import { X, Share, MoreVertical, PlusSquare } from 'lucide-react';

declare global {
  interface Window {
    __pwaInstallPrompt: any;
  }
}

const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const isAndroid = () => /android/i.test(navigator.userAgent);
const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as any).standalone === true;

interface Props {
  onClose: () => void;
}

const InstallPWA = ({ onClose }: Props) => {
  const [installing, setInstalling] = useState(false);
  const [done, setDone] = useState(false);

  const handleAndroidInstall = async () => {
    const prompt = window.__pwaInstallPrompt;
    if (prompt) {
      setInstalling(true);
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') {
        setDone(true);
        window.__pwaInstallPrompt = null;
      }
      setInstalling(false);
      onClose();
    }
  };

  if (done) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm bg-neutral-800 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-700">
          <div className="flex items-center gap-3">
            <img src="/chatspark.svg" alt="ChatSpark" className="w-9 h-9 rounded-xl" />
            <div>
              <p className="text-white font-semibold text-sm">Install ChatSpark</p>
              <p className="text-neutral-400 text-xs">Add to your home screen</p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Instructions */}
        <div className="px-5 py-4">
          {isIOS() && (
            <ol className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <span className="text-neutral-300 text-sm">
                  Tap the <span className="inline-flex items-center gap-1 text-white font-medium"><Share size={14} /> Share</span> button in Safari's toolbar
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <span className="text-neutral-300 text-sm">
                  Scroll down and tap <span className="inline-flex items-center gap-1 text-white font-medium"><PlusSquare size={14} /> Add to Home Screen</span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                <span className="text-neutral-300 text-sm">Tap <span className="text-white font-medium">Add</span> in the top right corner</span>
              </li>
            </ol>
          )}

          {isAndroid() && (
            <div className="space-y-3">
              {window.__pwaInstallPrompt ? (
                <button
                  onClick={handleAndroidInstall}
                  disabled={installing}
                  className="w-full bg-primary hover:bg-primary/80 text-white font-semibold
                             py-3 rounded-xl transition-colors disabled:opacity-50"
                >
                  {installing ? 'Installing...' : 'Install App'}
                </button>
              ) : (
                <ol className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                    <span className="text-neutral-300 text-sm">
                      Tap the <span className="inline-flex items-center gap-1 text-white font-medium"><MoreVertical size={14} /> menu</span> in Chrome (top right)
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                    <span className="text-neutral-300 text-sm">Tap <span className="text-white font-medium">Add to Home screen</span> or <span className="text-white font-medium">Install app</span></span>
                  </li>
                </ol>
              )}
            </div>
          )}

          {!isIOS() && !isAndroid() && (
            <p className="text-neutral-400 text-sm text-center py-2">
              Use your browser's menu to install this app to your device.
            </p>
          )}
        </div>

        <div className="px-5 pb-4">
          <button
            onClick={onClose}
            className="w-full border border-neutral-600 text-neutral-400 hover:text-white
                       hover:border-neutral-500 py-2.5 rounded-xl transition-colors text-sm font-medium"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPWA;
