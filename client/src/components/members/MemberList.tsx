import { useState } from 'react';
import { useServerStore, useAuthStore } from '../../store';
import { Crown, Shield } from 'lucide-react';
import UserProfileModal from '../profile/UserProfileModal';
import { User } from '../../types';

const MemberList = () => {
  const { activeServer } = useServerStore();
  const { user } = useAuthStore();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  if (!activeServer) {
    return null;
  }

  // Group members by status
  const onlineMembers = activeServer.members.filter(
    m => m.user.status === 'online' || m.user.status === 'idle' || m.user.status === 'dnd'
  );
  const offlineMembers = activeServer.members.filter(
    m => m.user.status === 'offline' || !m.user.status
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown size={14} className="text-warning" />;
      case 'admin':
        return <Shield size={14} className="text-primary" />;
      default:
        return null;
    }
  };

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

  const MemberItem = ({ member }: { member: typeof activeServer.members[0] }) => {
    const isCurrentUser = (member.user._id || member.user.id) === (user?._id || user?.id);
    
    return (
      <div
        className={`flex items-center gap-3 px-2 py-1.5 rounded mx-2 cursor-pointer
                   hover:bg-neutral-800 transition-colors
                   ${member.user.status === 'offline' ? 'opacity-50' : ''}`}
        onClick={() => setSelectedUser(member.user)}
      >
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center">
            {member.user.avatar ? (
              <img
                src={member.user.avatar}
                alt={member.user.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white text-sm font-semibold">
                {member.user.username?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div
            className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-[3px] border-neutral-850
                      ${getStatusColor(member.user.status)}`}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className={`text-sm truncate ${isCurrentUser ? 'text-success' : 'text-neutral-400'}`}>
              {member.user.username}
              {isCurrentUser && ' (you)'}
            </span>
            {getRoleIcon(member.role)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-60 bg-neutral-850 flex flex-col overflow-y-auto">
      {/* Online Members */}
      {onlineMembers.length > 0 && (
        <div className="pt-4">
          <h3 className="px-4 text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-1">
            Online — {onlineMembers.length}
          </h3>
          <div className="space-y-0.5">
            {onlineMembers.map((member, index) => (
              <MemberItem 
                key={`online-${member.user._id || member.user.id || index}`} 
                member={member} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Offline Members */}
      {offlineMembers.length > 0 && (
        <div className="pt-4">
          <h3 className="px-4 text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-1">
            Offline — {offlineMembers.length}
          </h3>
          <div className="space-y-0.5">
            {offlineMembers.map((member, index) => (
              <MemberItem 
                key={`offline-${member.user._id || member.user.id || index}`} 
                member={member} 
              />
            ))}
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {selectedUser && (
        <UserProfileModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

export default MemberList;
