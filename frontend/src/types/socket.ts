/**
 * Socket.IO Event Types and Payloads
 * Defines all socket events and their data structures
 */

// ==================== LOOPROOM EVENTS ====================

export interface JoinLooproomData {
  looproomId: string;
  mood: string;
}

export interface JoinLooproomResponse {
  success: boolean;
  error?: string;
  data?: {
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
    participants: ParticipantData[];
  };
}

export interface LeaveLooproomData {
  looproomId: string;
}

export interface SendMessageData {
  looproomId: string;
  content: string;
}

export interface SendMessageResponse {
  success: boolean;
  error?: string;
  data?: MessageData;
}

export interface TypingData {
  looproomId: string;
  isTyping: boolean;
}

export interface ReactToMessageData {
  messageId: string;
  emoji: string;
}

export interface ReactToMessageResponse {
  success: boolean;
  error?: string;
  data?: {
    reactions: Record<string, number[]>;
  };
}

// ==================== CREATOR EVENTS ====================

export interface StartSessionData {
  looproomId: string;
  streamUrl?: string;
}

export interface StartSessionResponse {
  success: boolean;
  error?: string;
  data?: {
    sessionId: string;
    startedAt: string;
  };
}

export interface EndSessionData {
  looproomId: string;
}

export interface EndSessionResponse {
  success: boolean;
  error?: string;
  data?: {
    sessionId: string;
    endedAt: string;
    duration: number;
    stats: SessionStats;
  };
}

export interface UpdateStreamData {
  looproomId: string;
  streamUrl: string;
}

export interface ModerateUserData {
  looproomId: string;
  targetUserId: number;
  action: 'mute' | 'unmute' | 'kick' | 'ban' | 'unban' | 'warn' | 'promote';
  reason?: string;
  duration?: number; // in minutes
}

export interface ModerateUserResponse {
  success: boolean;
  error?: string;
  data?: {
    action: string;
    targetUserId: number;
    expiresAt?: string;
  };
}

export interface DeleteMessageData {
  messageId: string;
  looproomId: string;
}

export interface PinMessageData {
  messageId: string;
  looproomId: string;
}

export interface SendAnnouncementData {
  looproomId: string;
  content: string;
}

// ==================== BROADCAST EVENTS ====================

export interface UserJoinedEvent {
  userId: number;
  name: string;
  mood: string;
  participantCount: number;
  timestamp: string;
}

export interface UserLeftEvent {
  userId: number;
  name: string;
  participantCount: number;
  timestamp: string;
}

export interface NewMessageEvent {
  id: string;
  content: string;
  userId: number;
  userName: string;
  userType: string;
  timestamp: string;
  type: 'message' | 'system' | 'announcement';
}

export interface UserTypingEvent {
  userId: number;
  name: string;
  isTyping: boolean;
}

export interface MessageReactionUpdatedEvent {
  messageId: string;
  reactions: Record<string, number[]>;
  userId: number;
  emoji: string;
}

export interface SessionStartedEvent {
  sessionId: string;
  startedAt: string;
  streamUrl?: string;
  message: string;
}

export interface SessionEndedEvent {
  sessionId: string;
  endedAt: string;
  duration: number;
  message: string;
}

export interface SessionPausedEvent {
  message: string;
}

export interface SessionResumedEvent {
  message: string;
}

export interface StreamUpdatedEvent {
  streamUrl: string;
  message: string;
}

export interface UserModeratedEvent {
  userId: number;
  action: string;
  moderatorId: number;
  expiresAt?: string;
}

export interface ModerationActionEvent {
  action: string;
  reason?: string;
  looproomId: string;
}

export interface MessageDeletedEvent {
  messageId: string;
  deletedBy: number;
}

export interface MessagePinnedEvent {
  messageId: string;
  content: string;
  userId: number;
  pinnedBy: number;
}

export interface SettingsUpdatedEvent {
  chatEnabled?: boolean;
  slowModeSeconds?: number;
  maxParticipants?: number;
}

export interface AnnouncementEvent {
  content: string;
  creatorName: string;
  timestamp: string;
}

// ==================== DATA STRUCTURES ====================

export interface ParticipantData {
  socketId: string;
  userId: number;
  name: string;
  mood?: string;
  joinedAt: number;
}

export interface MessageData {
  id: string;
  content: string;
  userId: number;
  userName: string;
  userType: string;
  timestamp: string;
  type: 'message' | 'system' | 'announcement';
  reactions?: Record<string, number[]>;
  isPinned?: boolean;
  isDeleted?: boolean;
}

export interface SessionStats {
  peakParticipants: number;
  totalMessages: number;
  duration: number;
}

// ==================== SOCKET EVENT NAMES ====================

export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  ERROR: 'error',

  // Looproom Events (Client -> Server)
  JOIN_LOOPROOM: 'join-looproom',
  LEAVE_LOOPROOM: 'leave-looproom',
  SEND_MESSAGE: 'send-message',
  TYPING: 'typing',
  REACT_TO_MESSAGE: 'react-to-message',

  // Creator Events (Client -> Server)
  START_SESSION: 'start-session',
  END_SESSION: 'end-session',
  PAUSE_SESSION: 'pause-session',
  RESUME_SESSION: 'resume-session',
  UPDATE_STREAM: 'update-stream',
  MODERATE_USER: 'moderate-user',
  DELETE_MESSAGE: 'delete-message',
  PIN_MESSAGE: 'pin-message',
  SEND_ANNOUNCEMENT: 'send-announcement',

  // Broadcast Events (Server -> Client)
  USER_JOINED: 'user-joined',
  USER_LEFT: 'user-left',
  NEW_MESSAGE: 'new-message',
  USER_TYPING: 'user-typing',
  MESSAGE_REACTION_UPDATED: 'message-reaction-updated',
  SESSION_STARTED: 'session-started',
  SESSION_ENDED: 'session-ended',
  SESSION_PAUSED: 'session-paused',
  SESSION_RESUMED: 'session-resumed',
  STREAM_UPDATED: 'stream-updated',
  USER_MODERATED: 'user-moderated',
  MODERATION_ACTION: 'moderation-action',
  MESSAGE_DELETED: 'message-deleted',
  MESSAGE_PINNED: 'message-pinned',
  SETTINGS_UPDATED: 'settings-updated',
  ANNOUNCEMENT: 'announcement',
} as const;

export type SocketEventName = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];
