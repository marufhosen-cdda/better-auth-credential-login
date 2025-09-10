// 'use client';

// import React, { useEffect, useMemo, useRef, useState, useCallback, JSX } from "react";
// import {
//     MeetingProvider,
//     useMeeting,
//     useParticipant,
//     VideoPlayer,
// } from "@videosdk.live/react-sdk";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff, Monitor, MonitorOff, Copy, Users, Maximize2, Minimize2 } from "lucide-react";
// import { toast } from "sonner";

// // Types
// interface VideoSDKComponentsProps {
//     meetingId: string;
//     authToken: string;
//     userName: string;
//     onMeetingLeave: () => void;
// }

// interface ParticipantViewProps {
//     participantId: string;
//     isPresenting?: boolean;
// }

// interface MeetingViewProps {
//     meetingId: string;
//     onMeetingLeave: () => void;
//     userName: string;
// }

// interface MeetingConfig {
//     meetingId: string;
//     micEnabled: boolean;
//     webcamEnabled: boolean;
//     name: string;
// }

// // Screen Share View Component
// function ScreenShareView({ participantId }: { participantId: string }): JSX.Element {
//     const { screenShareStream, displayName } = useParticipant(participantId);

//     if (!screenShareStream) return <></>;

//     return (
//         <Card className="relative overflow-hidden bg-gray-900 border-2 border-blue-500 shadow-xl">
//             <CardContent className="p-0 aspect-video relative">
//                 <VideoPlayer
//                     participantId={participantId}
//                     type="screenShare"
//                     containerStyle={{
//                         height: "100%",
//                         width: "100%",
//                     }}
//                     className="w-full h-full object-contain bg-black"
//                 />

//                 {/* Screen share overlay */}
//                 <div className="absolute top-3 left-3">
//                     <Badge className="bg-blue-600 text-white flex items-center gap-2">
//                         <Monitor className="w-3 h-3" />
//                         {displayName} is sharing screen
//                     </Badge>
//                 </div>
//             </CardContent>
//         </Card>
//     );
// }

// // Enhanced Participant View Component
// function ParticipantView({ participantId, isPresenting = false }: ParticipantViewProps): JSX.Element {
//     const micRef = useRef<HTMLAudioElement>(null);
//     const {
//         micStream,
//         webcamOn,
//         micOn,
//         isLocal,
//         displayName,
//         webcamStream,
//         screenShareOn,
//         screenShareStream
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

//     // Don't render participant video if they're screen sharing (main screen share view will handle it)
//     if (screenShareOn && !isPresenting) {
//         return <></>;
//     }

//     return (
//         <Card className={`relative overflow-hidden bg-gray-900 border-0 shadow-lg ${isPresenting ? 'order-first col-span-full lg:col-span-2 xl:col-span-3' : ''
//             }`}>
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
//                         {screenShareOn && <Monitor className="w-3 h-3 ml-1" />}
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

// // Enhanced Controls Component with Fixed Screen Share
// function Controls(): JSX.Element {
//     const {
//         leave,
//         toggleMic,
//         toggleWebcam,
//         enableScreenShare,
//         disableScreenShare,
//         localMicOn,
//         localWebcamOn,
//         localScreenShareOn,
//         participants
//     } = useMeeting();

//     const [isToggling, setIsToggling] = useState<{
//         mic: boolean;
//         webcam: boolean;
//         screen: boolean;
//     }>({
//         mic: false,
//         webcam: false,
//         screen: false
//     });

//     // Check if someone else is already screen sharing
//     const otherScreenShareActive = useMemo(() => {
//         return [...participants.values()].some(
//             (participant: any) => participant.screenShareOn && !participant.isLocal
//         );
//     }, [participants]);

//     const handleMicToggle = useCallback(async (): Promise<void> => {
//         if (isToggling.mic) return;

//         setIsToggling(prev => ({ ...prev, mic: true }));
//         try {
//             await toggleMic();
//             toast.success(localMicOn ? "Microphone muted" : "Microphone unmuted");
//         } catch (error) {
//             console.error("Failed to toggle microphone:", error);
//             toast.error("Failed to toggle microphone");
//         } finally {
//             setIsToggling(prev => ({ ...prev, mic: false }));
//         }
//     }, [toggleMic, localMicOn, isToggling.mic]);

//     const handleWebcamToggle = useCallback(async (): Promise<void> => {
//         if (isToggling.webcam) return;

//         setIsToggling(prev => ({ ...prev, webcam: true }));
//         try {
//             await toggleWebcam();
//             toast.success(localWebcamOn ? "Camera turned off" : "Camera turned on");
//         } catch (error) {
//             console.error("Failed to toggle camera:", error);
//             toast.error("Failed to toggle camera");
//         } finally {
//             setIsToggling(prev => ({ ...prev, webcam: false }));
//         }
//     }, [toggleWebcam, localWebcamOn, isToggling.webcam]);

//     const handleScreenShare = useCallback(async (): Promise<void> => {
//         if (isToggling.screen) return;

//         // Check if we're on HTTPS (required for screen share)
//         if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
//             toast.error("Screen sharing requires HTTPS. Please use a secure connection.");
//             return;
//         }

//         // Check browser compatibility
//         if (typeof window !== 'undefined' && !navigator.mediaDevices?.getDisplayMedia) {
//             toast.error("Screen sharing is not supported in this browser. Please use Chrome, Firefox, or Safari.");
//             return;
//         }

//         // Check if someone else is already sharing
//         if (!localScreenShareOn && otherScreenShareActive) {
//             toast.error("Someone else is already sharing their screen. Please wait for them to stop sharing.");
//             return;
//         }

//         setIsToggling(prev => ({ ...prev, screen: true }));
//         try {
//             if (localScreenShareOn) {
//                 await disableScreenShare();
//                 toast.info("Screen sharing stopped");
//             } else {
//                 // Request permissions first
//                 try {
//                     await enableScreenShare();
//                     toast.success("Screen sharing started");
//                 } catch (permissionError) {
//                     console.error("Screen share permission denied:", permissionError);
//                     toast.error("Screen sharing permission denied. Please allow screen sharing and try again.");
//                 }
//             }
//         } catch (error) {
//             console.error("Failed to toggle screen share:", error);

//             // Provide specific error messages
//             if (error instanceof Error) {
//                 if (error.message.includes('Permission denied')) {
//                     toast.error("Screen sharing permission denied. Please allow screen sharing in your browser.");
//                 } else if (error.message.includes('NotAllowedError')) {
//                     toast.error("Screen sharing was cancelled. Please try again and allow access.");
//                 } else if (error.message.includes('NotSupportedError')) {
//                     toast.error("Screen sharing is not supported in this browser.");
//                 } else {
//                     toast.error("Failed to start screen sharing. Please try again.");
//                 }
//             } else {
//                 toast.error("Failed to toggle screen sharing");
//             }
//         } finally {
//             setIsToggling(prev => ({ ...prev, screen: false }));
//         }
//     }, [localScreenShareOn, disableScreenShare, enableScreenShare, isToggling.screen, otherScreenShareActive]);

//     const handleLeave = useCallback((): void => {
//         if (window.confirm("Are you sure you want to leave the meeting?")) {
//             leave();
//         }
//     }, [leave]);

//     return (
//         <div className="bg-white/90 backdrop-blur-sm border-t border-gray-200 p-4">
//             <div className="flex items-center justify-center gap-3">
//                 <Button
//                     onClick={handleMicToggle}
//                     variant={localMicOn ? "default" : "destructive"}
//                     size="icon"
//                     className="rounded-full w-12 h-12 transition-all hover:scale-105"
//                     disabled={isToggling.mic}
//                     title={localMicOn ? "Mute microphone" : "Unmute microphone"}
//                 >
//                     {isToggling.mic ? (
//                         <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
//                     ) : localMicOn ? (
//                         <Mic className="w-5 h-5" />
//                     ) : (
//                         <MicOff className="w-5 h-5" />
//                     )}
//                 </Button>

//                 <Button
//                     onClick={handleWebcamToggle}
//                     variant={localWebcamOn ? "default" : "destructive"}
//                     size="icon"
//                     className="rounded-full w-12 h-12 transition-all hover:scale-105"
//                     disabled={isToggling.webcam}
//                     title={localWebcamOn ? "Turn off camera" : "Turn on camera"}
//                 >
//                     {isToggling.webcam ? (
//                         <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
//                     ) : localWebcamOn ? (
//                         <Video className="w-5 h-5" />
//                     ) : (
//                         <VideoOff className="w-5 h-5" />
//                     )}
//                 </Button>

//                 <Button
//                     onClick={handleScreenShare}
//                     variant={localScreenShareOn ? "destructive" : "outline"}
//                     size="icon"
//                     className="rounded-full w-12 h-12 transition-all hover:scale-105"
//                     disabled={isToggling.screen || (!localScreenShareOn && otherScreenShareActive)}
//                     title={
//                         otherScreenShareActive && !localScreenShareOn
//                             ? "Someone else is sharing their screen"
//                             : localScreenShareOn
//                                 ? "Stop screen sharing"
//                                 : "Start screen sharing"
//                     }
//                 >
//                     {isToggling.screen ? (
//                         <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent" />
//                     ) : localScreenShareOn ? (
//                         <MonitorOff className="w-5 h-5" />
//                     ) : (
//                         <Monitor className="w-5 h-5" />
//                     )}
//                 </Button>

//                 <Button
//                     onClick={handleLeave}
//                     variant="destructive"
//                     size="icon"
//                     className="rounded-full w-12 h-12 transition-all hover:scale-105"
//                     title="Leave meeting"
//                 >
//                     <PhoneOff className="w-5 h-5" />
//                 </Button>
//             </div>

//             {/* Status indicators */}
//             <div className="flex justify-center mt-2 gap-2 text-xs text-gray-600">
//                 {localScreenShareOn && (
//                     <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
//                         <Monitor className="w-3 h-3 mr-1" />
//                         You are sharing your screen
//                     </Badge>
//                 )}
//                 {otherScreenShareActive && !localScreenShareOn && (
//                     <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
//                         <Monitor className="w-3 h-3 mr-1" />
//                         Someone is sharing their screen
//                     </Badge>
//                 )}
//             </div>
//         </div>
//     );
// }

// // Enhanced Meeting View Component with Screen Share Layout
// function MeetingView({ meetingId, onMeetingLeave, userName }: MeetingViewProps): JSX.Element {
//     const [joined, setJoined] = useState<string | null>(null);
//     const [participantCount, setParticipantCount] = useState<number>(0);

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
//             setParticipantCount(prev => prev + 1);
//         },
//         onParticipantLeft: (participant: any) => {
//             toast.info(`${participant.displayName} left the meeting`);
//             setParticipantCount(prev => Math.max(0, prev - 1));
//         },
//         onScreenShareStarted: () => {
//             toast.info("Screen sharing started");
//         },
//         onScreenShareStopped: () => {
//             toast.info("Screen sharing stopped");
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
//         const ids = [...participants.keys()];
//         setParticipantCount(ids.length);
//         return ids;
//     }, [participants]);

//     // Find participants who are screen sharing
//     const screenSharingParticipants = useMemo(() => {
//         return participantIds.filter(id => {
//             const participant = participants.get(id);
//             return participant?.screenShareOn;
//         });
//     }, [participantIds, participants]);

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
//                             <div className="flex items-center gap-2">
//                                 <Badge variant="outline" className="flex items-center gap-2 bg-white/80">
//                                     <Users className="w-4 h-4" />
//                                     {participantCount} participant{participantCount !== 1 ? 's' : ''}
//                                 </Badge>
//                                 {screenSharingParticipants.length > 0 && (
//                                     <Badge variant="outline" className="flex items-center gap-2 bg-blue-50 text-blue-700 border-blue-200">
//                                         <Monitor className="w-4 h-4" />
//                                         Screen sharing active
//                                     </Badge>
//                                 )}
//                             </div>
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
//                     {screenSharingParticipants.length > 0 ? (
//                         /* Screen sharing layout */
//                         <div className="h-full flex flex-col gap-4">
//                             {/* Screen share view */}
//                             <div className="flex-1">
//                                 {screenSharingParticipants.map((participantId: string) => (
//                                     <ScreenShareView key={`screen-${participantId}`} participantId={participantId} />
//                                 ))}
//                             </div>

//                             {/* Participant thumbnails */}
//                             <div className="h-32 flex gap-2 overflow-x-auto">
//                                 {participantIds.map((participantId: string) => (
//                                     <div key={participantId} className="min-w-[200px] h-full">
//                                         <ParticipantView participantId={participantId} />
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     ) : (
//                         /* Normal grid layout */
//                         <div className={`grid gap-4 h-full ${participantIds.length === 1 ? 'grid-cols-1 max-w-3xl mx-auto' :
//                             participantIds.length === 2 ? 'grid-cols-1 lg:grid-cols-2 max-w-6xl mx-auto' :
//                                 participantIds.length <= 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2 max-w-6xl mx-auto' :
//                                     participantIds.length <= 6 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto' :
//                                         'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-full mx-auto'
//                             }`}>
//                             {participantIds.map((participantId: string) => (
//                                 <ParticipantView
//                                     participantId={participantId}
//                                     key={participantId}
//                                 />
//                             ))}
//                         </div>
//                     )}
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

// // Main VideoSDK Components wrapper
// export default function VideoSDKComponents({
//     meetingId,
//     authToken,
//     userName,
//     onMeetingLeave
// }: VideoSDKComponentsProps): JSX.Element {
//     const meetingConfig: MeetingConfig = {
//         meetingId,
//         micEnabled: true,
//         webcamEnabled: true,
//         name: userName,
//     };

//     return (
//         <MeetingProvider
//             config={meetingConfig}
//             token={authToken}
//         >
//             <MeetingView
//                 meetingId={meetingId}
//                 onMeetingLeave={onMeetingLeave}
//                 userName={userName}
//             />
//         </MeetingProvider>
//     );
// }

// app/video-meeting/VideoSDKComponents.tsx (CRITICAL SCREEN SHARE FIX)
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
import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff, Monitor, MonitorOff, Copy, Users, AlertTriangle, RefreshCw } from "lucide-react";
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
    isPresenting?: boolean;
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

// FIXED: Enhanced Screen Share View Component 
function ScreenShareView({ participantId }: { participantId: string }): JSX.Element {
    const { screenShareStream, displayName, screenShareOn } = useParticipant(participantId);
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    console.log("ScreenShareView - participantId:", participantId);
    console.log("ScreenShareView - screenShareOn:", screenShareOn);
    console.log("ScreenShareView - screenShareStream:", screenShareStream);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        if (screenShareOn) {
            if (screenShareStream && screenShareStream.track) {
                console.log("Screen share stream available:", screenShareStream);
                setIsLoading(false);
                setHasError(false);

                // CRITICAL FIX: Manually handle video element for screen share
                if (videoRef.current) {
                    const mediaStream = new MediaStream([screenShareStream.track]);
                    videoRef.current.srcObject = mediaStream;
                    videoRef.current.play().catch((error) => {
                        console.error("Failed to play screen share video:", error);
                        setHasError(true);
                    });
                }
            } else {
                // Wait for stream but set timeout
                timeoutId = setTimeout(() => {
                    console.log("Screen share timeout - no stream received");
                    setIsLoading(false);
                    setHasError(true);
                }, 5000);
            }
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [screenShareStream, screenShareOn]);

    if (!screenShareOn) {
        console.log("Screen share not active for participant:", participantId);
        return <></>;
    }

    if (isLoading) {
        return (
            <Card className="relative overflow-hidden bg-gray-900 border-2 border-blue-500 shadow-xl">
                <CardContent className="p-0 aspect-video relative flex items-center justify-center">
                    <div className="text-center text-white">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                        <p>Loading {displayName}'s screen share...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (hasError || !screenShareStream) {
        return (
            <Card className="relative overflow-hidden bg-gray-900 border-2 border-red-500 shadow-xl">
                <CardContent className="p-0 aspect-video relative flex items-center justify-center">
                    <div className="text-center text-white">
                        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Screen Share Error</h3>
                        <p className="text-sm opacity-75">Unable to display {displayName}'s screen</p>
                        <p className="text-xs opacity-60 mt-2">Stream: {screenShareStream ? 'Available' : 'Not Available'}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="relative overflow-hidden bg-gray-900 border-2 border-blue-500 shadow-xl">
            <CardContent className="p-0 aspect-video relative">
                {/* CRITICAL FIX: Try both VideoPlayer and manual video element */}
                {screenShareStream && screenShareStream.track ? (
                    <>
                        {/* Method 1: VideoSDK VideoPlayer */}
                        <VideoPlayer
                            participantId={participantId}
                            containerStyle={{
                                height: "100%",
                                width: "100%",
                            }}
                            className="w-full h-full object-contain bg-black"
                            onError={(error: any) => {
                                console.error("VideoPlayer error:", error);
                                setHasError(true);
                            }}
                        />

                        {/* Method 2: Manual video element as fallback */}
                        <video
                            ref={videoRef}
                            className="w-full h-full object-contain bg-black absolute inset-0"
                            autoPlay
                            playsInline
                            muted
                            style={{ zIndex: hasError ? 10 : 1 }}
                            onError={(e) => {
                                console.error("Manual video error:", e);
                                setHasError(true);
                            }}
                            onLoadedData={() => {
                                console.log("Manual video loaded successfully");
                                setHasError(false);
                            }}
                        />
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <div className="text-center text-white">
                            <Monitor className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>Waiting for screen share...</p>
                        </div>
                    </div>
                )}

                {/* Screen share overlay */}
                <div className="absolute top-3 left-3 z-20">
                    <Badge className="bg-blue-600 text-white flex items-center gap-2">
                        <Monitor className="w-3 h-3" />
                        {displayName} is sharing screen
                    </Badge>
                </div>

                {/* Debug info (remove in production) */}
                <div className="absolute bottom-3 right-3 z-20 bg-black/70 text-white text-xs p-2 rounded">
                    <div>Stream: {screenShareStream ? '✓' : '✗'}</div>
                    <div>Track: {screenShareStream?.track ? '✓' : '✗'}</div>
                    <div>Active: {screenShareOn ? '✓' : '✗'}</div>
                </div>
            </CardContent>
        </Card>
    );
}

// Enhanced Participant View Component
function ParticipantView({ participantId, isPresenting = false }: ParticipantViewProps): JSX.Element {
    const micRef = useRef<HTMLAudioElement>(null);
    const [mediaError, setMediaError] = useState(false);
    const [audioError, setAudioError] = useState(false);

    const {
        micStream,
        webcamOn,
        micOn,
        isLocal,
        displayName,
        webcamStream,
        screenShareOn,
        screenShareStream,
        enableMic,
        enableWebcam
    } = useParticipant(participantId);

    // Enhanced audio handling
    useEffect(() => {
        if (micRef.current) {
            if (micOn && micStream) {
                try {
                    const mediaStream = new MediaStream();
                    mediaStream.addTrack(micStream.track);
                    micRef.current.srcObject = mediaStream;

                    micRef.current.play()
                        .then(() => {
                            setAudioError(false);
                        })
                        .catch((error: Error) => {
                            console.error("Audio play failed:", error);
                            setAudioError(true);
                        });
                } catch (error) {
                    console.error("Failed to set up audio stream:", error);
                    setAudioError(true);
                }
            } else {
                micRef.current.srcObject = null;
                setAudioError(false);
            }
        }
    }, [micStream, micOn]);

    const handleMediaRetry = useCallback(async () => {
        setMediaError(false);
        try {
            if (isLocal) {
                if (!webcamOn) {
                    await enableWebcam();
                }
                if (!micOn) {
                    await enableMic();
                }
            }
        } catch (error) {
            console.error("Failed to retry media:", error);
            toast.error("Failed to access camera/microphone. Please check permissions.");
        }
    }, [isLocal, webcamOn, micOn, enableWebcam, enableMic]);

    return (
        <Card className={`relative overflow-hidden bg-gray-900 border-0 shadow-lg ${isPresenting ? 'order-first col-span-full lg:col-span-2 xl:col-span-3' : ''
            }`}>
            <CardContent className="p-0 aspect-video relative">
                {webcamOn && webcamStream ? (
                    <VideoPlayer
                        participantId={participantId}
                        containerStyle={{
                            height: "100%",
                            width: "100%",
                        }}
                        className="w-full h-full object-cover"
                        onError={() => setMediaError(true)}
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
                            {isLocal && !webcamOn && (
                                <Button
                                    onClick={handleMediaRetry}
                                    size="sm"
                                    variant="outline"
                                    className="mt-2 text-xs"
                                >
                                    <Video className="w-3 h-3 mr-1" />
                                    Enable Camera
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {/* Participant info overlay */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2 z-10">
                    <Badge
                        variant={isLocal ? "default" : "secondary"}
                        className={`text-xs ${isLocal ? 'bg-blue-600' : 'bg-black/50 text-white border-white/20'}`}
                    >
                        {displayName} {isLocal && "(You)"}
                        {screenShareOn && <Monitor className="w-3 h-3 ml-1" />}
                    </Badge>
                    <div className="flex gap-1">
                        {micOn ? (
                            <div className={`rounded-full p-1 ${audioError ? 'bg-yellow-500' : 'bg-green-500'}`}>
                                <Mic className="w-3 h-3 text-white" />
                            </div>
                        ) : (
                            <div className="bg-red-500 rounded-full p-1">
                                <MicOff className="w-3 h-3 text-white" />
                            </div>
                        )}
                        {webcamOn ? (
                            <div className={`rounded-full p-1 ${mediaError ? 'bg-yellow-500' : 'bg-green-500'}`}>
                                <Video className="w-3 h-3 text-white" />
                            </div>
                        ) : (
                            <div className="bg-red-500 rounded-full p-1">
                                <VideoOff className="w-3 h-3 text-white" />
                            </div>
                        )}
                    </div>
                </div>

                <audio
                    ref={micRef}
                    autoPlay
                    playsInline
                    muted={isLocal}
                    onError={() => setAudioError(true)}
                />
            </CardContent>
        </Card>
    );
}

// Enhanced Controls Component
function Controls(): JSX.Element {
    const {
        leave,
        toggleMic,
        toggleWebcam,
        enableScreenShare,
        disableScreenShare,
        localMicOn,
        localWebcamOn,
        localScreenShareOn,
        participants
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

    const otherScreenShareActive = useMemo(() => {
        return [...participants.values()].some(
            (participant: any) => participant.screenShareOn && !participant.isLocal
        );
    }, [participants]);

    const handleMicToggle = useCallback(async (): Promise<void> => {
        if (isToggling.mic) return;

        setIsToggling(prev => ({ ...prev, mic: true }));
        try {
            await toggleMic();
            toast.success(localMicOn ? "Microphone muted" : "Microphone unmuted");
        } catch (error) {
            console.error("Failed to toggle microphone:", error);
            toast.error("Failed to toggle microphone.");
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
            toast.error("Failed to toggle camera.");
        } finally {
            setIsToggling(prev => ({ ...prev, webcam: false }));
        }
    }, [toggleWebcam, localWebcamOn, isToggling.webcam]);

    const handleScreenShare = useCallback(async (): Promise<void> => {
        if (isToggling.screen) return;

        if (!localScreenShareOn && otherScreenShareActive) {
            toast.error("Someone else is already sharing their screen.");
            return;
        }

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
            toast.error("Failed to toggle screen sharing.");
        } finally {
            setIsToggling(prev => ({ ...prev, screen: false }));
        }
    }, [localScreenShareOn, disableScreenShare, enableScreenShare, isToggling.screen, otherScreenShareActive]);

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
                    variant={localScreenShareOn ? "destructive" : "outline"}
                    size="icon"
                    className="rounded-full w-12 h-12 transition-all hover:scale-105"
                    disabled={isToggling.screen || (!localScreenShareOn && otherScreenShareActive)}
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

            {/* Status indicators */}
            <div className="flex justify-center mt-2 gap-2 text-xs text-gray-600">
                {localScreenShareOn && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <Monitor className="w-3 h-3 mr-1" />
                        You are sharing your screen
                    </Badge>
                )}
                {otherScreenShareActive && !localScreenShareOn && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        <Monitor className="w-3 h-3 mr-1" />
                        Someone is sharing their screen
                    </Badge>
                )}
            </div>
        </div>
    );
}

// CRITICAL FIX: Enhanced Meeting View with better screen share detection
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
            console.log("Participant joined:", participant);
            toast.success(`${participant.displayName} joined the meeting`);
            setParticipantCount(prev => prev + 1);
        },
        onParticipantLeft: (participant: any) => {
            console.log("Participant left:", participant);
            toast.info(`${participant.displayName} left the meeting`);
            setParticipantCount(prev => Math.max(0, prev - 1));
        },
        onScreenShareStarted: () => {
            console.log("Screen sharing started event");
            toast.info("Screen sharing started");
        },
        onScreenShareStopped: () => {
            console.log("Screen sharing stopped event");
            toast.info("Screen sharing stopped");
        },
        onError: (error: any) => {
            console.error("Meeting error:", error);
            toast.error("Meeting error occurred.");
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
        console.log("Current participants:", ids);
        return ids;
    }, [participants]);

    // CRITICAL FIX: Better screen sharing detection
    const screenSharingParticipants = useMemo(() => {
        const sharingParticipants = participantIds.filter(id => {
            const participant = participants.get(id);
            const isSharing = participant?.screenShareOn;
            console.log(`Participant ${id} (${participant?.displayName}) - screenShareOn:`, isSharing);
            return isSharing;
        });
        console.log("Screen sharing participants:", sharingParticipants);
        return sharingParticipants;
    }, [participantIds, participants]);

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
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="flex items-center gap-2 bg-white/80">
                                    <Users className="w-4 h-4" />
                                    {participantCount} participant{participantCount !== 1 ? 's' : ''}
                                </Badge>
                                {screenSharingParticipants.length > 0 && (
                                    <Badge variant="outline" className="flex items-center gap-2 bg-blue-50 text-blue-700 border-blue-200">
                                        <Monitor className="w-4 h-4" />
                                        Screen sharing active ({screenSharingParticipants.length})
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
                            ID: {meetingId.slice(0, 8)}...
                        </Button>
                    </div>
                </div>

                {/* Video Grid */}
                <div className="flex-1 p-6 overflow-auto">
                    {screenSharingParticipants.length > 0 ? (
                        /* CRITICAL FIX: Screen sharing layout */
                        <div className="h-full flex flex-col gap-4">
                            {/* Screen share view - ALWAYS show when someone is sharing */}
                            <div className="flex-1 min-h-[400px]">
                                {screenSharingParticipants.map((participantId: string) => {
                                    console.log("Rendering ScreenShareView for:", participantId);
                                    return (
                                        <ScreenShareView key={`screen-${participantId}`} participantId={participantId} />
                                    );
                                })}
                            </div>

                            {/* Participant thumbnails */}
                            <div className="h-32 flex gap-2 overflow-x-auto">
                                {participantIds.map((participantId: string) => (
                                    <div key={participantId} className="min-w-[200px] h-full">
                                        <ParticipantView participantId={participantId} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Normal grid layout */
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
                    )}
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
        micEnabled: false,
        webcamEnabled: false,
        name: userName,
    };

    return (
        <MeetingProvider
            config={meetingConfig}
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