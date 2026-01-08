import { useState, useEffect } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { serverService } from '../../services';

interface InviteModalProps {
  serverId: string;
  serverName: string;
  onClose: () => void;
}

const InviteModal = ({ serverId, serverName, onClose }: InviteModalProps) => {
  const [inviteCode, setInviteCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInviteCode = async () => {
      try {
        const response = await serverService.getInviteCode(serverId);
        setInviteCode(response.inviteCode);
      } catch (error) {
        console.error('Failed to get invite code:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInviteCode();
  }, [serverId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Invite friends to {serverName}</h2>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <p className="text-neutral-400 text-sm mb-4">
            Share this invite code with friends to let them join your server.
          </p>

          <div className="flex gap-2">
            <div className="flex-1 px-3 py-2 bg-neutral-900 rounded-lg text-white font-mono border border-neutral-700">
              {isLoading ? 'Loading...' : inviteCode}
            </div>
            <button
              onClick={handleCopy}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2
                        ${copied 
                          ? 'bg-success text-white' 
                          : 'bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent-hover text-white'
                        }`}
            >
              {copied ? (
                <>
                  <Check size={18} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={18} />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;
