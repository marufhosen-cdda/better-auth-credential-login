// // app/video-meeting/page.tsx
// 'use client';

// import React, { useEffect, useMemo, useRef, useState, useCallback, JSX } from "react";
// import {
//     MeetingProvider,
//     MeetingConsumer,
//     useMeeting,
//     useParticipant,
//     VideoPlayer,
//     Constants,
// } from "@videosdk.live/react-sdk";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Separator } from "@/components/ui/separator";
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff, Monitor, MonitorOff, Copy, Users, Settings } from "lucide-react";
// import { toast } from "sonner";
// import { createMeeting, getAuthToken, validateMeeting } from "@/lib/videosdk";

// // Types for VideoSDK
// interface Participant {
//     id: string;
//     displayName: string;
//     webcamOn: boolean;
//     micOn: boolean;
//     isLocal: boolean;
// }

// interface MeetingConfig {
//     meetingId: string;
//     micEnabled: boolean;
//     webcamEnabled: boolean;
//     name: string;
// }

// interface JoinScreenProps {
//     getMeetingAndToken: (id: string | null, name: string) => Promise<void>;
// }

// interface ParticipantViewProps {
//     participantId: string;
// }

// interface MeetingViewProps {
//     meetingId: string;
//     onMeetingLeave: () => void;
//     userName: string;
// }

// interface VideoMeetingState {
//     meetingId: string | null;
//     userName: string;
//     authToken: string | null;
//     isLoading: boolean;
// }

// // Join Screen Component
// function JoinScreen({ getMeetingAndToken }: JoinScreenProps): JSX.Element {
//     const [meetingId, setMeetingId] = useState<string>("");
//     const [isJoining, setIsJoining] = useState<boolean>(false);
//     const [userName, setUserName] = useState<string>("Participant");

//     const handleCreateMeeting = useCallback(async (): Promise<void> => {
//         setIsJoining(true);
//         try {
//             await getMeetingAndToken(null, userName);
//         } catch (error) {
//             const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
//             toast.error("Failed to create meeting: " + errorMessage);
//         } finally {
//             setIsJoining(false);
//         }
//     }, [getMeetingAndToken, userName]);

//     const handleJoinMeeting = useCallback(async (): Promise<void> => {
//         if (!meetingId.trim()) {
//             toast.error("Please enter a meeting ID");
//             return;
//         }

//         setIsJoining(true);
//         try {
//             const token: string | null = await getAuthToken();
//             if (!token) {
//                 throw new Error("Failed to get authentication token");
//             }

//             const isValid: boolean = await validateMeeting({ meetingId: meetingId.trim(), token });
//             if (!isValid) {
//                 toast.error("Invalid meeting ID");
//                 return;
//             }

//             await getMeetingAndToken(meetingId.trim(), userName);
//         } catch (error) {
//             const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
//             toast.error("Failed to join meeting: " + errorMessage);
//         } finally {
//             setIsJoining(false);
//         }
//     }, [getMeetingAndToken, meetingId, userName]);

//     return (
//         <div className="min-h-screen flex items-center justify-center p-4">
//             <Card className="w-full max-w-md shadow-xl border-0 backdrop-blur-sm">
//                 <CardHeader className="text-center pb-4">
//                     <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
//                         <Video className="w-8 h-8 text-white" />
//                     </div>
//                     <CardTitle className="text-2xl font-bold">
//                         Video Meeting
//                     </CardTitle>
//                     <CardDescription>
//                         Join an existing meeting or create a new one
//                     </CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-6">
//                     <div>
//                         <label className="text-sm font-medium mb-2 block">
//                             Your Name
//                         </label>
//                         <Input
//                             type="text"
//                             placeholder="Enter your name"
//                             value={userName}
//                             onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserName(e.target.value)}
//                             className="w-full"
//                         />
//                     </div>

//                     <Separator />

//                     <div>
//                         <label className="text-sm font-medium  mb-2 block">
//                             Meeting ID (Optional)
//                         </label>
//                         <Input
//                             type="text"
//                             placeholder="Enter Meeting ID"
//                             value={meetingId}
//                             onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMeetingId(e.target.value)}
//                             className="w-full"
//                         />
//                     </div>

//                     <div className="space-y-3">
//                         <Button
//                             onClick={handleJoinMeeting}
//                             disabled={isJoining || !userName.trim()}
//                             className="w-full text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
//                         >
//                             {isJoining ? "Joining..." : "Join Meeting"}
//                         </Button>

//                         <div className="text-center text-sm text-gray-500 relative">
//                             <span className="px-3">or</span>
//                         </div>

//                         <Button
//                             onClick={handleCreateMeeting}
//                             disabled={isJoining || !userName.trim()}
//                             className="w-full"
//                             variant="outline"
//                         >
//                             {isJoining ? "Creating..." : "Create New Meeting"}
//                         </Button>
//                     </div>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// }

// // Participant View Component
// function ParticipantView({ participantId }: ParticipantViewProps): JSX.Element {
//     const micRef = useRef<HTMLAudioElement>(null);
//     const {
//         micStream,
//         webcamOn,
//         micOn,
//         isLocal,
//         displayName,
//         webcamStream
//     } = useParticipant(participantId);

//     useEffect(() => {
//         if (micRef.current) {
//             if (micOn && micStream) {
//                 const mediaStream = new MediaStream();
//                 mediaStream.addTrack(micStream.track);
//                 micRef.current.srcObject = mediaStream;
//                 micRef.current
//                     .play()
//                     .catch((error: Error) =>
//                         console.error("Audio play failed", error)
//                     );
//             } else {
//                 micRef.current.srcObject = null;
//             }
//         }
//     }, [micStream, micOn]);

//     return (
//         <Card className="relative overflow-hidden bg-gray-900 border-0 shadow-lg">
//             <CardContent className="p-0 aspect-video relative">
//                 {webcamOn && webcamStream ? (
//                     <VideoPlayer
//                         participantId={participantId}
//                         type="video"
//                         containerStyle={{
//                             height: "100%",
//                             width: "100%",
//                         }}
//                         className="w-full h-full object-cover"
//                     />
//                 ) : (
//                     <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
//                         <div className="text-center">
//                             <Avatar className="w-20 h-20 mx-auto mb-3">
//                                 <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
//                                     {displayName?.charAt(0)?.toUpperCase() || "P"}
//                                 </AvatarFallback>
//                             </Avatar>
//                             <p className="text-white text-sm opacity-75">{displayName}</p>
//                         </div>
//                     </div>
//                 )}

//                 {/* Participant info overlay */}
//                 <div className="absolute bottom-3 left-3 flex items-center gap-2">
//                     <Badge
//                         variant={isLocal ? "default" : "secondary"}
//                         className={`text-xs ${isLocal ? 'bg-blue-600' : 'bg-black/50 text-white border-white/20'}`}
//                     >
//                         {displayName} {isLocal && "(You)"}
//                     </Badge>
//                     <div className="flex gap-1">
//                         {micOn ? (
//                             <div className="bg-green-500 rounded-full p-1">
//                                 <Mic className="w-3 h-3 text-white" />
//                             </div>
//                         ) : (
//                             <div className="bg-red-500 rounded-full p-1">
//                                 <MicOff className="w-3 h-3 text-white" />
//                             </div>
//                         )}
//                         {webcamOn ? (
//                             <div className="bg-green-500 rounded-full p-1">
//                                 <Video className="w-3 h-3 text-white" />
//                             </div>
//                         ) : (
//                             <div className="bg-red-500 rounded-full p-1">
//                                 <VideoOff className="w-3 h-3 text-white" />
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 <audio ref={micRef} autoPlay playsInline muted={isLocal} />
//             </CardContent>
//         </Card>
//     );
// }

// // Controls Component
// function Controls(): JSX.Element {
//     const {
//         leave,
//         toggleMic,
//         toggleWebcam,
//         enableScreenShare,
//         disableScreenShare,
//         localMicOn,
//         localWebcamOn,
//         localScreenShareOn
//     } = useMeeting();

//     const handleScreenShare = useCallback((): void => {
//         if (localScreenShareOn) {
//             disableScreenShare();
//             toast.info("Screen sharing stopped");
//         } else {
//             enableScreenShare();
//             toast.success("Screen sharing started");
//         }
//     }, [localScreenShareOn, disableScreenShare, enableScreenShare]);

//     const handleLeave = useCallback((): void => {
//         if (window.confirm("Are you sure you want to leave the meeting?")) {
//             leave();
//         }
//     }, [leave]);

//     return (
//         <div className="backdrop-blur-sm border-t border-gray-200 p-4">
//             <div className="flex items-center justify-center gap-3">
//                 <Button
//                     onClick={toggleMic as any}
//                     variant={localMicOn ? "default" : "destructive"}
//                     size="icon"
//                     className="rounded-full w-12 h-12 transition-all hover:scale-105"
//                 >
//                     {localMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
//                 </Button>

//                 <Button
//                     onClick={toggleWebcam as any}
//                     variant={localWebcamOn ? "default" : "destructive"}
//                     size="icon"
//                     className="rounded-full w-12 h-12 transition-all hover:scale-105"
//                 >
//                     {localWebcamOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
//                 </Button>

//                 <Button
//                     onClick={handleScreenShare}
//                     size="icon"
//                     className="rounded-full w-12 h-12 transition-all hover:scale-105"
//                 >
//                     {localScreenShareOn ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
//                 </Button>

//                 <Button
//                     onClick={handleLeave}
//                     variant="secondary"
//                     size="icon"
//                     className="rounded-full w-12 h-12 transition-all hover:scale-105 bg-red-500"
//                 >
//                     <PhoneOff className="w-5 h-5" />
//                 </Button>
//             </div>
//         </div>
//     );
// }

// // Meeting View Component
// function MeetingView({ meetingId, onMeetingLeave, userName }: MeetingViewProps): JSX.Element {
//     const [joined, setJoined] = useState<string | null>(null);

//     const { join, participants, localParticipant } = useMeeting({
//         onMeetingJoined: () => {
//             setJoined("JOINED");
//             toast.success("Successfully joined the meeting!");
//         },
//         onMeetingLeft: () => {
//             onMeetingLeave();
//             toast.info("Left the meeting");
//         },
//         onParticipantJoined: (participant: any) => {
//             toast.success(`${participant.displayName} joined the meeting`);
//         },
//         onParticipantLeft: (participant: any) => {
//             toast.info(`${participant.displayName} left the meeting`);
//         },
//     });

//     const joinMeeting = useCallback((): void => {
//         setJoined("JOINING");
//         join();
//     }, [join]);

//     const copyMeetingId = useCallback((): void => {
//         navigator.clipboard.writeText(meetingId);
//         toast.success("Meeting ID copied to clipboard!");
//     }, [meetingId]);

//     const participantIds = useMemo<string[]>(() => {
//         return [...participants.keys()];
//     }, [participants]);

//     if (joined === "JOINED") {
//         return (
//             <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
//                 {/* Header */}
//                 <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 p-4 shadow-sm">
//                     <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-4">
//                             <div className="flex items-center gap-2">
//                                 <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
//                                     <Video className="w-4 h-4 text-white" />
//                                 </div>
//                                 <h1 className="text-xl font-semibold text-gray-900">Video Meeting</h1>
//                             </div>
//                             <Badge variant="outline" className="flex items-center gap-2 bg-white/80">
//                                 <Users className="w-4 h-4" />
//                                 {participantIds.length} participant{participantIds.length !== 1 ? 's' : ''}
//                             </Badge>
//                         </div>
//                         <Button
//                             onClick={copyMeetingId}
//                             variant="outline"
//                             size="sm"
//                             className="flex items-center gap-2 bg-white/80 hover:bg-white"
//                         >
//                             <Copy className="w-4 h-4" />
//                             ID: {meetingId.slice(0, 8)}...
//                         </Button>
//                     </div>
//                 </div>

//                 {/* Video Grid */}
//                 <div className="flex-1 p-6 overflow-auto">
//                     <div className={`grid gap-4 h-full ${participantIds.length === 1 ? 'grid-cols-1 max-w-3xl mx-auto' :
//                         participantIds.length === 2 ? 'grid-cols-1 lg:grid-cols-2 max-w-6xl mx-auto' :
//                             participantIds.length <= 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2 max-w-6xl mx-auto' :
//                                 participantIds.length <= 6 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto' :
//                                     'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-full mx-auto'
//                         }`}>
//                         {participantIds.map((participantId: string) => (
//                             <ParticipantView
//                                 participantId={participantId}
//                                 key={participantId}
//                             />
//                         ))}
//                     </div>
//                 </div>

//                 {/* Controls */}
//                 <Controls />
//             </div>
//         );
//     }

//     if (joined === "JOINING") {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
//                 <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
//                     <CardContent className="p-8 text-center">
//                         <div className="relative mx-auto mb-6">
//                             <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
//                             <div className="absolute inset-0 flex items-center justify-center">
//                                 <Video className="w-6 h-6 text-blue-600" />
//                             </div>
//                         </div>
//                         <h2 className="text-xl font-semibold text-gray-900 mb-2">Joining Meeting...</h2>
//                         <p className="text-gray-600">Please wait while we connect you to the meeting.</p>
//                         <div className="mt-4 text-sm text-gray-500">
//                             Meeting ID: {meetingId}
//                         </div>
//                     </CardContent>
//                 </Card>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
//             <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
//                 <CardHeader className="text-center">
//                     <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
//                         <Video className="w-8 h-8 text-white" />
//                     </div>
//                     <CardTitle className="text-2xl font-bold text-gray-900">
//                         Ready to Join?
//                     </CardTitle>
//                     <CardDescription>
//                         Meeting ID: {meetingId}
//                     </CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                     <Button
//                         onClick={joinMeeting}
//                         className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
//                     >
//                         Join Meeting as {userName}
//                     </Button>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// }

// // Main App Component
// export default function VideoMeetingPage(): JSX.Element {
//     const [state, setState] = useState<VideoMeetingState>({
//         meetingId: null,
//         userName: "Participant",
//         authToken: null,
//         isLoading: true,
//     });

//     useEffect(() => {
//         // Initialize auth token on component mount
//         const initializeToken = async (): Promise<void> => {
//             try {
//                 const token: string | null = await getAuthToken();
//                 setState(prev => ({ ...prev, authToken: token, isLoading: false }));
//                 if (!token) {
//                     toast.error("Failed to initialize VideoSDK. Please check your configuration.");
//                 }
//             } catch (error) {
//                 console.error("Failed to initialize auth token:", error);
//                 toast.error("Failed to initialize VideoSDK");
//                 setState(prev => ({ ...prev, isLoading: false }));
//             }
//         };

//         initializeToken();
//     }, []);

//     const getMeetingAndToken = useCallback(async (id: string | null, name: string): Promise<void> => {
//         setState(prev => ({ ...prev, userName: name || prev.userName }));
//         const token: string | null = await getAuthToken();
//         if (!token) {
//             throw new Error("Failed to get authentication token");
//         }
//         const generatedMeetingId: string = id == null ? await createMeeting({ token }) : id;
//         setState(prev => ({ ...prev, meetingId: generatedMeetingId }));
//     }, []);

//     const onMeetingLeave = useCallback((): void => {
//         setState(prev => ({ ...prev, meetingId: null }));
//     }, []);

//     if (state.isLoading) {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
//                 <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
//                     <CardContent className="p-8 text-center">
//                         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//                         <h2 className="text-xl font-semibold text-gray-900 mb-2">Initializing VideoSDK...</h2>
//                         <p className="text-gray-600">Please wait while we set up the video calling service.</p>
//                     </CardContent>
//                 </Card>
//             </div>
//         );
//     }

//     if (!state.authToken) {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
//                 <Card className="w-full max-w-md">
//                     <CardContent className="p-8 text-center">
//                         <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                             <Settings className="w-8 h-8 text-red-600" />
//                         </div>
//                         <h2 className="text-xl font-semibold text-gray-900 mb-2">Configuration Error</h2>
//                         <p className="text-gray-600 mb-4">
//                             VideoSDK is not properly configured. Please check your environment variables and API credentials.
//                         </p>
//                         <Button onClick={() => window.location.reload()} variant="outline">
//                             Retry
//                         </Button>
//                     </CardContent>
//                 </Card>
//             </div>
//         );
//     }

//     const meetingConfig: MeetingConfig = {
//         meetingId: state.meetingId!,
//         micEnabled: true,
//         webcamEnabled: true,
//         name: state.userName,
//     };

//     return (
//         <div>
//             {state.meetingId ? (
//                 <MeetingProvider
//                     config={meetingConfig as any}
//                     token={state.authToken}
//                 >
//                     <MeetingView
//                         meetingId={state.meetingId}
//                         onMeetingLeave={onMeetingLeave}
//                         userName={state.userName}
//                     />
//                 </MeetingProvider>
//             ) : (
//                 <JoinScreen getMeetingAndToken={getMeetingAndToken} />
//             )}
//         </div>
//     );
// }

// app/video-meeting/page.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState, useCallback, JSX } from "react";
import dynamic from 'next/dynamic';
import { getAuthToken, createMeeting, validateMeeting } from "@/lib/videosdk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff, Monitor, MonitorOff, Copy, Users, Settings } from "lucide-react";
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