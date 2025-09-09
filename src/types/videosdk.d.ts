// types/videosdk.d.ts
declare module '@videosdk.live/react-sdk' {
    import { ReactNode } from 'react';

    // Meeting Provider Props
    interface MeetingConfig {
        meetingId: string;
        micEnabled?: boolean;
        webcamEnabled?: boolean;
        name: string;
        participantId?: string;
        mode?: 'CONFERENCE' | 'VIEWER';
    }

    interface MeetingProviderProps {
        config: MeetingConfig;
        token: string;
        children: ReactNode;
    }

    // Stream interfaces
    interface MediaStream {
        track: MediaStreamTrack;
        consumer?: any;
        codec?: string;
        id: string;
    }

    // Participant interface
    interface Participant {
        id: string;
        displayName: string;
        webcamOn: boolean;
        micOn: boolean;
        isLocal: boolean;
        webcamStream?: MediaStream;
        micStream?: MediaStream;
        screenShareStream?: MediaStream;
        screenShareOn?: boolean;
        mode?: string;
    }

    // Meeting hook return type
    interface UseMeetingReturn {
        meetingId: string;
        meeting?: any;
        localParticipant?: Participant;
        participants: Map<string, Participant>;
        join: () => void;
        leave: () => void;
        toggleMic: () => Promise<void>;
        toggleWebcam: () => Promise<void>;
        enableScreenShare: () => Promise<void>;
        disableScreenShare: () => Promise<void>;
        localMicOn: boolean;
        localWebcamOn: boolean;
        localScreenShareOn: boolean;
        messages: any[];
        startRecording: (config?: any) => void;
        stopRecording: () => void;
        sendChatMessage: (message: string) => void;
    }

    // Meeting hook options
    interface UseMeetingOptions {
        onMeetingJoined?: () => void;
        onMeetingLeft?: () => void;
        onParticipantJoined?: (participant: Participant) => void;
        onParticipantLeft?: (participant: Participant) => void;
        onSpeakerChanged?: (participantId: string) => void;
        onPresenterChanged?: (participantId: string) => void;
        onMainParticipantChanged?: (participantId: string) => void;
        onEntryRequested?: (data: any) => void;
        onEntryResponded?: (participantId: string, decision: string) => void;
        onRecordingStarted?: () => void;
        onRecordingStopped?: () => void;
        onChatMessage?: (data: any) => void;
        onMeetingIdChanged?: (data: any) => void;
        onMicRequested?: (data: any) => void;
        onWebcamRequested?: (data: any) => void;
        onError?: (data: any) => void;
    }

    // Participant hook return type
    interface UseParticipantReturn {
        displayName: string;
        participantId: string;
        webcamOn: boolean;
        micOn: boolean;
        screenShareOn: boolean;
        isLocal: boolean;
        webcamStream?: MediaStream;
        micStream?: MediaStream;
        screenShareStream?: MediaStream;
        mode: string;
        enableMic: () => void;
        disableMic: () => void;
        enableWebcam: () => void;
        disableWebcam: () => void;
        pin: () => void;
        unpin: () => void;
        setQuality: (quality: string) => void;
        remove: () => void;
    }

    // VideoPlayer props
    interface VideoPlayerProps {
        participantId: string;
        type?: 'video' | 'audio';
        containerStyle?: React.CSSProperties;
        videoStyle?: React.CSSProperties;
        className?: string;
        classNameVideo?: string;
        [key: string]: any;
    }

    // Constants
    export const Constants: {
        modes: {
            CONFERENCE: 'CONFERENCE';
            VIEWER: 'VIEWER';
        };
        events: {
            MEETING_JOINED: 'meeting-joined';
            MEETING_LEFT: 'meeting-left';
            PARTICIPANT_JOINED: 'participant-joined';
            PARTICIPANT_LEFT: 'participant-left';
            // Add more events as needed
        };
    };

    // Exported components and hooks
    export const MeetingProvider: React.FC<MeetingProviderProps>;
    export const MeetingConsumer: React.Consumer<any>;
    export const VideoPlayer: React.FC<VideoPlayerProps>;

    export function useMeeting(options?: UseMeetingOptions): UseMeetingReturn;
    export function useParticipant(participantId: string): UseParticipantReturn;
    export function usePubSub(topic: string): {
        publish: (message: any, options?: any) => void;
        messages: any[];
    };
}

// Global type extensions
declare global {
    interface Window {
        webkitAudioContext?: typeof AudioContext;
    }
}