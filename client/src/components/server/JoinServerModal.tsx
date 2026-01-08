import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useServerStore } from '../../store';

interface JoinServerModalProps {
  onClose: () => void;
}

const JoinServerModal = ({ onClose }: JoinServerModalProps) => {
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { joinServer } = useServerStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const code = inviteCode.trim();
    if (!code) {
      setError('Please enter an invite code');
      return;
    }

    try {
      setIsLoading(true);
      await joinServer(code);
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Invalid invite code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Join a Server</h2>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <p className="text-neutral-400 text-sm mb-6">
            Enter an invite code to join an existing server.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wide mb-2">
                Invite Code
                <span className="text-danger ml-1">*</span>
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Enter invite code"
                required
                className="w-full px-4 py-3 bg-neutral-900 text-white rounded-lg
                         border border-neutral-700 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <p className="text-neutral-500 text-xs mt-2">
                Invite codes look like: hTKzmak
              </p>
            </div>

            {error && (
              <div className="text-danger text-sm bg-danger/10 p-3 rounded-lg border border-danger/20">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-transparent text-neutral-400 font-medium rounded-lg
                         hover:text-white hover:bg-neutral-800 transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent-hover
                         text-white font-semibold rounded-lg transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Joining...
                  </>
                ) : (
                  'Join Server'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JoinServerModal;
