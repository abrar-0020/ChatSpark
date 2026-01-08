// User types
export interface User {
  id: string;
  _id?: string;
  username: string;
  email: string;
  avatar: string | null;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  customStatus?: string;
  aboutMe?: string;
  servers?: Server[];
}

// Server types
export interface ServerMember {
  user: User;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

export interface Server {
  _id: string;
  name: string;
  description?: string;
  icon: string | null;
  owner: User;
  members: ServerMember[];
  channels: Channel[];
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
}

// Channel types
export interface ChannelPermissions {
  read: ('owner' | 'admin' | 'member')[];
  write: ('owner' | 'admin' | 'member')[];
}

export interface Channel {
  _id: string;
  name: string;
  type: 'text' | 'voice';
  description?: string;
  server: string;
  permissions: ChannelPermissions;
  position: number;
  createdAt: string;
  updatedAt: string;
}

// Message types
export interface MessageAttachment {
  filename: string;
  url: string;
  type: string;
  size: number;
}

export interface Message {
  _id: string;
  content: string;
  author: User;
  channel: string;
  server: string;
  attachments: MessageAttachment[];
  edited: boolean;
  editedAt: string | null;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// Socket event types
export interface TypingUpdate {
  channelId: string;
  users: string[];
}

export interface UserStatusUpdate {
  userId: string;
  status: 'online' | 'idle' | 'dnd' | 'offline';
}

export interface MemberJoinedEvent {
  serverId: string;
  user: User;
}

export interface MemberLeftEvent {
  serverId: string;
  userId: string;
}
