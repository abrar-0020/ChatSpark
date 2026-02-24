# ChatSpark

A real-time chat application inspired by Discord, built with React, Node.js, and Socket.IO.

**Live Demo:** https://chatspark.vercel.app

---

## Features

- User registration and login with JWT authentication
- Create and manage servers with invite-code-based joining
- Multiple text channels per server
- Real-time messaging via WebSocket
- Typing indicators and online/offline presence
- Profile customization with avatar and bio
- Persistent data storage using local JSON files (no database required)

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 + TypeScript | UI Framework |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| Zustand | State Management |
| Socket.IO Client | Real-time Communication |
| React Router | Navigation |
| Axios | HTTP Client |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js + Express | Web Framework |
| Socket.IO | WebSocket Server |
| JWT + bcryptjs | Authentication |
| Local File Storage | JSON-based persistence |

---

## Deployment

| Layer | Platform | URL |
|-------|----------|-----|
| Frontend | Vercel | https://chatspark.vercel.app |
| Backend | Render | https://chatspark.onrender.com |

- [`vercel.json`](vercel.json)  Configures Vercel to build `client/` and handle SPA routing
- [`render.yaml`](render.yaml)  Configures Render as a Node.js web service with a persistent disk

---

## Running Locally

**Prerequisites:** Node.js 18+

```bash
# Clone the repository
git clone https://github.com/abrar-0020/ChatSpark.git
cd ChatSpark

# Start the backend
cd server
npm install
node index.js
# Server runs on http://localhost:5000

# Start the frontend (separate terminal)
cd client
npm install
npm run dev
# Client runs on http://localhost:5173
```

Optional  create `server/.env`:
```
PORT=5000
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

---

## Project Structure

```
ChatSpark/
 client/                 # React frontend (Vercel)
    public/
    src/
        components/     # auth, channel, chat, members, profile, server
        hooks/
        pages/
        services/
        store/
        types/

 server/                 # Node.js backend (Render)
    controllers/
    middleware/
    models/
    routes/
    socket/
    storage/
        fileStorage.js
        data/           # JSON data files (gitignored)

 vercel.json
 render.yaml
 README.md
```

---

## API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Servers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/servers` | List user's servers |
| POST | `/api/servers` | Create a server |
| POST | `/api/servers/join/:inviteCode` | Join via invite code |
| DELETE | `/api/servers/:id` | Delete a server (owner only) |

### Channels & Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/servers/:id/channels` | List channels |
| POST | `/api/servers/:id/channels` | Create a channel |
| GET | `/api/channels/:id/messages` | Get messages |
| POST | `/api/messages` | Send a message |
| DELETE | `/api/messages/:id` | Delete a message |

---

## Socket Events

| Direction | Event | Description |
|-----------|-------|-------------|
| Client to Server | `channel:join` | Subscribe to a channel room |
| Client to Server | `message:send` | Send a message |
| Client to Server | `typing:start` | Notify typing started |
| Client to Server | `typing:stop` | Notify typing stopped |
| Server to Client | `message:new` | Incoming message |
| Server to Client | `typing:update` | Current typing users |
| Server to Client | `user:online` | User came online |
| Server to Client | `user:offline` | User went offline |

---

## Roadmap

- Direct messages (DMs)
- File and image uploads
- Message reactions
- User mentions and notifications
- Voice channels
- Message search

---

## Author

**Abrar**  [@abrar-0020](https://github.com/abrar-0020)

## License

This project is open source and available under the [MIT License](LICENSE).
