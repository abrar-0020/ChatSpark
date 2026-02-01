import { X } from 'lucide-react';
import { User } from '../../types';

interface UserProfileModalProps {
  user: User;
  onClose: () => void;
}

const UserProfileModal = ({ user, onClose }: UserProfileModalProps) => {
  // Generate a consistent color based on username
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
      'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
      'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
      'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const avatarColor = getAvatarColor(user.username);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online':
        return 'bg-success';
      case 'idle':
        return 'bg-warning';
      case 'dnd':
        return 'bg-danger';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'idle':
        return 'Idle';
      case 'dnd':
        return 'Do Not Disturb';
      default:
        return 'Offline';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]"
      onClick={onClose}
    >
      <div 
        className="bg-neutral-900 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner */}
        <div className="h-24 bg-gradient-to-br from-primary to-purple-600 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-neutral-200 transition-colors bg-black/30 rounded-full p-1 hover:bg-black/50"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Profile Content */}
        <div className="relative px-6 pb-6">
          {/* Avatar */}
          <div className="absolute -top-12 left-6">
            <div className={`w-24 h-24 rounded-full ${avatarColor} border-[6px] border-neutral-900 flex items-center justify-center overflow-hidden`}>
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-3xl font-bold">
                  {user.username[0]?.toUpperCase()}
                </span>
              )}
            </div>
            {/* Status Badge */}
            <div
              className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-neutral-900
                        ${getStatusColor(user.status)}`}
            />
          </div>
          
          {/* User Info */}
          <div className="pt-14">
            {/* Username & Status */}
            <div className="bg-neutral-950 rounded-lg p-4 mb-4">
              <h2 className="text-white font-bold text-2xl mb-1">{user.username}</h2>
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(user.status)}`} />
                <span className="text-neutral-400 text-sm">{getStatusText(user.status)}</span>
              </div>
              
              {/* Custom Status */}
              {user.customStatus && (
                <div className="mt-3 pt-3 border-t border-neutral-800">
                  <p className="text-white text-sm">{user.customStatus}</p>
                </div>
              )}
            </div>
            
            {/* About Me */}
            {user.aboutMe && (
              <div className="bg-neutral-950 rounded-lg p-4">
                <h3 className="text-xs font-semibold text-neutral-400 uppercase mb-2">
                  About Me
                </h3>
                <p className="text-white text-sm whitespace-pre-wrap leading-relaxed">
                  {user.aboutMe}
                </p>
              </div>
            )}
            
            {/* Member Since */}
            <div className="bg-neutral-950 rounded-lg p-4 mt-4">
              <h3 className="text-xs font-semibold text-neutral-400 uppercase mb-2">
                Member Since
              </h3>
              <p className="text-white text-sm">
                {new Date(user._id ? parseInt(user._id.substring(0, 8), 16) * 1000 : Date.now()).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
