# ⚡ ChatSpark

<div align="center">
  <img src="client/public/chatspark.svg" alt="ChatSpark Logo" width="120" height="120" />
  
  <h3>Real-time Chat Application</h3>
  <p>A modern, feature-rich chat platform inspired by Discord, built with React, Node.js, Socket.IO, and in-memory storage.</p>

  ![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)
  ![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
  ![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-010101?style=for-the-badge&logo=socket.io&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
</div>

---

## ✨ Features

### 🔐 Authentication
- User registration and login with email/password
- JWT-based secure authentication
- Protected routes and persistent sessions
- Profile customization with avatar and "About Me"
- Automatic login redirect

### 🏠 Servers
- Create and customize servers with descriptions and icons
- Join servers via unique invite codes (6-character codes)
- Server roles: Owner, Admin, Member
- Delete servers (owner only)
- Automatic channel creation (general channel on server creation)
- Server visibility control (users only see servers they've joined)

### 💬 Channels
- Create multiple text channels within servers
- Channel descriptions and permissions
- Real-time channel switching
- Secure channel access (members only)

### ⚡ Real-Time Communication
- Instant messaging with WebSocket
- Typing indicators ("User is typing...")
- Online/offline member status with color indicators
- Message timestamps and author display
- Real-time message delivery to all connected users
- Discord-like message UI with avatars

### 🎨 Modern UI/UX
- Beautiful dark theme design inspired by Discord
- 3-column layout: Server List → Channel List → Chat Area + Member List
- Responsive and accessible interface
- Emoji picker support
- Member list with online/offline status
- User profile modal
- Server invite modal
- Animated loading states
- Discord-style avatars with status indicators

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool & Dev Server |
| Tailwind CSS | Styling |
| Zustand | State Management |
| Socket.IO Client | Real-time Communication |
| React Router | Navigation |
| Axios | HTTP Client |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | Web Framework |
| Socket.IO | WebSocket Server |
| JWT | Authentication |
| bcryptjs | Password Hashing |
| **In-Memory Storage** | Data Storage (No MongoDB required) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Git
- **No database setup required!** (Uses in-memory storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/abrar-0020/ChatSpark.git
   cd ChatSpark
   ```

2. **Set up the backend**
   ```bash
   cd server
   npm install
   ```

3. **Set up the frontend**
   ```bash
   cd ../client
   npm install
   ```

4. **Start the application**

   **Terminal 1 (Backend):**
   ```bash
   cd server
   node index.js
   ```
   The server will start on `http://localhost:5000`

   **Terminal 2 (Frontend):**
   ```bash
   cd client
   npm run dev
   ```
   The client will start on `http://localhost:5173`

5. **Open your browser**
   
   Navigate to `http://localhost:5173`

---

## 📖 How to Use (Like Discord)

### For First User (Create Server)
1. **Register** a new account or **Login**
2. Click the **"+"** button (green plus icon) on the left sidebar
3. **Create a server** with a name and optional description
4. Click on the **server name at the top** to view the invite code
5. **Copy the invite code** and share it with others

### For Second User (Join Server)
1. **Open a new incognito/private browser window** (Ctrl+Shift+N)
2. Go to `http://localhost:5173`
3. **Register** a new account
4. Click the **compass icon** (🧭) on the left sidebar
5. **Paste the invite code** you received
6. Click **"Join Server"**
7. You're now in the same server and can chat!

### ⚠️ Important Notes
- **Use incognito/private windows** for testing multiple users (each browser window = different user)
- **Data is temporary** - all data clears when the server restarts
- **Refresh browser** (Ctrl+Shift+R) after server restarts
- **Server owners cannot leave** their own servers (they must delete them)

---

## 📁 Project Structure

```
ChatSpark/
├── client/                 # React Frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # UI Components
│   │   │   ├── auth/      # Authentication
│   │   │   ├── channel/   # Channel management
│   │   │   ├── chat/      # Chat interface
│   │   │   ├── members/   # Member list
│   │   │   ├── profile/   # User profile
│   │   │   └── server/    # Server management
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── store/         # Zustand stores
│   │   └── types/         # TypeScript types
│   └── package.json
│
├── server/                 # Node.js Backend
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Auth middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── socket/            # Socket.IO handlers
│   └── index.js           # Entry point
│
└── README.md
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update user profile |
| PUT | `/api/auth/status` | Update user status |

### Servers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/servers` | Get user's servers |
| POST | `/api/servers` | Create new server |
| GET | `/api/servers/:id` | Get server by ID |
| PUT | `/api/servers/:id` | Update server |
| DELETE | `/api/servers/:id` | Delete server (owner only) |
| POST | `/api/servers/join/:inviteCode` | Join server with invite code |
| POST | `/api/servers/:id/leave` | Leave server |
| GET | `/api/servers/:id/invite` | Get server invite code |

### Channels
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/servers/:serverId/channels` | Get server channels |
| POST | `/api/servers/:serverId/channels` | Create channel |
| DELETE | `/api/channels/:id` | Delete channel |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/channels/:channelId/messages` | Get channel messages |
| POST | `/api/messages` | Send message |
| PUT | `/api/messages/:id` | Edit message |
| DELETE | `/api/messages/:id` | Delete message |

---

## 🔧 Socket Events

### Client → Server
| Event | Description | Data |
|-------|-------------|------|
| `channel:join` | Join a channel room | `channelId` |
| `channel:leave` | Leave a channel room | `channelId` |
| `message:send` | Send a new message | `{ channelId, content }` |
| `typing:start` | User started typing | `{ channelId }` |
| `typing:stop` | User stopped typing | `{ channelId }` |

### Server → Client
| Event | Description | Data |
|-------|-------------|------|
| `message:new` | New message received | `message` object |
| `message:deleted` | Message was deleted | `{ messageId, channelId }` |
| `typing:update` | Typing users update | `{ channelId, users }` |
| `user:online` | User came online | `{ userId, username, status }` |
| `user:offline` | User went offline | `{ userId }` |
| `user:status` | User status changed | `{ userId, status }` |
| `server:member_joined` | New member joined | `{ serverId, user }` |
| `server:member_left` | Member left server | `{ serverId, userId }` |

---

## 💾 Data Storage

This application uses **in-memory storage** instead of MongoDB, which means:

### ✅ Advantages
- **No database setup required** - works out of the box
- **Fast performance** - all data is in RAM
- **Easy development** - no connection strings or configurations
- **Zero dependencies** - no external database needed

### ⚠️ Limitations
- **Data is not persistent** - all data is lost when server restarts
- **Not suitable for production** - use only for development/testing
- **Limited scalability** - data stored in single server instance

### 🔄 Migrating to MongoDB (Optional)
If you want to use MongoDB instead:
1. Uncomment MongoDB models in `server/models/`
2. Install mongoose: `npm install mongoose`
3. Create `.env` file with `MONGODB_URI`
4. Replace in-memory storage with Mongoose schemas

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Send message |
| `Shift + Enter` | New line in message |

---

## 📚 Project Structure

```
ChatSpark/
├── client/                 # React Frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # UI Components
│   │   │   ├── auth/      # ProtectedRoute
│   │   │   ├── channel/   # ChannelList, CreateChannelModal
│   │   │   ├── chat/      # ChatArea, MessageInput, MessageItem
│   │   │   ├── members/   # MemberList
│   │   │   ├── profile/   # ProfileModal
│   │   │   └── server/    # ServerList, CreateServerModal, JoinServerModal
│   │   ├── hooks/         # useSocket, useTypingIndicator
│   │   ├── pages/         # Login, Register
│   │   ├── services/      # API & Socket services
│   │   ├── store/         # Zustand stores (auth, server, message)
│   │   └── types/         # TypeScript interfaces
│   ├── vite.config.ts     # Vite configuration
│   └── package.json
│
├── server/                 # Node.js Backend
│   ├── controllers/       # Business logic
│   │   ├── authController.js
│   │   ├── serverController.js
│   │   ├── channelController.js
│   │   └── messageController.js
│   ├── middleware/        # auth.js (JWT verification)
│   ├── models/            # In-memory data models
│   │   ├── User.js
│   │   ├── Server.js
│   │   ├── Channel.js
│   │   └── Message.js
│   ├── routes/            # Express routes
│   ├── socket/            # Socket.IO event handlers
│   ├── index.js           # Server entry point
│   └── package.json
│
└── README.md
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

**Abrar**
- GitHub: [@abrar-0020](https://github.com/abrar-0020)

---

## 🙏 Acknowledgments

- Inspired by [Discord](https://discord.com)
- Icons by [Lucide](https://lucide.dev)
- UI framework [Tailwind CSS](https://tailwindcss.com)
- Real-time communication powered by [Socket.IO](https://socket.io)

---

## 🎯 Future Enhancements

Potential features to add:
- [ ] Voice channels
- [ ] File sharing and image uploads
- [ ] Message reactions
- [ ] User mentions and notifications
- [ ] Direct messages (DMs)
- [ ] Server categories
- [ ] User roles and permissions
- [ ] Message editing (UI ready, backend needs implementation)
- [ ] Persistent storage with MongoDB
- [ ] Mobile responsive design improvements
- [ ] Dark/Light theme toggle

---

<div align="center">
  <p>Made with ❤️ and ⚡</p>
  <p>⭐ Star this repo if you found it helpful!</p>
  
  <br>
  
  **Happy Chatting! 💬**
</div>
