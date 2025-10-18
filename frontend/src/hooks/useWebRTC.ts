"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import SimplePeer from 'simple-peer';
import { useSocket } from '@/contexts/SocketContext';

interface UseWebRTCProps {
  looproomId: string;
  isCreator: boolean;
}

interface PeerConnection {
  peer: SimplePeer.Instance;
  userId: number;
}

// Use SimplePeer's SignalData type
type WebRTCSignal = SimplePeer.SignalData;

export function useWebRTC({ looproomId, isCreator }: UseWebRTCProps) {
  const { socket, isConnected } = useSocket();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'disconnected'>('disconnected');
  
  const peerRef = useRef<SimplePeer.Instance | null>(null);
  const peersRef = useRef<Map<number, PeerConnection>>(new Map());

  // ICE servers configuration - memoized to prevent recreation
  const iceServers = useMemo(() => ({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  }), []);

  /**
   * Start broadcasting (Creator only)
   */
  const startBroadcast = useCallback(async (stream: MediaStream) => {
    if (!isCreator || !socket || !isConnected) {
      console.error('Cannot start broadcast: not creator or not connected');
      return false;
    }

    try {
      setLocalStream(stream);
      setIsBroadcasting(true);

      // Notify server that broadcast is starting
      socket.emit('start-broadcast', {
        looproomId,
        streamConfig: {
          video: stream.getVideoTracks()[0]?.getSettings(),
          audio: stream.getAudioTracks()[0]?.getSettings(),
        },
      });

      console.log('✅ Broadcast started');
      return true;
    } catch (error) {
      console.error('Error starting broadcast:', error);
      setIsBroadcasting(false);
      return false;
    }
  }, [isCreator, socket, isConnected, looproomId]);

  /**
   * Stop broadcasting
   */
  const stopBroadcast = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    // Close all peer connections
    peersRef.current.forEach(({ peer }) => {
      peer.destroy();
    });
    peersRef.current.clear();

    setIsBroadcasting(false);

    if (socket && isConnected) {
      socket.emit('stop-broadcast', { looproomId });
    }

    console.log('🛑 Broadcast stopped');
  }, [localStream, socket, isConnected, looproomId]);

  /**
   * Create peer connection for a viewer (Creator side)
   */
  const createPeerForViewer = useCallback((viewerId: number) => {
    if (!localStream) {
      console.error('No local stream available');
      return;
    }

    const peer = new SimplePeer({
      initiator: true,
      trickle: true,
      stream: localStream,
      config: iceServers,
    });

    peer.on('signal', (signal) => {
      socket?.emit('webrtc-offer', {
        looproomId,
        targetUserId: viewerId,
        offer: signal,
      });
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
      peersRef.current.delete(viewerId);
    });

    peer.on('close', () => {
      console.log(`Peer connection closed for viewer ${viewerId}`);
      peersRef.current.delete(viewerId);
    });

    peersRef.current.set(viewerId, { peer, userId: viewerId });
    console.log(`Created peer for viewer ${viewerId}`);
  }, [localStream, socket, looproomId, iceServers]);

  /**
   * Join as viewer and receive stream
   */
  const joinAsViewer = useCallback(() => {
    if (isCreator || !socket || !isConnected) {
      return;
    }

    // Request to join stream
    socket.emit('request-stream', { looproomId });
    setIsReceiving(true);
    console.log('📺 Requesting stream...');
  }, [isCreator, socket, isConnected, looproomId]);

  /**
   * Handle incoming WebRTC offer (Viewer side)
   */
  const handleOffer = useCallback((offer: WebRTCSignal) => {
    if (isCreator) return;

    const peer = new SimplePeer({
      initiator: false,
      trickle: true,
      config: iceServers,
    });

    peer.on('signal', (signal) => {
      socket?.emit('webrtc-answer', {
        looproomId,
        answer: signal,
      });
    });

    peer.on('stream', (stream) => {
      console.log('✅ Received remote stream');
      setRemoteStream(stream);
      setConnectionQuality('excellent');
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
      setConnectionQuality('disconnected');
    });

    peer.on('close', () => {
      console.log('Peer connection closed');
      setRemoteStream(null);
      setConnectionQuality('disconnected');
    });

    peer.signal(offer);
    peerRef.current = peer;
  }, [isCreator, socket, looproomId, iceServers]);

  /**
   * Handle incoming WebRTC answer (Creator side)
   */
  const handleAnswer = useCallback((answer: WebRTCSignal, viewerId: number) => {
    const peerConnection = peersRef.current.get(viewerId);
    if (peerConnection) {
      peerConnection.peer.signal(answer);
      console.log(`Received answer from viewer ${viewerId}`);
    }
  }, []);

  /**
   * Handle ICE candidate
   */
  const handleIceCandidate = useCallback((candidate: WebRTCSignal, userId?: number) => {
    if (isCreator && userId) {
      const peerConnection = peersRef.current.get(userId);
      if (peerConnection) {
        peerConnection.peer.signal(candidate);
      }
    } else if (!isCreator && peerRef.current) {
      peerRef.current.signal(candidate);
    }
  }, [isCreator]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Copy peers ref for cleanup
    const currentPeers = peersRef.current;

    // Creator events
    if (isCreator) {
      socket.on('viewer-joined-stream', (data: { userId: number }) => {
        console.log(`Viewer ${data.userId} joined stream`);
        createPeerForViewer(data.userId);
      });

      socket.on('webrtc-answer', (data: { answer: WebRTCSignal; userId: number }) => {
        handleAnswer(data.answer, data.userId);
      });
    }
    // Viewer events
    else {
      socket.on('webrtc-offer', (data: { offer: WebRTCSignal }) => {
        handleOffer(data.offer);
      });
    }

    // Common events
    socket.on('ice-candidate', (data: { candidate: WebRTCSignal; userId?: number }) => {
      handleIceCandidate(data.candidate, data.userId);
    });

    socket.on('broadcast-ended', () => {
      console.log('Broadcast ended by creator');
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
      setRemoteStream(null);
      setIsReceiving(false);
      setConnectionQuality('disconnected');
    });

    return () => {
      socket.off('viewer-joined-stream');
      socket.off('webrtc-offer');
      socket.off('webrtc-answer');
      socket.off('ice-candidate');
      socket.off('broadcast-ended');
      
      // Cleanup peers using copied ref
      currentPeers.forEach(({ peer }) => {
        peer.destroy();
      });
      currentPeers.clear();
    };
  }, [socket, isCreator, createPeerForViewer, handleOffer, handleAnswer, handleIceCandidate]);

  // Cleanup on unmount
  useEffect(() => {
    // Copy refs to variables for cleanup
    const currentPeer = peerRef.current;
    const currentPeers = peersRef.current;
    
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (currentPeer) {
        currentPeer.destroy();
      }
      currentPeers.forEach(({ peer }) => {
        peer.destroy();
      });
      currentPeers.clear();
    };
  }, [localStream]);

  return {
    localStream,
    remoteStream,
    isBroadcasting,
    isReceiving,
    connectionQuality,
    startBroadcast,
    stopBroadcast,
    joinAsViewer,
  };
}
