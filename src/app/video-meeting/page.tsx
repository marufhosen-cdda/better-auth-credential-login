'use client';

import React, { useEffect, useState, useCallback, JSX } from "react";
import dynamic from 'next/dynamic';
import { getAuthToken, createMeeting, validateMeeting } from "@/lib/videosdk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Video, Settings } from "lucide-react";
import { toast } from "sonner";

// Dynamic import to avoid SSR issues with VideoSDK
interface VideoSDKComponentsProps {
    meetingId: string;
    authToken: string;
    userName: string;
    onMeetingLeave: () => void;
}

const VideoSDKComponents = dynamic<VideoSDKComponentsProps>(
    () => import('@/components/video-sdk/VideoSDKComponents').then(mod => mod.default),
    {
        ssr: false,
        loading: () => (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading VideoSDK...</h2>
                        <p className="text-gray-600">Please wait while we load the video calling components.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }
);

// Types
interface VideoMeetingState {
    meetingId: string | null;
    userName: string;
    authToken: string | null;
    isLoading: boolean;
}

interface JoinScreenProps {
    getMeetingAndToken: (id: string | null, name: string) => Promise<void>;
}

// Join Screen Component
function JoinScreen({ getMeetingAndToken }: JoinScreenProps): JSX.Element {
    const [meetingId, setMeetingId] = useState<string>("");
    const [isJoining, setIsJoining] = useState<boolean>(false);
    const [userName, setUserName] = useState<string>("Participant");

    const handleCreateMeeting = useCallback(async (): Promise<void> => {
        if (!userName.trim()) {
            toast.error("Please enter your name");
            return;
        }

        setIsJoining(true);
        try {
            await getMeetingAndToken(null, userName.trim());
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            toast.error("Failed to create meeting: " + errorMessage);
        } finally {
            setIsJoining(false);
        }
    }, [getMeetingAndToken, userName]);

    const handleJoinMeeting = useCallback(async (): Promise<void> => {
        if (!meetingId.trim()) {
            toast.error("Please enter a meeting ID");
            return;
        }

        if (!userName.trim()) {
            toast.error("Please enter your name");
            return;
        }

        setIsJoining(true);
        try {
            const token: string | null = await getAuthToken();
            if (!token) {
                throw new Error("Failed to get authentication token");
            }

            const isValid: boolean = await validateMeeting({ meetingId: meetingId.trim(), token });
            if (!isValid) {
                toast.error("Invalid meeting ID");
                return;
            }

            await getMeetingAndToken(meetingId.trim(), userName.trim());
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            toast.error("Failed to join meeting: " + errorMessage);
        } finally {
            setIsJoining(false);
        }
    }, [getMeetingAndToken, meetingId, userName]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
                        <Video className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        Video Meeting
                    </CardTitle>
                    <CardDescription>
                        Join an existing meeting or create a new one
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Your Name *
                        </label>
                        <Input
                            type="text"
                            placeholder="Enter your name"
                            value={userName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserName(e.target.value)}
                            className="w-full"
                            disabled={isJoining}
                        />
                    </div>

                    <Separator />

                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Meeting ID (Optional)
                        </label>
                        <Input
                            type="text"
                            placeholder="Enter Meeting ID"
                            value={meetingId}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMeetingId(e.target.value)}
                            className="w-full"
                            disabled={isJoining}
                        />
                    </div>

                    <div className="space-y-3">
                        <Button
                            onClick={handleJoinMeeting}
                            disabled={isJoining || !userName.trim() || !meetingId.trim()}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                            {isJoining ? "Joining..." : "Join Meeting"}
                        </Button>

                        <div className="text-center text-sm text-gray-500 relative">
                            <span className="bg-white px-3">or</span>
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                        </div>

                        <Button
                            onClick={handleCreateMeeting}
                            disabled={isJoining || !userName.trim()}
                            className="w-full"
                            variant="outline"
                        >
                            {isJoining ? "Creating..." : "Create New Meeting"}
                        </Button>
                    </div>

                    {!userName.trim() && (
                        <p className="text-xs text-gray-500 text-center">
                            Please enter your name to continue
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// Main App Component
export default function VideoMeetingPage(): JSX.Element {
    const [state, setState] = useState<VideoMeetingState>({
        meetingId: null,
        userName: "Participant",
        authToken: null,
        isLoading: true,
    });

    useEffect(() => {
        // Initialize auth token on component mount
        const initializeToken = async (): Promise<void> => {
            try {
                const token: string | null = await getAuthToken();
                setState(prev => ({ ...prev, authToken: token, isLoading: false }));
                if (!token) {
                    toast.error("Failed to initialize VideoSDK. Please check your configuration.");
                }
            } catch (error) {
                console.error("Failed to initialize auth token:", error);
                toast.error("Failed to initialize VideoSDK");
                setState(prev => ({ ...prev, isLoading: false }));
            }
        };

        initializeToken();
    }, []);

    const getMeetingAndToken = useCallback(async (id: string | null, name: string): Promise<void> => {
        setState(prev => ({ ...prev, userName: name || prev.userName }));
        const token: string | null = await getAuthToken();
        if (!token) {
            throw new Error("Failed to get authentication token");
        }
        const generatedMeetingId: string = id == null ? await createMeeting({ token }) : id;
        setState(prev => ({ ...prev, meetingId: generatedMeetingId }));
    }, []);

    const onMeetingLeave = useCallback((): void => {
        setState(prev => ({ ...prev, meetingId: null }));
    }, []);

    if (state.isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Initializing VideoSDK...</h2>
                        <p className="text-gray-600">Please wait while we set up the video calling service.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!state.authToken) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Settings className="w-8 h-8 text-red-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Configuration Error</h2>
                        <p className="text-gray-600 mb-4">
                            VideoSDK is not properly configured. Please check your environment variables and API credentials.
                        </p>
                        <Button onClick={() => window.location.reload()} variant="outline">
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div>
            {state.meetingId ? (
                <VideoSDKComponents
                    meetingId={state.meetingId}
                    authToken={state.authToken}
                    userName={state.userName}
                    onMeetingLeave={onMeetingLeave}
                />
            ) : (
                <JoinScreen getMeetingAndToken={getMeetingAndToken} />
            )}
        </div>
    );
}