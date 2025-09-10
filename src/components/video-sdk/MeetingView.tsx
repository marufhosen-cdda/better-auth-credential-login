// MeetingView.tsx - Main meeting interface controller and layout manager
'use client';

import React, { JSX, useCallback, useMemo, useState } from "react";
import { useMeeting } from "@videosdk.live/react-sdk";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, Users, Monitor, Copy } from "lucide-react";
import { toast } from "sonner";
import { MeetingViewProps } from "./types";
import { ParticipantView } from "./ParticipantView";
import { PresenterView } from "./PresenterView";
import { Controls } from "./Controls";

export function MeetingView({ meetingId, onMeetingLeave, userName }: MeetingViewProps): JSX.Element {
    const [joined, setJoined] = useState<string | null>(null);
    const [participantCount, setParticipantCount] = useState<number>(0);

    // Enhanced onPresenterChanged callback
    const onPresenterChanged = useCallback((presenterId: string | null) => {
        console.log("🎥 onPresenterChanged callback:", presenterId);
        if (presenterId) {
            console.log(`🎥 ${presenterId} started screen share`);
            toast.success("Screen sharing started! Layout switched to presentation mode.");
        } else {
            console.log("🎥 Someone stopped screen share");
            toast.info("Screen sharing stopped. Returning to normal layout.");
        }
    }, []);

    const { join, participants, localParticipant, presenterId } = useMeeting({
        onMeetingJoined: () => {
            setJoined("JOINED");
            toast.success("Successfully joined the meeting!");
        },
        onMeetingLeft: () => {
            onMeetingLeave();
            toast.info("Left the meeting");
        },
        onParticipantJoined: (participant: any) => {
            console.log("🎥 Participant joined:", participant);
            toast.success(`${participant.displayName} joined the meeting`);
            setParticipantCount(prev => prev + 1);
        },
        onParticipantLeft: (participant: any) => {
            console.log("🎥 Participant left:", participant);
            toast.info(`${participant.displayName} left the meeting`);
            setParticipantCount(prev => Math.max(0, prev - 1));
        },
        onPresenterChanged,
        onError: (error: any) => {
            console.error("Meeting error:", error);
            toast.error("Meeting error occurred");
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
        console.log("🎥 Current participants:", ids);
        console.log("🎥 Current presenterId:", presenterId);
        return ids;
    }, [participants, presenterId]);

    // Pre-join Screen
    if (joined === null) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm">
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

    // Joining Screen
    if (joined === "JOINING") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm">
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

    // Main Meeting Interface
    if (joined === "JOINED") {
        return (
            <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                {/* Enhanced Header */}
                <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                                    <Video className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-semibold text-gray-900">Video Meeting</h1>
                                    <p className="text-sm text-gray-500">ID: {meetingId.slice(0, 8)}...</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className="flex items-center gap-2 bg-white/80 px-3 py-1">
                                    <Users className="w-4 h-4" />
                                    {participantCount} participant{participantCount !== 1 ? 's' : ''}
                                </Badge>
                                {presenterId && (
                                    <Badge variant="outline" className="flex items-center gap-2 bg-green-50 text-green-700 border-green-200 px-3 py-1">
                                        <Monitor className="w-4 h-4" />
                                        Screen sharing active
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <Button
                            onClick={copyMeetingId}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2 bg-white/80 hover:bg-white"
                        >
                            <Copy className="w-4 h-4" />
                            Copy ID
                        </Button>
                    </div>
                </div>

                {/* Enhanced Video Grid */}
                <div className="flex-1 p-6 overflow-auto">
                    {presenterId ? (
                        /* SCREEN SHARING LAYOUT */
                        <div className="h-full flex flex-col gap-4">
                            {/* Screen share view */}
                            <div className="flex-1 min-h-[400px]">
                                <PresenterView presenterId={presenterId} />
                            </div>

                            {/* Participant thumbnails */}
                            <div className="h-36 flex gap-3 overflow-x-auto py-2">
                                {participantIds.map((participantId: string) => (
                                    <div key={participantId} className="min-w-[240px] h-full">
                                        <ParticipantView participantId={participantId} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Normal grid layout */
                        <div className={`grid gap-4 ${participantIds.length === 1 ? 'grid-cols-1 max-w-4xl mx-auto' :
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
                    )}
                </div>

                {/* Enhanced Controls */}
                <Controls />
            </div>
        );
    }

    // Fallback return (should never reach here)
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
            <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
                    <p className="text-gray-600">Something went wrong with the meeting connection.</p>
                    <Button
                        onClick={() => window.location.reload()}
                        className="mt-4"
                        variant="outline"
                    >
                        Refresh Page
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}