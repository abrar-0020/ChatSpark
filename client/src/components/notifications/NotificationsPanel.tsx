import { X, Bell, Trash2, CheckCheck } from 'lucide-react';
import { useNotificationStore, AppNotification } from '../../store/notificationStore';
import { useServerStore } from '../../store';
import { useMobileNav } from '../../App';

interface Props {
  onClose: () => void;
}

const timeAgo = (ts: number) => {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const NotificationsPanel = ({ onClose }: Props) => {
  const { notifications, markAllRead, clearAll } = useNotificationStore();
  const { setActiveServer, servers } = useServerStore();
  const { setPanel } = useMobileNav();

  const handleNotifClick = (notif: AppNotification) => {
    // Navigate to the relevant server/channel
    const server = servers.find(s =>
      s.channels.some(c => c._id === notif.channelId)
    );
    if (server) {
      setActiveServer(server);
      setPanel('chat');
    }
    markAllRead();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-neutral-900 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-900">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-primary" />
          <span className="font-semibold text-white text-base">Notifications</span>
          {notifications.filter(n => !n.read).length > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {notifications.filter(n => !n.read).length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {notifications.length > 0 && (
            <>
              <button
                onClick={markAllRead}
                className="text-neutral-400 hover:text-white transition-colors"
                title="Mark all read"
              >
                <CheckCheck size={18} />
              </button>
              <button
                onClick={clearAll}
                className="text-neutral-400 hover:text-red-400 transition-colors"
                title="Clear all"
              >
                <Trash2 size={18} />
              </button>
            </>
          )}
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Notification list */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-neutral-500">
            <Bell size={40} className="opacity-30" />
            <p className="text-sm">No notifications yet</p>
            <p className="text-xs text-neutral-600">Messages from others will appear here</p>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-800">
            {notifications.map(notif => (
              <li
                key={notif.id}
                onClick={() => handleNotifClick(notif)}
                className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors
                  ${notif.read ? 'bg-neutral-900 hover:bg-neutral-800' : 'bg-neutral-800 hover:bg-neutral-750'}`}
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white font-bold text-sm uppercase">
                  {notif.senderAvatar
                    ? <img src={notif.senderAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                    : notif.senderUsername?.[0] || '?'}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-white truncate">{notif.senderUsername}</span>
                    <span className="text-[10px] text-neutral-500 flex-shrink-0">{timeAgo(notif.timestamp)}</span>
                  </div>
                  <p className="text-xs text-neutral-400 truncate mt-0.5">
                    #{notif.channelName} · {notif.serverName}
                  </p>
                  <p className="text-sm text-neutral-300 mt-1 line-clamp-2">{notif.body}</p>
                </div>

                {/* Unread dot */}
                {!notif.read && (
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;
