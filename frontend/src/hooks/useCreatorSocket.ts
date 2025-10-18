"use client";

import { useCallback } from 'react';
import { useSocket } from '@/contexts/SocketContext';

interface StartSessionData {
  looproomId: string;
  streamUrl?: string;
}

interface EndSessionData {
  looproomId: string;
}

interface ModerateUserData {
  looproomId: string;
  targetUserId: number;
  action: 'mute' | 'unmute' | 'kick' | 'ban' | 'unban';
  reason?: string;
  duration?: number; // in minutes
}

interface DeleteMessageData {
  messageId: string;
  looproomId: string;
}

interface PinMessageData {
  messageId: string;
  looproomId: string;
}

interface SendAnnouncementData {
  looproomId: string;
  content: string;
}

interface UpdateStreamData {
  looproomId: string;
  streamUrl: string;
}

export function useCreatorSocket() {
  const { socket, isConnected } = useSocket();

  /**
   * Start a looproom session
   */
  const startSession = useCallback((data: StartSessionData): Promise<{ success: boolean; data?: any; error?: string }> => {
    return new Promise((resolve) => {
      if (!socket || !isConnected) {
        resolve({ success: false, error: 'Not connected to server' });
        return;
      }

      socket.emit('start-session', data, (response: any) => {
        resolve(response);
      });
    });
  }, [socket, isConnected]);

  /**
   * End a looproom session
   */
  const endSession = useCallback((data: EndSessionData): Promise<{ success: boolean; data?: any; error?: string }> => {
    return new Promise((resolve) => {
      if (!socket || !isConnected) {
        resolve({ success: false, error: 'Not connected to server' });
        return;
      }

      socket.emit('end-session', data, (response: any) => {
        resolve(response);
      });
    });
  }, [socket, isConnected]);

  /**
   * Pause a session
   */
  const pauseSession = useCallback((looproomId: string): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      if (!socket || !isConnected) {
        resolve({ success: false, error: 'Not connected to server' });
        return;
      }

      socket.emit('pause-session', { looproomId }, (response: any) => {
        resolve(response);
      });
    });
  }, [socket, isConnected]);

  /**
   * Resume a session
   */
  const resumeSession = useCallback((looproomId: string): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      if (!socket || !isConnected) {
        resolve({ success: false, error: 'Not connected to server' });
        return;
      }

      socket.emit('resume-session', { looproomId }, (response: any) => {
        resolve(response);
      });
    });
  }, [socket, isConnected]);

  /**
   * Update stream URL
   */
  const updateStream = useCallback((data: UpdateStreamData): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      if (!socket || !isConnected) {
        resolve({ success: false, error: 'Not connected to server' });
        return;
      }

      socket.emit('update-stream', data, (response: any) => {
        resolve(response);
      });
    });
  }, [socket, isConnected]);

  /**
   * Moderate a user
   */
  const moderateUser = useCallback((data: ModerateUserData): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      if (!socket || !isConnected) {
        resolve({ success: false, error: 'Not connected to server' });
        return;
      }

      socket.emit('moderate-user', data, (response: any) => {
        resolve(response);
      });
    });
  }, [socket, isConnected]);

  /**
   * Delete a message
   */
  const deleteMessage = useCallback((data: DeleteMessageData): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      if (!socket || !isConnected) {
        resolve({ success: false, error: 'Not connected to server' });
        return;
      }

      socket.emit('delete-message', data, (response: any) => {
        resolve(response);
      });
    });
  }, [socket, isConnected]);

  /**
   * Pin a message
   */
  const pinMessage = useCallback((data: PinMessageData): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      if (!socket || !isConnected) {
        resolve({ success: false, error: 'Not connected to server' });
        return;
      }

      socket.emit('pin-message', data, (response: any) => {
        resolve(response);
      });
    });
  }, [socket, isConnected]);

  /**
   * Send an announcement
   */
  const sendAnnouncement = useCallback((data: SendAnnouncementData): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      if (!socket || !isConnected) {
        resolve({ success: false, error: 'Not connected to server' });
        return;
      }

      socket.emit('send-announcement', data, (response: any) => {
        resolve(response);
      });
    });
  }, [socket, isConnected]);

  return {
    isConnected,
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    updateStream,
    moderateUser,
    deleteMessage,
    pinMessage,
    sendAnnouncement,
  };
}
