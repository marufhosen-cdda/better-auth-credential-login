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
// import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff, Monitor, MonitorOff, Copy, Users, RefreshCw, Play } from "lucide-react";
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
// }

// interface PresenterViewProps {
//     presenterId: string;
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

// // FINAL SCREEN SHARE COMPONENT - Multiple fallback methods
// function PresenterView({ presenterId }: PresenterViewProps): JSX.Element {
//     const { screenShareStream, screenShareOn, isLocal, displayName, screenShareAudioStream } = useParticipant(presenterId);
//     const videoRef = useRef<HTMLVideoElement>(null);
//     const audioRef = useRef<HTMLAudioElement>(null);
//     const [streamMethod, setStreamMethod] = useState<'videoplayer' | 'manual' | 'fallback'>('videoplayer');
//     const [isVideoPlaying, setIsVideoPlaying] = useState(false);
//     const [retryCount, setRetryCount] = useState(0);

//     console.log("🎥 PresenterView - presenterId:", presenterId);
//     console.log("🎥 PresenterView - screenShareOn:", screenShareOn);
//     console.log("🎥 PresenterView - screenShareStream:", screenShareStream);
//     console.log("🎥 PresenterView - stream track:", screenShareStream?.track);

//     // Handle screen share audio
//     useEffect(() => {
//         if (!isLocal && audioRef.current && screenShareOn && screenShareAudioStream) {
//             try {
//                 const mediaStream = new MediaStream();
//                 mediaStream.addTrack(screenShareAudioStream.track);
//                 audioRef.current.srcObject = mediaStream;
//                 audioRef.current.play().catch(console.error);
//             } catch (error) {
//                 console.error("Screen share audio error:", error);
//             }
//         } else if (audioRef.current) {
//             audioRef.current.srcObject = null;
//         }
//     }, [screenShareAudioStream, screenShareOn, isLocal]);

//     // CRITICAL: Manual video stream handling for screen share
//     useEffect(() => {
//         if (streamMethod === 'manual' && videoRef.current && screenShareStream?.track) {
//             try {
//                 console.log("🎥 Setting up manual video stream");
//                 const mediaStream = new MediaStream([screenShareStream.track]);
//                 videoRef.current.srcObject = mediaStream;

//                 // Force play with multiple attempts
//                 const playVideo = async () => {
//                     try {
//                         await videoRef.current!.play();
//                         setIsVideoPlaying(true);
//                         console.log("🎥 Manual video playing successfully");
//                     } catch (error) {
//                         console.error("🎥 Manual video play failed:", error);
//                         if (retryCount < 3) {
//                             setTimeout(() => {
//                                 setRetryCount(prev => prev + 1);
//                                 playVideo();
//                             }, 1000);
//                         } else {
//                             setStreamMethod('fallback');
//                         }
//                     }
//                 };

//                 playVideo();
//             } catch (error) {
//                 console.error("🎥 Manual stream setup failed:", error);
//                 setStreamMethod('fallback');
//             }
//         }
//     }, [streamMethod, screenShareStream, retryCount]);

//     // Auto-switch to manual if VideoPlayer fails
//     useEffect(() => {
//         if (streamMethod === 'videoplayer' && screenShareStream?.track) {
//             // Give VideoPlayer 3 seconds to work, then switch to manual
//             const timeout = setTimeout(() => {
//                 if (!isVideoPlaying) {
//                     console.log("🎥 VideoPlayer failed, switching to manual");
//                     setStreamMethod('manual');
//                 }
//             }, 3000);

//             return () => clearTimeout(timeout);
//         }
//     }, [streamMethod, screenShareStream, isVideoPlaying]);

//     const forceManualMode = useCallback(() => {
//         console.log("🎥 Force switching to manual mode");
//         setStreamMethod('manual');
//         setRetryCount(0);
//     }, []);

//     const forceFallbackMode = useCallback(() => {
//         console.log("🎥 Force switching to fallback mode");
//         setStreamMethod('fallback');
//     }, []);

//     if (!screenShareOn) {
//         return (
//             <Card className="relative overflow-hidden bg-gray-900 border-2 border-yellow-500 shadow-xl">
//                 <CardContent className="p-0 aspect-video relative flex items-center justify-center">
//                     <div className="text-center text-white">
//                         <Monitor className="w-16 h-16 mx-auto mb-4 opacity-50" />
//                         <h3 className="text-lg font-semibold mb-2">Screen Share Stopped</h3>
//                         <p className="text-sm opacity-75">{displayName} stopped sharing</p>
//                     </div>
//                 </CardContent>
//             </Card>
//         );
//     }

//     if (!screenShareStream?.track) {
//         return (
//             <Card className="relative overflow-hidden bg-gray-900 border-2 border-red-500 shadow-xl">
//                 <CardContent className="p-0 aspect-video relative flex items-center justify-center">
//                     <div className="text-center text-white">
//                         <Monitor className="w-16 h-16 mx-auto mb-4 opacity-50" />
//                         <h3 className="text-lg font-semibold mb-2">No Screen Share Stream</h3>
//                         <p className="text-sm opacity-75">Waiting for {displayName}'s screen...</p>
//                         <Button
//                             onClick={() => window.location.reload()}
//                             variant="outline"
//                             size="sm"
//                             className="mt-4"
//                         >
//                             <RefreshCw className="w-4 h-4 mr-2" />
//                             Refresh
//                         </Button>
//                     </div>
//                 </CardContent>
//             </Card>
//         );
//     }

//     return (
//         <Card className="relative overflow-hidden bg-gray-900 border-2 border-green-500 shadow-xl">
//             <CardContent className="p-0 relative" style={{ minHeight: '400px' }}>

//                 {/* Method 1: VideoSDK VideoPlayer */}
//                 {streamMethod === 'videoplayer' && (
//                     <div className="relative w-full h-full">
//                         <VideoPlayer
//                             participantId={presenterId}
//                             containerStyle={{
//                                 height: "100%",
//                                 width: "100%",
//                                 minHeight: "400px",
//                             }}
//                             className="w-full h-full object-contain bg-black"
//                             onPlay={() => {
//                                 console.log("🎥 VideoPlayer started playing");
//                                 setIsVideoPlaying(true);
//                             }}
//                             onError={(error: any) => {
//                                 console.error("🎥 VideoPlayer error:", error);
//                                 setStreamMethod('manual');
//                             }}
//                         />

//                         {/* VideoPlayer fallback overlay */}
//                         <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
//                             <div className="text-center text-white">
//                                 <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
//                                 <p className="mb-4">Loading screen share...</p>
//                                 <Button onClick={forceManualMode} variant="outline" size="sm">
//                                     <Play className="w-4 h-4 mr-2" />
//                                     Force Manual Mode
//                                 </Button>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* Method 2: Manual Video Element */}
//                 {streamMethod === 'manual' && (
//                     <div className="relative w-full h-full">
//                         <video
//                             ref={videoRef}
//                             className="w-full h-full object-contain bg-black"
//                             autoPlay
//                             playsInline
//                             muted={false}
//                             controls={false}
//                             style={{ minHeight: '400px' }}
//                             onPlay={() => {
//                                 console.log("🎥 Manual video started playing");
//                                 setIsVideoPlaying(true);
//                             }}
//                             onLoadedData={() => {
//                                 console.log("🎥 Manual video loaded data");
//                                 setIsVideoPlaying(true);
//                             }}
//                             onError={(e) => {
//                                 console.error("🎥 Manual video error:", e);
//                                 setStreamMethod('fallback');
//                             }}
//                             onCanPlay={() => {
//                                 console.log("🎥 Manual video can play");
//                                 setIsVideoPlaying(true);
//                             }}
//                         />

//                         {!isVideoPlaying && (
//                             <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
//                                 <div className="text-center text-white">
//                                     <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
//                                     <p className="mb-4">Setting up manual stream... (Attempt {retryCount + 1}/3)</p>
//                                     <Button onClick={forceFallbackMode} variant="outline" size="sm">
//                                         Try Fallback Method
//                                     </Button>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 )}

//                 {/* Method 3: Fallback - Show stream info */}
//                 {streamMethod === 'fallback' && (
//                     <div className="w-full h-full flex items-center justify-center bg-gray-800" style={{ minHeight: '400px' }}>
//                         <div className="text-center text-white max-w-md">
//                             <Monitor className="w-24 h-24 mx-auto mb-6 text-green-500" />
//                             <h3 className="text-xl font-bold mb-4">Screen Share Active</h3>
//                             <p className="text-sm opacity-75 mb-6">
//                                 {displayName} is sharing their screen, but there's a display issue.
//                                 The content is being shared successfully.
//                             </p>
//                             <div className="space-y-2 text-xs bg-black/30 p-4 rounded">
//                                 <p>Stream: {screenShareStream ? '✅ Available' : '❌ Missing'}</p>
//                                 <p>Track: {screenShareStream?.track ? '✅ Available' : '❌ Missing'}</p>
//                                 <p>Sharing: {screenShareOn ? '✅ Active' : '❌ Inactive'}</p>
//                             </div>
//                             <div className="mt-6 space-x-2">
//                                 <Button onClick={() => setStreamMethod('videoplayer')} variant="outline" size="sm">
//                                     Try VideoPlayer
//                                 </Button>
//                                 <Button onClick={forceManualMode} variant="outline" size="sm">
//                                     Try Manual
//                                 </Button>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* Screen share overlay - Always visible */}
//                 <div className="absolute top-4 left-4 z-20">
//                     <Badge className="bg-green-600 text-white flex items-center gap-2 px-3 py-1">
//                         <Monitor className="w-4 h-4" />
//                         {displayName} is sharing screen
//                     </Badge>
//                 </div>

//                 {/* Method indicator */}
//                 <div className="absolute top-4 right-4 z-20">
//                     <Badge variant="outline" className="bg-black/70 text-white border-white/20 text-xs">
//                         Method: {streamMethod}
//                     </Badge>
//                 </div>

//                 {/* Video status indicator */}
//                 <div className="absolute bottom-4 right-4 z-20">
//                     <Badge
//                         variant="outline"
//                         className={`text-xs ${isVideoPlaying ? 'bg-green-900/70 text-green-100 border-green-400' : 'bg-red-900/70 text-red-100 border-red-400'}`}
//                     >
//                         {isVideoPlaying ? '🟢 Playing' : '🔴 Not Playing'}
//                     </Badge>
//                 </div>

//                 {/* Audio element for screen share audio */}
//                 <audio
//                     ref={audioRef}
//                     autoPlay
//                     playsInline
//                     controls={false}
//                 />
//             </CardContent>
//         </Card>
//     );
// }

// // Enhanced Participant View Component
// function ParticipantView({ participantId }: ParticipantViewProps): JSX.Element {
//     const micRef = useRef<HTMLAudioElement>(null);
//     const [mediaError, setMediaError] = useState(false);

//     const {
//         micStream,
//         webcamOn,
//         micOn,
//         isLocal,
//         displayName,
//         webcamStream,
//         screenShareOn
//     } = useParticipant(participantId);

//     // Enhanced audio handling
//     useEffect(() => {
//         if (micRef.current && micOn && micStream) {
//             try {
//                 const mediaStream = new MediaStream();
//                 mediaStream.addTrack(micStream.track);
//                 micRef.current.srcObject = mediaStream;
//                 micRef.current.play().catch((error: Error) => {
//                     console.error("Audio play failed:", error);
//                 });
//             } catch (error) {
//                 console.error("Failed to set up audio stream:", error);
//             }
//         } else if (micRef.current) {
//             micRef.current.srcObject = null;
//         }
//     }, [micStream, micOn]);

//     return (
//         <Card className="relative overflow-hidden bg-gray-900 border-0 shadow-lg">
//             <CardContent className="p-0 aspect-video relative">
//                 {webcamOn && webcamStream ? (
//                     <VideoPlayer
//                         participantId={participantId}
//                         containerStyle={{
//                             height: "100%",
//                             width: "100%",
//                         }}
//                         className="w-full h-full object-cover"
//                         onError={() => setMediaError(true)}
//                     />
//                 ) : (
//                     <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
//                         <div className="text-center">
//                             <Avatar className="w-16 h-16 mx-auto mb-3">
//                                 <AvatarFallback className="text-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
//                                     {displayName?.charAt(0)?.toUpperCase() || "P"}
//                                 </AvatarFallback>
//                             </Avatar>
//                             <p className="text-white text-sm opacity-75">{displayName}</p>
//                             {mediaError && (
//                                 <p className="text-red-400 text-xs mt-1">Media Error</p>
//                             )}
//                         </div>
//                     </div>
//                 )}

//                 {/* Participant info overlay */}
//                 <div className="absolute bottom-2 left-2 flex items-center gap-2 z-10">
//                     <Badge
//                         variant={isLocal ? "default" : "secondary"}
//                         className={`text-xs ${isLocal ? 'bg-blue-600' : 'bg-black/70 text-white border-white/20'}`}
//                     >
//                         {displayName} {isLocal && "(You)"}
//                         {screenShareOn && <Monitor className="w-3 h-3 ml-1" />}
//                     </Badge>
//                     <div className="flex gap-1">
//                         <div className={`rounded-full p-1 ${micOn ? 'bg-green-500' : 'bg-red-500'}`}>
//                             {micOn ? <Mic className="w-3 h-3 text-white" /> : <MicOff className="w-3 h-3 text-white" />}
//                         </div>
//                         <div className={`rounded-full p-1 ${webcamOn ? 'bg-green-500' : 'bg-red-500'}`}>
//                             {webcamOn ? <Video className="w-3 h-3 text-white" /> : <VideoOff className="w-3 h-3 text-white" />}
//                         </div>
//                     </div>
//                 </div>

//                 <audio ref={micRef} autoPlay playsInline muted={isLocal} />
//             </CardContent>
//         </Card>
//     );
// }

// // Enhanced Controls Component
// function Controls(): JSX.Element {
//     const {
//         leave,
//         toggleMic,
//         toggleWebcam,
//         enableScreenShare,
//         disableScreenShare,
//         toggleScreenShare,
//         localMicOn,
//         localWebcamOn,
//         localScreenShareOn,
//         presenterId
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

//         // Check if someone else is already presenting
//         if (!localScreenShareOn && presenterId) {
//             toast.error("Someone else is already sharing their screen");
//             return;
//         }

//         setIsToggling(prev => ({ ...prev, screen: true }));
//         try {
//             if (localScreenShareOn) {
//                 await disableScreenShare();
//                 toast.success("Screen sharing stopped");
//             } else {
//                 await enableScreenShare();
//                 toast.success("Screen sharing started - check if content is visible!");
//             }
//         } catch (error) {
//             console.error("Failed to toggle screen share:", error);
//             toast.error("Failed to toggle screen sharing");
//         } finally {
//             setIsToggling(prev => ({ ...prev, screen: false }));
//         }
//     }, [enableScreenShare, disableScreenShare, localScreenShareOn, presenterId, isToggling.screen]);

//     const handleLeave = useCallback((): void => {
//         if (window.confirm("Are you sure you want to leave the meeting?")) {
//             leave();
//         }
//     }, [leave]);

//     return (
//         <div className="bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4 shadow-lg">
//             <div className="flex items-center justify-center gap-4">
//                 <Button
//                     onClick={handleMicToggle}
//                     variant={localMicOn ? "default" : "destructive"}
//                     size="icon"
//                     className="rounded-full w-14 h-14 transition-all hover:scale-110 shadow-lg"
//                     disabled={isToggling.mic}
//                     title={localMicOn ? "Mute microphone" : "Unmute microphone"}
//                 >
//                     {isToggling.mic ? (
//                         <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
//                     ) : localMicOn ? (
//                         <Mic className="w-6 h-6" />
//                     ) : (
//                         <MicOff className="w-6 h-6" />
//                     )}
//                 </Button>

//                 <Button
//                     onClick={handleWebcamToggle}
//                     variant={localWebcamOn ? "default" : "destructive"}
//                     size="icon"
//                     className="rounded-full w-14 h-14 transition-all hover:scale-110 shadow-lg"
//                     disabled={isToggling.webcam}
//                     title={localWebcamOn ? "Turn off camera" : "Turn on camera"}
//                 >
//                     {isToggling.webcam ? (
//                         <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
//                     ) : localWebcamOn ? (
//                         <Video className="w-6 h-6" />
//                     ) : (
//                         <VideoOff className="w-6 h-6" />
//                     )}
//                 </Button>

//                 <Button
//                     onClick={handleScreenShare}
//                     variant={localScreenShareOn ? "destructive" : "outline"}
//                     size="icon"
//                     className="rounded-full w-14 h-14 transition-all hover:scale-110 shadow-lg"
//                     disabled={isToggling.screen || (!localScreenShareOn && !!presenterId)}
//                     title={
//                         presenterId && !localScreenShareOn
//                             ? "Someone else is sharing their screen"
//                             : localScreenShareOn
//                                 ? "Stop screen sharing"
//                                 : "Start screen sharing"
//                     }
//                 >
//                     {isToggling.screen ? (
//                         <div className="animate-spin rounded-full h-6 w-6 border-2 border-current border-t-transparent" />
//                     ) : localScreenShareOn ? (
//                         <MonitorOff className="w-6 h-6" />
//                     ) : (
//                         <Monitor className="w-6 h-6" />
//                     )}
//                 </Button>

//                 <Button
//                     onClick={handleLeave}
//                     variant="destructive"
//                     size="icon"
//                     className="rounded-full w-14 h-14 transition-all hover:scale-110 shadow-lg"
//                     title="Leave meeting"
//                 >
//                     <PhoneOff className="w-6 h-6" />
//                 </Button>
//             </div>

//             {/* Enhanced status indicators */}
//             <div className="flex justify-center mt-3 gap-3 text-sm">
//                 {localScreenShareOn && (
//                     <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
//                         <Monitor className="w-4 h-4 mr-2" />
//                         You are sharing your screen
//                     </Badge>
//                 )}
//                 {presenterId && !localScreenShareOn && (
//                     <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
//                         <Monitor className="w-4 h-4 mr-2" />
//                         Screen share in progress
//                     </Badge>
//                 )}
//             </div>
//         </div>
//     );
// }

// // PROPER Meeting View Implementation with enhanced presenter detection
// function MeetingView({ meetingId, onMeetingLeave, userName }: MeetingViewProps): JSX.Element {
//     const [joined, setJoined] = useState<string | null>(null);
//     const [participantCount, setParticipantCount] = useState<number>(0);

//     // Enhanced onPresenterChanged callback
//     const onPresenterChanged = useCallback((presenterId: string | null) => {
//         console.log("🎥 onPresenterChanged callback:", presenterId);
//         if (presenterId) {
//             console.log(`🎥 ${presenterId} started screen share`);
//             toast.success("Screen sharing started! Layout switched to presentation mode.");
//         } else {
//             console.log("🎥 Someone stopped screen share");
//             toast.info("Screen sharing stopped. Returning to normal layout.");
//         }
//     }, []);

//     const { join, participants, localParticipant, presenterId } = useMeeting({
//         onMeetingJoined: () => {
//             setJoined("JOINED");
//             toast.success("Successfully joined the meeting!");
//         },
//         onMeetingLeft: () => {
//             onMeetingLeave();
//             toast.info("Left the meeting");
//         },
//         onParticipantJoined: (participant: any) => {
//             console.log("🎥 Participant joined:", participant);
//             toast.success(`${participant.displayName} joined the meeting`);
//             setParticipantCount(prev => prev + 1);
//         },
//         onParticipantLeft: (participant: any) => {
//             console.log("🎥 Participant left:", participant);
//             toast.info(`${participant.displayName} left the meeting`);
//             setParticipantCount(prev => Math.max(0, prev - 1));
//         },
//         onPresenterChanged,
//         onError: (error: any) => {
//             console.error("Meeting error:", error);
//             toast.error("Meeting error occurred");
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
//         console.log("🎥 Current participants:", ids);
//         console.log("🎥 Current presenterId:", presenterId);
//         return ids;
//     }, [participants, presenterId]);

//     if (joined === "JOINED") {
//         return (
//             <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
//                 {/* Enhanced Header */}
//                 <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 p-4 shadow-sm">
//                     <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-4">
//                             <div className="flex items-center gap-3">
//                                 <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
//                                     <Video className="w-5 h-5 text-white" />
//                                 </div>
//                                 <div>
//                                     <h1 className="text-xl font-semibold text-gray-900">Video Meeting</h1>
//                                     <p className="text-sm text-gray-500">ID: {meetingId.slice(0, 8)}...</p>
//                                 </div>
//                             </div>
//                             <div className="flex items-center gap-3">
//                                 <Badge variant="outline" className="flex items-center gap-2 bg-white/80 px-3 py-1">
//                                     <Users className="w-4 h-4" />
//                                     {participantCount} participant{participantCount !== 1 ? 's' : ''}
//                                 </Badge>
//                                 {presenterId && (
//                                     <Badge variant="outline" className="flex items-center gap-2 bg-green-50 text-green-700 border-green-200 px-3 py-1">
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
//                             Copy ID
//                         </Button>
//                     </div>
//                 </div>

//                 {/* Enhanced Video Grid */}
//                 <div className="flex-1 p-6 overflow-auto">
//                     {presenterId ? (
//                         /* SCREEN SHARING LAYOUT */
//                         <div className="h-full flex flex-col gap-4">
//                             {/* Screen share view */}
//                             <div className="flex-1 min-h-[400px]">
//                                 <PresenterView presenterId={presenterId} />
//                             </div>

//                             {/* Participant thumbnails */}
//                             <div className="h-36 flex gap-3 overflow-x-auto py-2">
//                                 {participantIds.map((participantId: string) => (
//                                     <div key={participantId} className="min-w-[240px] h-full">
//                                         <ParticipantView participantId={participantId} />
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     ) : (
//                         /* Normal grid layout */
//                         <div className={`grid gap-4 h-full ${participantIds.length === 1 ? 'grid-cols-1 max-w-4xl mx-auto' :
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

//                 {/* Enhanced Controls */}
//                 <Controls />
//             </div>
//         );
//     }

//     if (joined === "JOINING") {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
//                 <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm">
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
//             <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm">
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
//         micEnabled: false, // Start with media disabled to avoid conflicts
//         webcamEnabled: false,
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


'use client';

import React, { useEffect, useMemo, useRef, useState, useCallback, JSX } from "react";
import {
    MeetingProvider,
    useMeeting,
    useParticipant,
    usePubSub,
    VideoPlayer,
} from "@videosdk.live/react-sdk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
    Mic, MicOff, Video, VideoOff, Phone, PhoneOff, Monitor, MonitorOff,
    Copy, Users, RefreshCw, Play, MessageCircle, Hand, Send, X,
    Bell, BellOff
} from "lucide-react";
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

interface PresenterViewProps {
    presenterId: string;
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

interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    message: string;
    timestamp: number;
}

interface HandRaiseEvent {
    id: string;
    senderId: string;
    senderName: string;
    timestamp: number;
}

// Chat Component
function ChatPanel(): JSX.Element {
    const [inputMessage, setInputMessage] = useState<string>("");
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { localParticipant } = useMeeting();

    const { publish: publishChat, messages: chatMessages } = usePubSub("CHAT", {
        onMessageReceived: (data: any) => {
            const message: ChatMessage = {
                id: data.id || Date.now().toString(),
                senderId: data.senderId,
                senderName: data.senderName,
                message: data.message,
                timestamp: data.timestamp || Date.now()
            };

            // Show notification for messages from other participants
            if (data.senderId !== localParticipant?.id) {
                toast.info(`${data.senderName}: ${data.message}`, {
                    duration: 3000,
                });
            }
        },
        onOldMessagesReceived: (messages: any[]) => {
            console.log("📨 Loaded chat history:", messages.length, "messages");
        }
    });

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatMessages]);

    const handleSendMessage = useCallback((): void => {
        if (!inputMessage.trim()) return;

        const messageData = {
            id: Date.now().toString(),
            senderId: localParticipant?.id,
            senderName: localParticipant?.displayName || "Unknown",
            message: inputMessage.trim(),
            timestamp: Date.now()
        };

        publishChat(JSON.stringify(messageData), { persist: true });
        setInputMessage("");
        setIsTyping(false);
    }, [inputMessage, publishChat, localParticipant]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent): void => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    }, [handleSendMessage]);

    const formatTime = (timestamp: number): string => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const parsedMessages = useMemo(() => {
        return chatMessages.map((msg: any) => {
            try {
                return JSON.parse(msg.message);
            } catch {
                return {
                    id: msg.id || Date.now().toString(),
                    senderId: msg.senderId,
                    senderName: msg.senderName,
                    message: msg.message,
                    timestamp: msg.timestamp || Date.now()
                };
            }
        }).sort((a: ChatMessage, b: ChatMessage) => a.timestamp - b.timestamp);
    }, [chatMessages]);

    return (
        <div className="flex flex-col h-96 bg-white rounded-lg border shadow-sm">
            <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
                <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Chat</h3>
                </div>
                <Badge variant="outline" className="text-xs">
                    {parsedMessages.length} messages
                </Badge>
            </div>

            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-3">
                    {parsedMessages.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No messages yet</p>
                            <p className="text-xs">Start the conversation!</p>
                        </div>
                    ) : (
                        parsedMessages.map((message: ChatMessage) => {
                            const isOwnMessage = message.senderId === localParticipant?.id;
                            return (
                                <div
                                    key={message.id}
                                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-lg px-3 py-2 ${isOwnMessage
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-900'
                                            }`}
                                    >
                                        {!isOwnMessage && (
                                            <p className="text-xs font-medium mb-1 opacity-70">
                                                {message.senderName}
                                            </p>
                                        )}
                                        <p className="text-sm break-words">{message.message}</p>
                                        <p className={`text-xs mt-1 opacity-70 ${isOwnMessage ? 'text-right' : 'text-left'
                                            }`}>
                                            {formatTime(message.timestamp)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </ScrollArea>

            <div className="p-4 border-t bg-gray-50 rounded-b-lg">
                <div className="flex gap-2">
                    <Input
                        placeholder="Type a message..."
                        value={inputMessage}
                        onChange={(e) => {
                            setInputMessage(e.target.value);
                            setIsTyping(e.target.value.length > 0);
                        }}
                        onKeyPress={handleKeyPress}
                        className="flex-1"
                        maxLength={500}
                    />
                    <Button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim()}
                        size="icon"
                        className="shrink-0"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
                {isTyping && (
                    <p className="text-xs text-gray-500 mt-1">
                        {inputMessage.length}/500 characters
                    </p>
                )}
            </div>
        </div>
    );
}

// Hand Raise Management Component
function HandRaisePanel(): JSX.Element {
    const [raisedHands, setRaisedHands] = useState<HandRaiseEvent[]>([]);
    const [isHandRaised, setIsHandRaised] = useState<boolean>(false);
    const { localParticipant } = useMeeting();

    const { publish: publishHandRaise } = usePubSub("RAISE_HAND", {
        onMessageReceived: (data: any) => {
            try {
                const handRaiseEvent: HandRaiseEvent = JSON.parse(data.message);

                if (handRaiseEvent.senderId !== localParticipant?.id) {
                    // Show notification for other participants' hand raises
                    toast.info(`${handRaiseEvent.senderName} raised their hand`, {
                        duration: 5000,
                        action: {
                            label: "View",
                            onClick: () => console.log("View hand raises")
                        }
                    });
                }

                setRaisedHands(prev => {
                    const existing = prev.find(h => h.senderId === handRaiseEvent.senderId);
                    if (existing) return prev;
                    return [...prev, handRaiseEvent].sort((a, b) => a.timestamp - b.timestamp);
                });
            } catch (error) {
                console.error("Failed to parse hand raise event:", error);
            }
        }
    });

    const handleRaiseHand = useCallback((): void => {
        if (isHandRaised) return;

        const handRaiseData: HandRaiseEvent = {
            id: Date.now().toString(),
            senderId: localParticipant?.id || "",
            senderName: localParticipant?.displayName || "Unknown",
            timestamp: Date.now()
        };

        publishHandRaise(JSON.stringify(handRaiseData));
        setIsHandRaised(true);
        setRaisedHands(prev => [...prev, handRaiseData]);
        toast.success("Hand raised! The host will be notified.");
    }, [isHandRaised, publishHandRaise, localParticipant]);

    const handleLowerHand = useCallback((participantId: string): void => {
        setRaisedHands(prev => prev.filter(h => h.senderId !== participantId));
        if (participantId === localParticipant?.id) {
            setIsHandRaised(false);
        }
    }, [localParticipant]);

    const formatTime = (timestamp: number): string => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Hand className="w-5 h-5 text-orange-600" />
                    <h3 className="font-semibold text-gray-900">Raised Hands</h3>
                </div>
                <Badge variant="outline" className="text-xs">
                    {raisedHands.length}
                </Badge>
            </div>

            <Button
                onClick={handleRaiseHand}
                disabled={isHandRaised}
                variant={isHandRaised ? "destructive" : "outline"}
                className="w-full"
            >
                <Hand className="w-4 h-4 mr-2" />
                {isHandRaised ? "Hand Raised" : "Raise Hand"}
            </Button>

            <div className="space-y-2">
                {raisedHands.length === 0 ? (
                    <div className="text-center text-gray-500 py-6">
                        <Hand className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No hands raised</p>
                    </div>
                ) : (
                    raisedHands.map((hand) => (
                        <div
                            key={hand.id}
                            className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg"
                        >
                            <div className="flex items-center gap-2">
                                <Hand className="w-4 h-4 text-orange-600" />
                                <div>
                                    <p className="font-medium text-sm text-gray-900">
                                        {hand.senderName}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {formatTime(hand.timestamp)}
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={() => handleLowerHand(hand.senderId)}
                                variant="ghost"
                                size="sm"
                                className="text-orange-600 hover:text-orange-700"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// FINAL SCREEN SHARE COMPONENT - Multiple fallback methods
function PresenterView({ presenterId }: PresenterViewProps): JSX.Element {
    const { screenShareStream, screenShareOn, isLocal, displayName, screenShareAudioStream } = useParticipant(presenterId);
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [streamMethod, setStreamMethod] = useState<'videoplayer' | 'manual' | 'fallback'>('videoplayer');
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    console.log("🎥 PresenterView - presenterId:", presenterId);
    console.log("🎥 PresenterView - screenShareOn:", screenShareOn);
    console.log("🎥 PresenterView - screenShareStream:", screenShareStream);
    console.log("🎥 PresenterView - stream track:", screenShareStream?.track);

    // Handle screen share audio
    useEffect(() => {
        if (!isLocal && audioRef.current && screenShareOn && screenShareAudioStream) {
            try {
                const mediaStream = new MediaStream();
                mediaStream.addTrack(screenShareAudioStream.track);
                audioRef.current.srcObject = mediaStream;
                audioRef.current.play().catch(console.error);
            } catch (error) {
                console.error("Screen share audio error:", error);
            }
        } else if (audioRef.current) {
            audioRef.current.srcObject = null;
        }
    }, [screenShareAudioStream, screenShareOn, isLocal]);

    // CRITICAL: Manual video stream handling for screen share
    useEffect(() => {
        if (streamMethod === 'manual' && videoRef.current && screenShareStream?.track) {
            try {
                console.log("🎥 Setting up manual video stream");
                const mediaStream = new MediaStream([screenShareStream.track]);
                videoRef.current.srcObject = mediaStream;

                // Force play with multiple attempts
                const playVideo = async () => {
                    try {
                        await videoRef.current!.play();
                        setIsVideoPlaying(true);
                        console.log("🎥 Manual video playing successfully");
                    } catch (error) {
                        console.error("🎥 Manual video play failed:", error);
                        if (retryCount < 3) {
                            setTimeout(() => {
                                setRetryCount(prev => prev + 1);
                                playVideo();
                            }, 1000);
                        } else {
                            setStreamMethod('fallback');
                        }
                    }
                };

                playVideo();
            } catch (error) {
                console.error("🎥 Manual stream setup failed:", error);
                setStreamMethod('fallback');
            }
        }
    }, [streamMethod, screenShareStream, retryCount]);

    // Auto-switch to manual if VideoPlayer fails
    useEffect(() => {
        if (streamMethod === 'videoplayer' && screenShareStream?.track) {
            // Give VideoPlayer 3 seconds to work, then switch to manual
            const timeout = setTimeout(() => {
                if (!isVideoPlaying) {
                    console.log("🎥 VideoPlayer failed, switching to manual");
                    setStreamMethod('manual');
                }
            }, 3000);

            return () => clearTimeout(timeout);
        }
    }, [streamMethod, screenShareStream, isVideoPlaying]);

    const forceManualMode = useCallback(() => {
        console.log("🎥 Force switching to manual mode");
        setStreamMethod('manual');
        setRetryCount(0);
    }, []);

    const forceFallbackMode = useCallback(() => {
        console.log("🎥 Force switching to fallback mode");
        setStreamMethod('fallback');
    }, []);

    if (!screenShareOn) {
        return (
            <Card className="relative overflow-hidden bg-gray-900 border-2 border-yellow-500 shadow-xl">
                <CardContent className="p-0 aspect-video relative flex items-center justify-center">
                    <div className="text-center text-white">
                        <Monitor className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">Screen Share Stopped</h3>
                        <p className="text-sm opacity-75">{displayName} stopped sharing</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!screenShareStream?.track) {
        return (
            <Card className="relative overflow-hidden bg-gray-900 border-2 border-red-500 shadow-xl">
                <CardContent className="p-0 aspect-video relative flex items-center justify-center">
                    <div className="text-center text-white">
                        <Monitor className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">No Screen Share Stream</h3>
                        <p className="text-sm opacity-75">Waiting for {displayName}'s screen...</p>
                        <Button
                            onClick={() => window.location.reload()}
                            variant="outline"
                            size="sm"
                            className="mt-4"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="relative overflow-hidden bg-gray-900 border-2 border-green-500 shadow-xl">
            <CardContent className="p-0 relative" style={{ minHeight: '400px' }}>

                {/* Method 1: VideoSDK VideoPlayer */}
                {streamMethod === 'videoplayer' && (
                    <div className="relative w-full h-full">
                        <VideoPlayer
                            participantId={presenterId}
                            containerStyle={{
                                height: "100%",
                                width: "100%",
                                minHeight: "400px",
                            }}
                            className="w-full h-full object-contain bg-black"
                            onPlay={() => {
                                console.log("🎥 VideoPlayer started playing");
                                setIsVideoPlaying(true);
                            }}
                            onError={(error: any) => {
                                console.error("🎥 VideoPlayer error:", error);
                                setStreamMethod('manual');
                            }}
                        />

                        {/* VideoPlayer fallback overlay */}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="text-center text-white">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
                                <p className="mb-4">Loading screen share...</p>
                                <Button onClick={forceManualMode} variant="outline" size="sm">
                                    <Play className="w-4 h-4 mr-2" />
                                    Force Manual Mode
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Method 2: Manual Video Element */}
                {streamMethod === 'manual' && (
                    <div className="relative w-full h-full">
                        <video
                            ref={videoRef}
                            className="w-full h-full object-contain bg-black"
                            autoPlay
                            playsInline
                            muted={false}
                            controls={false}
                            style={{ minHeight: '400px' }}
                            onPlay={() => {
                                console.log("🎥 Manual video started playing");
                                setIsVideoPlaying(true);
                            }}
                            onLoadedData={() => {
                                console.log("🎥 Manual video loaded data");
                                setIsVideoPlaying(true);
                            }}
                            onError={(e) => {
                                console.error("🎥 Manual video error:", e);
                                setStreamMethod('fallback');
                            }}
                            onCanPlay={() => {
                                console.log("🎥 Manual video can play");
                                setIsVideoPlaying(true);
                            }}
                        />

                        {!isVideoPlaying && (
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                <div className="text-center text-white">
                                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                                    <p className="mb-4">Setting up manual stream... (Attempt {retryCount + 1}/3)</p>
                                    <Button onClick={forceFallbackMode} variant="outline" size="sm">
                                        Try Fallback Method
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Method 3: Fallback - Show stream info */}
                {streamMethod === 'fallback' && (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800" style={{ minHeight: '400px' }}>
                        <div className="text-center text-white max-w-md">
                            <Monitor className="w-24 h-24 mx-auto mb-6 text-green-500" />
                            <h3 className="text-xl font-bold mb-4">Screen Share Active</h3>
                            <p className="text-sm opacity-75 mb-6">
                                {displayName} is sharing their screen, but there's a display issue.
                                The content is being shared successfully.
                            </p>
                            <div className="space-y-2 text-xs bg-black/30 p-4 rounded">
                                <p>Stream: {screenShareStream ? '✅ Available' : '❌ Missing'}</p>
                                <p>Track: {screenShareStream?.track ? '✅ Available' : '❌ Missing'}</p>
                                <p>Sharing: {screenShareOn ? '✅ Active' : '❌ Inactive'}</p>
                            </div>
                            <div className="mt-6 space-x-2">
                                <Button onClick={() => setStreamMethod('videoplayer')} variant="outline" size="sm">
                                    Try VideoPlayer
                                </Button>
                                <Button onClick={forceManualMode} variant="outline" size="sm">
                                    Try Manual
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Screen share overlay - Always visible */}
                <div className="absolute top-4 left-4 z-20">
                    <Badge className="bg-green-600 text-white flex items-center gap-2 px-3 py-1">
                        <Monitor className="w-4 h-4" />
                        {displayName} is sharing screen
                    </Badge>
                </div>

                {/* Method indicator */}
                <div className="absolute top-4 right-4 z-20">
                    <Badge variant="outline" className="bg-black/70 text-white border-white/20 text-xs">
                        Method: {streamMethod}
                    </Badge>
                </div>

                {/* Video status indicator */}
                <div className="absolute bottom-4 right-4 z-20">
                    <Badge
                        variant="outline"
                        className={`text-xs ${isVideoPlaying ? 'bg-green-900/70 text-green-100 border-green-400' : 'bg-red-900/70 text-red-100 border-red-400'}`}
                    >
                        {isVideoPlaying ? '🟢 Playing' : '🔴 Not Playing'}
                    </Badge>
                </div>

                {/* Audio element for screen share audio */}
                <audio
                    ref={audioRef}
                    autoPlay
                    playsInline
                    controls={false}
                />
            </CardContent>
        </Card>
    );
}

// Enhanced Participant View Component
function ParticipantView({ participantId }: ParticipantViewProps): JSX.Element {
    const micRef = useRef<HTMLAudioElement>(null);
    const [mediaError, setMediaError] = useState(false);

    const {
        micStream,
        webcamOn,
        micOn,
        isLocal,
        displayName,
        webcamStream,
        screenShareOn
    } = useParticipant(participantId);

    // Enhanced audio handling
    useEffect(() => {
        if (micRef.current && micOn && micStream) {
            try {
                const mediaStream = new MediaStream();
                mediaStream.addTrack(micStream.track);
                micRef.current.srcObject = mediaStream;
                micRef.current.play().catch((error: Error) => {
                    console.error("Audio play failed:", error);
                });
            } catch (error) {
                console.error("Failed to set up audio stream:", error);
            }
        } else if (micRef.current) {
            micRef.current.srcObject = null;
        }
    }, [micStream, micOn]);

    return (
        <Card className="relative overflow-hidden bg-gray-900 border-0 shadow-lg">
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
                            <Avatar className="w-16 h-16 mx-auto mb-3">
                                <AvatarFallback className="text-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                                    {displayName?.charAt(0)?.toUpperCase() || "P"}
                                </AvatarFallback>
                            </Avatar>
                            <p className="text-white text-sm opacity-75">{displayName}</p>
                            {mediaError && (
                                <p className="text-red-400 text-xs mt-1">Media Error</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Participant info overlay */}
                <div className="absolute bottom-2 left-2 flex items-center gap-2 z-10">
                    <Badge
                        variant={isLocal ? "default" : "secondary"}
                        className={`text-xs ${isLocal ? 'bg-blue-600' : 'bg-black/70 text-white border-white/20'}`}
                    >
                        {displayName} {isLocal && "(You)"}
                        {screenShareOn && <Monitor className="w-3 h-3 ml-1" />}
                    </Badge>
                    <div className="flex gap-1">
                        <div className={`rounded-full p-1 ${micOn ? 'bg-green-500' : 'bg-red-500'}`}>
                            {micOn ? <Mic className="w-3 h-3 text-white" /> : <MicOff className="w-3 h-3 text-white" />}
                        </div>
                        <div className={`rounded-full p-1 ${webcamOn ? 'bg-green-500' : 'bg-red-500'}`}>
                            {webcamOn ? <Video className="w-3 h-3 text-white" /> : <VideoOff className="w-3 h-3 text-white" />}
                        </div>
                    </div>
                </div>

                <audio ref={micRef} autoPlay playsInline muted={isLocal} />
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
        toggleScreenShare,
        localMicOn,
        localWebcamOn,
        localScreenShareOn,
        presenterId
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

    const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
    const [showHandRaise, setShowHandRaise] = useState<boolean>(false);

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

        // Check if someone else is already presenting
        if (!localScreenShareOn && presenterId) {
            toast.error("Someone else is already sharing their screen");
            return;
        }

        setIsToggling(prev => ({ ...prev, screen: true }));
        try {
            if (localScreenShareOn) {
                await disableScreenShare();
                toast.success("Screen sharing stopped");
            } else {
                await enableScreenShare();
                toast.success("Screen sharing started - check if content is visible!");
            }
        } catch (error) {
            console.error("Failed to toggle screen share:", error);
            toast.error("Failed to toggle screen sharing");
        } finally {
            setIsToggling(prev => ({ ...prev, screen: false }));
        }
    }, [enableScreenShare, disableScreenShare, localScreenShareOn, presenterId, isToggling.screen]);

    const handleLeave = useCallback((): void => {
        if (window.confirm("Are you sure you want to leave the meeting?")) {
            leave();
        }
    }, [leave]);

    return (
        <div className="bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4 shadow-lg">
            <div className="flex items-center justify-center gap-4">
                {/* Main Controls */}
                <Button
                    onClick={handleMicToggle}
                    variant={localMicOn ? "default" : "destructive"}
                    size="icon"
                    className="rounded-full w-14 h-14 transition-all hover:scale-110 shadow-lg"
                    disabled={isToggling.mic}
                    title={localMicOn ? "Mute microphone" : "Unmute microphone"}
                >
                    {isToggling.mic ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                    ) : localMicOn ? (
                        <Mic className="w-6 h-6" />
                    ) : (
                        <MicOff className="w-6 h-6" />
                    )}
                </Button>

                <Button
                    onClick={handleWebcamToggle}
                    variant={localWebcamOn ? "default" : "destructive"}
                    size="icon"
                    className="rounded-full w-14 h-14 transition-all hover:scale-110 shadow-lg"
                    disabled={isToggling.webcam}
                    title={localWebcamOn ? "Turn off camera" : "Turn on camera"}
                >
                    {isToggling.webcam ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                    ) : localWebcamOn ? (
                        <Video className="w-6 h-6" />
                    ) : (
                        <VideoOff className="w-6 h-6" />
                    )}
                </Button>

                <Button
                    onClick={handleScreenShare}
                    variant={localScreenShareOn ? "destructive" : "outline"}
                    size="icon"
                    className="rounded-full w-14 h-14 transition-all hover:scale-110 shadow-lg"
                    disabled={isToggling.screen || (!localScreenShareOn && !!presenterId)}
                    title={
                        presenterId && !localScreenShareOn
                            ? "Someone else is sharing their screen"
                            : localScreenShareOn
                                ? "Stop screen sharing"
                                : "Start screen sharing"
                    }
                >
                    {isToggling.screen ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-current border-t-transparent" />
                    ) : localScreenShareOn ? (
                        <MonitorOff className="w-6 h-6" />
                    ) : (
                        <Monitor className="w-6 h-6" />
                    )}
                </Button>

                {/* Chat Button */}
                <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
                    <SheetTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full w-14 h-14 transition-all hover:scale-110 shadow-lg"
                            title="Open chat"
                        >
                            <MessageCircle className="w-6 h-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-96 sm:w-[400px]">
                        <SheetHeader>
                            <SheetTitle>Meeting Chat & Features</SheetTitle>
                            <SheetDescription>
                                Chat with participants and manage hand raises
                            </SheetDescription>
                        </SheetHeader>
                        <div className="space-y-6 mt-6">
                            <ChatPanel />
                            <Separator />
                            <HandRaisePanel />
                        </div>
                    </SheetContent>
                </Sheet>

                <Button
                    onClick={handleLeave}
                    variant="destructive"
                    size="icon"
                    className="rounded-full w-14 h-14 transition-all hover:scale-110 shadow-lg"
                    title="Leave meeting"
                >
                    <PhoneOff className="w-6 h-6" />
                </Button>
            </div>

            {/* Enhanced status indicators */}
            <div className="flex justify-center mt-3 gap-3 text-sm">
                {localScreenShareOn && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
                        <Monitor className="w-4 h-4 mr-2" />
                        You are sharing your screen
                    </Badge>
                )}
                {presenterId && !localScreenShareOn && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                        <Monitor className="w-4 h-4 mr-2" />
                        Screen share in progress
                    </Badge>
                )}
            </div>
        </div>
    );
}

// PROPER Meeting View Implementation with enhanced presenter detection
function MeetingView({ meetingId, onMeetingLeave, userName }: MeetingViewProps): JSX.Element {
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
                        <div className={`grid gap-4 h-full ${participantIds.length === 1 ? 'grid-cols-1 max-w-4xl mx-auto' :
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

// Main VideoSDK Components wrapper
export default function VideoSDKComponents({
    meetingId,
    authToken,
    userName,
    onMeetingLeave
}: VideoSDKComponentsProps): JSX.Element {
    const meetingConfig: MeetingConfig = {
        meetingId,
        micEnabled: false, // Start with media disabled to avoid conflicts
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