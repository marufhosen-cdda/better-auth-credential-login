// app/video-meeting/VideoSDKComponents.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState, useCallback, JSX } from "react";
import {
    MeetingProvider,
    useMeeting,
    useParticipant,
    VideoPlayer,
} from "@videosdk.live/react-sdk";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff, Monitor, MonitorOff, Copy, Users } from "lucide-react";
import { toast } from "sonner";

// Types
interface VideoSDKComponentsProps {
    meetingId: string;
    authToken: string;
    userName: string;
    onMeetingLeave: () => void;
}

interface ParticipantViewProps {
    participantId: string;
}

interface MeetingViewProps {
    meetingId: string;
    onMeetingLeave: () => void;
    userName: string;
}

interface MeetingConfig {
    meetingId: string;
    micEnabled: boolean;
    webcamEnabled: boolean;
    name: string;
}

// Participant View Component
function ParticipantView({ participantId }: ParticipantViewProps): JSX.Element {
    const micRef = useRef<HTMLAudioElement>(null);
    const {
        micStream,
        webcamOn,
        micOn,
        isLocal,
        displayName,
        webcamStream
    } = useParticipant(participantId);

    useEffect(() => {
        if (micRef.current) {
            if (micOn && micStream) {
                const mediaStream = new MediaStream();
                mediaStream.addTrack(micStream.track);
                micRef.current.srcObject = mediaStream;
                micRef.current
                    .play()
                    .catch((error: Error) =>
                        console.error("Audio play failed", error)
                    );
            } else {
                micRef.current.srcObject = null;
            }
        }
    }, [micStream, micOn]);

    return (
        <Card className="relative overflow-hidden bg-gray-900 border-0 shadow-lg">
            <CardContent className="p-0 aspect-video relative">
                {webcamOn && webcamStream ? (
                    <VideoPlayer
                        participantId={participantId}
                        type="video"
                        containerStyle={{
                            height: "100%",
                            width: "100%",
                        }}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <div className="text-center">
                            <Avatar className="w-20 h-20 mx-auto mb-3">
                                <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                                    {displayName?.charAt(0)?.toUpperCase() || "P"}
                                </AvatarFallback>
                            </Avatar>
                            <p className="text-white text-sm opacity-75">{displayName}</p>
                        </div>
                    </div>
                )}

                {/* Participant info overlay */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <Badge
                        variant={isLocal ? "default" : "secondary"}
                        className={`text-xs ${isLocal ? 'bg-blue-600' : 'bg-black/50 text-white border-white/20'}`}
                    >
                        {displayName} {isLocal && "(You)"}
                    </Badge>
                    <div className="flex gap-1">
                        {micOn ? (
                            <div className="bg-green-500 rounded-full p-1">
                                <Mic className="w-3 h-3 text-white" />
                            </div>
                        ) : (
                            <div className="bg-red-500 rounded-full p-1">
                                <MicOff className="w-3 h-3 text-white" />
                            </div>
                        )}
                        {webcamOn ? (
                            <div className="bg-green-500 rounded-full p-1">
                                <Video className="w-3 h-3 text-white" />
                            </div>
                        ) : (
                            <div className="bg-red-500 rounded-full p-1">
                                <VideoOff className="w-3 h-3 text-white" />
                            </div>
                        )}
                    </div>
                </div>

                <audio ref={micRef} autoPlay playsInline muted={isLocal} />
            </CardContent>
        </Card>
    );
}

// Controls Component with fixed toggle functionality
function Controls(): JSX.Element {
    const {
        leave,
        toggleMic,
        toggleWebcam,
        enableScreenShare,
        disableScreenShare,
        localMicOn,
        localWebcamOn,
        localScreenShareOn
    } = useMeeting();

    const [isToggling, setIsToggling] = useState<{
        mic: boolean;
        webcam: boolean;
        screen: boolean;
    }>({
        mic: false,
        webcam: false,
        screen: false
    });

    const handleMicToggle = useCallback(async (): Promise<void> => {
        if (isToggling.mic) return;

        setIsToggling(prev => ({ ...prev, mic: true }));
        try {
            await toggleMic();
            toast.success(localMicOn ? "Microphone muted" : "Microphone unmuted");
        } catch (error) {
            console.error("Failed to toggle microphone:", error);
            toast.error("Failed to toggle microphone");
        } finally {
            setIsToggling(prev => ({ ...prev, mic: false }));
        }
    }, [toggleMic, localMicOn, isToggling.mic]);

    const handleWebcamToggle = useCallback(async (): Promise<void> => {
        if (isToggling.webcam) return;

        setIsToggling(prev => ({ ...prev, webcam: true }));
        try {
            await toggleWebcam();
            toast.success(localWebcamOn ? "Camera turned off" : "Camera turned on");
        } catch (error) {
            console.error("Failed to toggle camera:", error);
            toast.error("Failed to toggle camera");
        } finally {
            setIsToggling(prev => ({ ...prev, webcam: false }));
        }
    }, [toggleWebcam, localWebcamOn, isToggling.webcam]);

    const handleScreenShare = useCallback(async (): Promise<void> => {
        if (isToggling.screen) return;

        setIsToggling(prev => ({ ...prev, screen: true }));
        try {
            if (localScreenShareOn) {
                await disableScreenShare();
                toast.info("Screen sharing stopped");
            } else {
                await enableScreenShare();
                toast.success("Screen sharing started");
            }
        } catch (error) {
            console.error("Failed to toggle screen share:", error);
            toast.error("Failed to toggle screen sharing");
        } finally {
            setIsToggling(prev => ({ ...prev, screen: false }));
        }
    }, [localScreenShareOn, disableScreenShare, enableScreenShare, isToggling.screen]);

    const handleLeave = useCallback((): void => {
        if (window.confirm("Are you sure you want to leave the meeting?")) {
            leave();
        }
    }, [leave]);

    return (
        <div className="bg-white/90 backdrop-blur-sm border-t border-gray-200 p-4">
            <div className="flex items-center justify-center gap-3">
                <Button
                    onClick={handleMicToggle}
                    variant={localMicOn ? "default" : "destructive"}
                    size="icon"
                    className="rounded-full w-12 h-12 transition-all hover:scale-105"
                    disabled={isToggling.mic}
                >
                    {isToggling.mic ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    ) : localMicOn ? (
                        <Mic className="w-5 h-5" />
                    ) : (
                        <MicOff className="w-5 h-5" />
                    )}
                </Button>

                <Button
                    onClick={handleWebcamToggle}
                    variant={localWebcamOn ? "default" : "destructive"}
                    size="icon"
                    className="rounded-full w-12 h-12 transition-all hover:scale-105"
                    disabled={isToggling.webcam}
                >
                    {isToggling.webcam ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    ) : localWebcamOn ? (
                        <Video className="w-5 h-5" />
                    ) : (
                        <VideoOff className="w-5 h-5" />
                    )}
                </Button>

                <Button
                    onClick={handleScreenShare}
                    variant={localScreenShareOn ? "default" : "outline"}
                    size="icon"
                    className="rounded-full w-12 h-12 transition-all hover:scale-105"
                    disabled={isToggling.screen}
                >
                    {isToggling.screen ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent" />
                    ) : localScreenShareOn ? (
                        <MonitorOff className="w-5 h-5" />
                    ) : (
                        <Monitor className="w-5 h-5" />
                    )}
                </Button>

                <Button
                    onClick={handleLeave}
                    variant="destructive"
                    size="icon"
                    className="rounded-full w-12 h-12 transition-all hover:scale-105"
                >
                    <PhoneOff className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
}

// Meeting View Component
function MeetingView({ meetingId, onMeetingLeave, userName }: MeetingViewProps): JSX.Element {
    const [joined, setJoined] = useState<string | null>(null);
    const [participantCount, setParticipantCount] = useState<number>(0);

    const { join, participants, localParticipant } = useMeeting({
        onMeetingJoined: () => {
            setJoined("JOINED");
            toast.success("Successfully joined the meeting!");
        },
        onMeetingLeft: () => {
            onMeetingLeave();
            toast.info("Left the meeting");
        },
        onParticipantJoined: (participant: any) => {
            toast.success(`${participant.displayName} joined the meeting`);
            setParticipantCount(prev => prev + 1);
        },
        onParticipantLeft: (participant: any) => {
            toast.info(`${participant.displayName} left the meeting`);
            setParticipantCount(prev => Math.max(0, prev - 1));
        },
    });

    const joinMeeting = useCallback((): void => {
        setJoined("JOINING");
        join();
    }, [join]);

    const copyMeetingId = useCallback((): void => {
        navigator.clipboard.writeText(meetingId);
        toast.success("Meeting ID copied to clipboard!");
    }, [meetingId]);

    const participantIds = useMemo<string[]>(() => {
        const ids = [...participants.keys()];
        setParticipantCount(ids.length);
        return ids;
    }, [participants]);

    if (joined === "JOINED") {
        return (
            <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                {/* Header */}
                <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                                    <Video className="w-4 h-4 text-white" />
                                </div>
                                <h1 className="text-xl font-semibold text-gray-900">Video Meeting</h1>
                            </div>
                            <Badge variant="outline" className="flex items-center gap-2 bg-white/80">
                                <Users className="w-4 h-4" />
                                {participantCount} participant{participantCount !== 1 ? 's' : ''}
                            </Badge>
                        </div>
                        <Button
                            onClick={copyMeetingId}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2 bg-white/80 hover:bg-white"
                        >
                            <Copy className="w-4 h-4" />
                            ID: {meetingId.slice(0, 8)}...
                        </Button>
                    </div>
                </div>

                {/* Video Grid */}
                <div className="flex-1 p-6 overflow-auto">
                    <div className={`grid gap-4 h-full ${participantIds.length === 1 ? 'grid-cols-1 max-w-3xl mx-auto' :
                        participantIds.length === 2 ? 'grid-cols-1 lg:grid-cols-2 max-w-6xl mx-auto' :
                            participantIds.length <= 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2 max-w-6xl mx-auto' :
                                participantIds.length <= 6 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto' :
                                    'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-full mx-auto'
                        }`}>
                        {participantIds.map((participantId: string) => (
                            <ParticipantView
                                participantId={participantId}
                                key={participantId}
                            />
                        ))}
                    </div>
                </div>

                {/* Controls */}
                <Controls />
            </div>
        );
    }

    if (joined === "JOINING") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-8 text-center">
                        <div className="relative mx-auto mb-6">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Video className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Joining Meeting...</h2>
                        <p className="text-gray-600">Please wait while we connect you to the meeting.</p>
                        <div className="mt-4 text-sm text-gray-500">
                            Meeting ID: {meetingId}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
                        <Video className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        Ready to Join?
                    </CardTitle>
                    <CardDescription>
                        Meeting ID: {meetingId}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        onClick={joinMeeting}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                        Join Meeting as {userName}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

// Main VideoSDK Components wrapper
export default function VideoSDKComponents({
    meetingId,
    authToken,
    userName,
    onMeetingLeave
}: VideoSDKComponentsProps): JSX.Element {
    const meetingConfig: MeetingConfig = {
        meetingId,
        micEnabled: true,
        webcamEnabled: true,
        name: userName,
    };

    return (
        <MeetingProvider
            config={meetingConfig as any}
            token={authToken}
        >
            <MeetingView
                meetingId={meetingId}
                onMeetingLeave={onMeetingLeave}
                userName={userName}
            />
        </MeetingProvider>
    );
}