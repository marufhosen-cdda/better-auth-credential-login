// types.ts - Type definitions for VideoSDK components

export interface VideoSDKComponentsProps {
    meetingId: string;
    authToken: string;
    userName: string;
    onMeetingLeave: () => void;
}

export interface ParticipantViewProps {
    participantId: string;
}

export interface PresenterViewProps {
    presenterId: string;
}

export interface MeetingViewProps {
    meetingId: string;
    onMeetingLeave: () => void;
    userName: string;
}

export interface MeetingConfig {
    meetingId: string;
    micEnabled: boolean;
    webcamEnabled: boolean;
    name: string;
}

export interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    message: string;
    timestamp: number;
}

export interface HandRaiseEvent {
    id: string;
    senderId: string;
    senderName: string;
    timestamp: number;
}

export interface ToggleState {
    mic: boolean;
    webcam: boolean;
    screen: boolean;
}