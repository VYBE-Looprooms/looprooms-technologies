// WebRTC Types and Quality Presets

export interface StreamQuality {
  label: string;
  width: number;
  height: number;
  frameRate: number;
  bitrate: number; // kbps
}

export const QUALITY_PRESETS: Record<string, StreamQuality> = {
  '720p30': {
    label: '720p @ 30fps',
    width: 1280,
    height: 720,
    frameRate: 30,
    bitrate: 2500,
  },
  '720p60': {
    label: '720p @ 60fps',
    width: 1280,
    height: 720,
    frameRate: 60,
    bitrate: 4000,
  },
  '1080p30': {
    label: '1080p @ 30fps',
    width: 1920,
    height: 1080,
    frameRate: 30,
    bitrate: 4500,
  },
  '1080p60': {
    label: '1080p @ 60fps',
    width: 1920,
    height: 1080,
    frameRate: 60,
    bitrate: 6000,
  },
  '1440p30': {
    label: '1440p @ 30fps',
    width: 2560,
    height: 1440,
    frameRate: 30,
    bitrate: 9000,
  },
  '1440p60': {
    label: '1440p @ 60fps',
    width: 2560,
    height: 1440,
    frameRate: 60,
    bitrate: 13000,
  },
};

export const VIEWER_QUALITIES: Record<string, string> = {
  'auto': 'Auto (recommended)',
  '1080p': '1080p (Full HD)',
  '720p': '720p (HD)',
  '480p': '480p (SD)',
  '360p': '360p (Low)',
};

export interface MediaDeviceInfo {
  deviceId: string;
  label: string;
  kind: 'videoinput' | 'audioinput';
}

export interface BroadcastConfig {
  quality: string;
  videoDeviceId?: string;
  audioDeviceId?: string;
  sourceType: 'camera' | 'screen';
}

export interface WebRTCSignal {
  type: 'offer' | 'answer';
  sdp: string;
}

export interface ICECandidate {
  candidate: string;
  sdpMLineIndex: number | null;
  sdpMid: string | null;
}
