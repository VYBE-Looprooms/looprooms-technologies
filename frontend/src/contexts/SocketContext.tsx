"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_EVENTS } from "@/types/socket";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  connect: () => {},
  disconnect: () => {},
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    // Get token from localStorage
    const token = localStorage.getItem("userToken");

    if (!token) {
      console.warn("No auth token found, cannot connect to WebSocket");
      return;
    }

    // Don't create multiple connections
    if (socket?.connected) {
      console.log("Socket already connected");
      return;
    }

    try {
      // Create socket connection
      const newSocket = io(
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
        {
          auth: {
            token,
          },
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: maxReconnectAttempts,
          timeout: 10000,
        }
      );

      // Connection event handlers
      newSocket.on(SOCKET_EVENTS.CONNECT, () => {
        console.log("✅ Connected to WebSocket server");
        setIsConnected(true);
        reconnectAttempts.current = 0;
      });

      newSocket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
        console.log("❌ Disconnected from WebSocket server:", reason);
        setIsConnected(false);

        // Auto-reconnect on certain disconnect reasons
        if (reason === "io server disconnect") {
          // Server disconnected, try to reconnect
          setTimeout(() => {
            if (reconnectAttempts.current < maxReconnectAttempts) {
              reconnectAttempts.current++;
              console.log(
                `Reconnection attempt ${reconnectAttempts.current}/${maxReconnectAttempts}`
              );
              newSocket.connect();
            }
          }, 2000);
        }
      });

      newSocket.on(SOCKET_EVENTS.CONNECT_ERROR, (error) => {
        console.error("WebSocket connection error:", error.message);
        setIsConnected(false);

        // Check if it's an authentication error
        if (error.message.includes("Authentication")) {
          console.error("Authentication failed. Please log in again.");
          // Clear invalid token
          localStorage.removeItem("userToken");
          localStorage.removeItem("userInfo");
        }
      });

      newSocket.on(SOCKET_EVENTS.ERROR, (error) => {
        console.error("WebSocket error:", error);
      });

      // Handle reconnection attempts
      newSocket.io.on("reconnect_attempt", (attempt) => {
        console.log(`Reconnection attempt ${attempt}/${maxReconnectAttempts}`);
      });

      newSocket.io.on("reconnect_failed", () => {
        console.error("Failed to reconnect after maximum attempts");
        setIsConnected(false);
      });

      newSocket.io.on("reconnect", (attempt) => {
        console.log(`✅ Reconnected after ${attempt} attempts`);
        setIsConnected(true);
        reconnectAttempts.current = 0;
      });

      setSocket(newSocket);
    } catch (error) {
      console.error("Failed to create socket connection:", error);
      setIsConnected(false);
    }
  }, [socket]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  // Auto-connect when component mounts if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (token && !socket) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      if (socket) {
        console.log("Cleaning up socket connection");
        socket.removeAllListeners();
        socket.disconnect();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle visibility change - reconnect when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        socket &&
        !socket.connected
      ) {
        const token = localStorage.getItem("userToken");
        if (token) {
          console.log("Tab visible, reconnecting socket...");
          socket.connect();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [socket]);

  const value: SocketContextType = {
    socket,
    isConnected,
    connect,
    disconnect,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
