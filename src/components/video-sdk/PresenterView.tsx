// PresenterView.tsx - Screen sharing display with multiple fallback methods
'use client';

import React, { JSX, useCallback, useEffect, useRef, useState } from "react";
import { useParticipant, VideoPlayer } from "@videosdk.live/react-sdk";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Monitor, RefreshCw, Play } from "lucide-react";
import { PresenterViewProps } from "./types";

export function PresenterView({ presenterId }: PresenterViewProps): JSX.Element {
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