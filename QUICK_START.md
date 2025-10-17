# ⚡ QUICK START - Do This First!

## 🎯 Your Mission: Get Real-time Chat Working

### Step 1: Install Socket.io (5 minutes)

```bash
# Backend
cd backend
npm install socket.io

# Frontend
cd frontend
npm install socket.io-client
```

### Step 2: Add Socket.io to Backend (10 minutes)

Create `backend/src/services/socketService.js` - **Copy this entire file**:

```javascript
const socketIO = require("socket.io");

class SocketService {
  constructor(server) {
    this.io = socketIO(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true,
      },
    });
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.on("connection", (socket) => {
      console.log("✅ User connected:", socket.id);

      socket.on("join-looproom", ({ looproomId, userId }) => {
        socket.join(`looproom-${looproomId}`);
        console.log(`User ${userId} joined room ${looproomId}`);
        this.io.to(`looproom-${looproomId}`).emit("user-joined", { userId });
      });

      socket.on("chat-message", ({ looproomId, message }) => {
        console.log("Message:", message);
        this.io.to(`looproom-${looproomId}`).emit("new-message", message);
      });

      socket.on("disconnect", () => {
        console.log("❌ User disconnected:", socket.id);
      });
    });
  }
}

module.exports = SocketService;
```

Update `backend/src/server.js` - **Add these lines**:

```javascript
const http = require("http");
const SocketService = require("./services/socketService");

// Find this line:
// const app = express();

// Add AFTER it:
const server = http.createServer(app);
const socketService = new SocketService(server);

// Find this line at the bottom:
// app.listen(PORT, ...

// REPLACE with:
server.listen(PORT, async () => {
  console.log(`🚀 Vybe Backend running on port ${PORT}`);
  console.log(`🔌 WebSocket ready`);
  // ... rest of your code
});
```

### Step 3: Add Socket.io to Frontend (10 minutes)

Create `frontend/src/hooks/useSocket.ts`:

```typescript
import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

export function useSocket(looproomId?: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
    );

    newSocket.on("connect", () => {
      console.log("✅ Connected to server");
      setConnected(true);
      if (looproomId) {
        newSocket.emit("join-looproom", { looproomId, userId: "test-user" });
      }
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Disconnected from server");
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [looproomId]);

  return { socket, connected };
}
```

### Step 4: Create Test Page (10 minutes)

Create `frontend/src/app/test-chat/page.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/useSocket";

export default function TestChatPage() {
  const { socket, connected } = useSocket("test-room");
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!socket) return;

    socket.on("new-message", (message: any) => {
      setMessages((prev) => [...prev, message.content]);
    });

    return () => {
      socket.off("new-message");
    };
  }, [socket]);

  const sendMessage = () => {
    if (!socket || !input.trim()) return;

    socket.emit("chat-message", {
      looproomId: "test-room",
      message: { content: input },
    });

    setInput("");
  };

  return (
    <div className="min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Test Chat</h1>
      <p className="mb-4">
        Status:{" "}
        <span className={connected ? "text-green-500" : "text-red-500"}>
          {connected ? "🟢 Connected" : "🔴 Disconnected"}
        </span>
      </p>

      <div className="border rounded-lg p-4 h-96 overflow-y-auto mb-4 bg-gray-50">
        {messages.map((msg, i) => (
          <div key={i} className="mb-2 p-2 bg-white rounded">
            {msg}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 border rounded px-4 py-2"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
}
```

### Step 5: Test It! (5 minutes)

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Open TWO browser tabs**:

1. http://localhost:3000/test-chat
2. http://localhost:3000/test-chat (in another tab)

**Type a message in one tab - it should appear in BOTH tabs instantly!** 🎉

---

## ✅ Success Checklist

- [ ] Both tabs show "🟢 Connected"
- [ ] Message typed in tab 1 appears in tab 2
- [ ] Message typed in tab 2 appears in tab 1
- [ ] Backend console shows "User connected" messages
- [ ] No errors in browser console

---

## 🎉 If It Works...

**Congratulations!** You just built real-time communication! This is the hardest part.

**Next steps** (in order):

1. Read `START_HERE.md` for full roadmap
2. Build Looproom entry page
3. Add music player
4. Build Loopchain navigation

---

## 🆘 If It Doesn't Work...

### Check These:

**Backend not starting?**

```bash
# Make sure you're in backend folder
cd backend
npm install
npm run dev
```

**Frontend not starting?**

```bash
# Make sure you're in frontend folder
cd frontend
npm install
npm run dev
```

**"Module not found" error?**

```bash
# Install dependencies again
npm install socket.io        # in backend
npm install socket.io-client # in frontend
```

**Messages not appearing?**

- Check browser console (F12) for errors
- Check backend terminal for errors
- Make sure both tabs are open to `/test-chat`
- Try refreshing both tabs

**Still stuck?**

- Check `backend/src/server.js` - did you replace `app.listen` with `server.listen`?
- Check `frontend/src/hooks/useSocket.ts` - is the file created?
- Check `frontend/src/app/test-chat/page.tsx` - is the file created?

---

## 📚 What You Just Built

You now have:

- ✅ WebSocket server (Socket.io)
- ✅ Real-time message broadcasting
- ✅ Room-based communication
- ✅ React hook for Socket.io
- ✅ Working test page

**This is the foundation for ALL Looproom features!**

---

**Time to complete**: ~40 minutes  
**Difficulty**: Medium  
**Impact**: CRITICAL - Everything else builds on this

**Ready? Let's go! 🚀**
