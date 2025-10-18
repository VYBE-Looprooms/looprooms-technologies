"use client";

import { useEffect, useCallback, useState } from 'react';
import { useSocket } from '@/contexts/SocketContext';

interface JoinLooproomData {
  looproomId: string;
  mood: string;
  silent?: boolean; // Don't broadcast join message (for rejoins)
}

interface SendMessageData {
  looproomId: string;
  content: string;
}

interface TypingData {
  looproomId: string;
  isTyping: boolean;
}

interface ReactToMessageData {
  messageId: string;
  emoji: string;
}

interface Message {
  id: string;
  content: string;
  userId: number;
  userName: string;
  userType: string;
  timestamp: string;
  type: 'message' | 'system' | 'ai' | 'announcement';
  reactions?: Record<string, number[]>;
}

interface Participant {
  userId: number;
  name: string;
  mood?: string;
  joinedAt: number;
}

interface LooproomData {
  looproom: {
    id: string;
    name: string;
    isLive: boolean;
    streamUrl?: string;
    chatEnabled: boolean;
    slowModeSeconds: number;
  };
  session: {
    id: string;
    startedAt: string;
    status: string;
  } | null;
  participantCount: number;
  participants: Participant[];
}

export function useLooproomSocket() {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantCount, setParticipantCount] = useState(0);
  const [isInRoom, setIsInRoom] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [sessionState, setSessionState] = useState<{ isLive: boolean; startedAt?: string }>({ isLive: false });

  /**
   * Load message history from API
   */
  const loadMessageHistory = useCallback(async (looproomId: string) => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/looprooms/${looproomId}/messages?limit=50`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data?.messages) {
          const historyMessages: Message[] = result.data.messages.map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            userId: msg.userId || msg.user?.id,
            userName: msg.user?.name || "Unknown",
            userType: msg.user?.type || "user",
            timestamp: msg.createdAt,
            type: msg.type || "message",
            reactions: msg.reactions || {},
          }));
          
          setMessages(historyMessages);
          console.log(`Loaded ${historyMessages.length} messages from history`);
        }
      }
    } catch (error) {
      console.error("Error loading message history:", error);
    }
  }, []);

  /**
   * Join a looproom
   */
  const joinLooproom = useCallback((data: JoinLooproomData): Promise<{ success: boolean; data?: LooproomData; error?: string }> => {
    return new Promise((resolve) => {
      if (!socket || !isConnected) {
        resolve({ success: false, error: 'Not connected to server' });
        return;
      }

      socket.emit('join-looproom', data, async (response: any) => {
        if (response.success) {
          setIsInRoom(true);
          setParticipants(response.data.participants || []);
          setParticipantCount(response.data.participantCount || 0);
          
          // Load message history after joining
          await loadMessageHistory(data.looproomId);
        }
        resolve(response);
      });
    });
  }, [socket, isConnected, loadMessageHistory]);

  /**
   * Leave a looproom
   */
  const leaveLooproom = useCallback((looproomId: string): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      if (!socket || !isConnected) {
        resolve({ success: false, error: 'Not connected to server' });
        return;
      }

      socket.emit('leave-looproom', { looproomId }, (response: any) => {
        if (response.success) {
          setIsInRoom(false);
          setMessages([]);
          setParticipants([]);
          setParticipantCount(0);
        }
        resolve(response);
      });
    });
  }, [socket, isConnected]);

  /**
   * Send a message
   */
  const sendMessage = useCallback((data: SendMessageData): Promise<{ success: boolean; data?: Message; error?: string }> => {
    return new Promise((resolve) => {
      if (!socket || !isConnected) {
        resolve({ success: false, error: 'Not connected to server' });
        return;
      }

      socket.emit('send-message', data, (response: any) => {
        resolve(response);
      });
    });
  }, [socket, isConnected]);

  /**
   * Send typing indicator
   */
  const sendTyping = useCallback((data: TypingData) => {
    if (!socket || !isConnected) return;
    socket.emit('typing', data);
  }, [socket, isConnected]);

  /**
   * React to a message
   */
  const reactToMessage = useCallback((data: ReactToMessageData): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      if (!socket || !isConnected) {
        resolve({ success: false, error: 'Not connected to server' });
        return;
      }

      socket.emit('react-to-message', data, (response: any) => {
        resolve(response);
      });
    });
  }, [socket, isConnected]);

  // Listen for socket events
  useEffect(() => {
    if (!socket) return;

    // New message received
    socket.on('new-message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    // User joined
    socket.on('user-joined', (data: any) => {
      setParticipantCount(data.participantCount);
      // Add system message
      const systemMessage: Message = {
        id: `system-${Date.now()}`,
        content: `${data.name} joined the room`,
        userId: 0,
        userName: 'System',
        userType: 'system',
        timestamp: data.timestamp,
        type: 'system'
      };
      setMessages((prev) => [...prev, systemMessage]);
    });

    // User left
    socket.on('user-left', (data: any) => {
      setParticipantCount(data.participantCount);
      // Add system message
      const systemMessage: Message = {
        id: `system-${Date.now()}`,
        content: `${data.name} left the room`,
        userId: 0,
        userName: 'System',
        userType: 'system',
        timestamp: data.timestamp,
        type: 'system'
      };
      setMessages((prev) => [...prev, systemMessage]);
    });

    // Participants updated (real-time participant list sync)
    socket.on('participants-updated', (data: any) => {
      setParticipants(data.participants || []);
      setParticipantCount(data.participantCount || 0);
    });

    // User typing
    socket.on('user-typing', (data: any) => {
      if (data.isTyping) {
        setTypingUsers((prev) => new Set(prev).add(data.name));
      } else {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(data.name);
          return newSet;
        });
      }
    });

    // Message deleted
    socket.on('message-deleted', (data: any) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId
            ? { ...msg, content: '[Message deleted]', type: 'system' as const }
            : msg
        )
      );
    });

    // Message pinned
    socket.on('message-pinned', (data: any) => {
      // Handle pinned message UI update
      console.log('Message pinned:', data);
    });

    // Message reaction updated
    socket.on('message-reaction-updated', (data: any) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId
            ? { ...msg, reactions: data.reactions }
            : msg
        )
      );
    });

    // Session started
    socket.on('session-started', (data: any) => {
      setSessionState({ isLive: true, startedAt: data.startedAt });
      const systemMessage: Message = {
        id: `system-${Date.now()}`,
        content: `${data.creatorName} started the session`,
        userId: 0,
        userName: 'System',
        userType: 'system',
        timestamp: data.startedAt,
        type: 'system'
      };
      setMessages((prev) => [...prev, systemMessage]);
    });

    // Session ended
    socket.on('session-ended', (data: any) => {
      setSessionState({ isLive: false, startedAt: undefined });
      const systemMessage: Message = {
        id: `system-${Date.now()}`,
        content: 'Session has ended',
        userId: 0,
        userName: 'System',
        userType: 'system',
        timestamp: data.endedAt,
        type: 'system'
      };
      setMessages((prev) => [...prev, systemMessage]);
    });

    // Stream updated
    socket.on('stream-updated', (data: any) => {
      console.log('Stream updated:', data.streamUrl);
    });

    // User moderated
    socket.on('user-moderated', (data: any) => {
      const systemMessage: Message = {
        id: `system-${Date.now()}`,
        content: `A user was ${data.action}`,
        userId: 0,
        userName: 'System',
        userType: 'system',
        timestamp: data.timestamp,
        type: 'system'
      };
      setMessages((prev) => [...prev, systemMessage]);
    });

    // Kicked from room
    socket.on('kicked-from-room', (data: any) => {
      setIsInRoom(false);
      alert(`You were kicked from the room. Reason: ${data.reason || 'No reason provided'}`);
    });

    // Banned from room
    socket.on('banned-from-room', (data: any) => {
      setIsInRoom(false);
      alert(`You were banned from the room. Reason: ${data.reason || 'No reason provided'}`);
    });

    // Cleanup
    return () => {
      socket.off('new-message');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('participants-updated');
      socket.off('user-typing');
      socket.off('message-deleted');
      socket.off('message-pinned');
      socket.off('message-reaction-updated');
      socket.off('session-started');
      socket.off('session-ended');
      socket.off('stream-updated');
      socket.off('user-moderated');
      socket.off('kicked-from-room');
      socket.off('banned-from-room');
    };
  }, [socket]);

  return {
    // State
    messages,
    participants,
    participantCount,
    isInRoom,
    typingUsers: Array.from(typingUsers),
    isConnected,
    sessionState,

    // Actions
    joinLooproom,
    leaveLooproom,
    sendMessage,
    sendTyping,
    reactToMessage,
    loadMessageHistory,
  };
}
