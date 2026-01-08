import { useState } from 'react';
import { X, Loader2, Hash } from 'lucide-react';
import { useServerStore } from '../../store';

interface CreateChannelModalProps {
  serverId: string;
  onClose: () => void;
}

const CreateChannelModal = ({ serverId, onClose }: CreateChannelModalProps) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'text' | 'voice'>('text');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { createChannel } = useServerStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const channelName = name.trim().toLowerCase().replace(/\s+/g, '-');
    if (channelName.length < 1) {
      setError('Channel name is required');
      return;
    }

    try {
      setIsLoading(true);
      await createChannel(serverId, channelName, type);
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to create channel');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Create Channel</h2>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Channel Type */}
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">
                Channel Type
              </label>
              <div className="space-y-2">
                <label
                  className={`flex items-center gap-3 p-3 rounded cursor-pointer transition-colors
                            ${type === 'text' ? 'bg-neutral-800' : 'bg-neutral-900 hover:bg-neutral-900'}`}
                >
                  <input
                    type="radio"
                    name="channelType"
                    value="text"
                    checked={type === 'text'}
                    onChange={() => setType('text')}
                    className="sr-only"
                  />
                  <Hash size={24} className="text-neutral-400" />
                  <div>
                    <p className="text-white font-medium">Text</p>
                    <p className="text-neutral-400 text-sm">Send messages, images, GIFs, emoji, opinions, and puns</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Channel Name */}
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">
                Channel Name
              </label>
              <div className="relative">
                <Hash size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  placeholder="new-channel"
                  required
                  maxLength={100}
                  className="w-full pl-9 pr-3 py-2 bg-neutral-900 text-white rounded
                           border-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {error && (
              <div className="text-danger text-sm bg-danger/10 p-3 rounded">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-transparent text-white font-medium rounded
                         hover:underline transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !name.trim()}
                className="flex-1 py-2.5 bg-primary hover:bg-primary-hover
                         text-white font-medium rounded transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Creating...
                  </>
                ) : (
                  'Create Channel'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateChannelModal;
