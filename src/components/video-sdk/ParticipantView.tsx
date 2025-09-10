// ParticipantView.tsx - Individual participant video/audio display
'use client';

import React, { JSX, useEffect, useRef, useState } from "react";
import { useParticipant, VideoPlayer } from "@videosdk.live/react-sdk";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mic, MicOff, Video, VideoOff, Monitor } from "lucide-react";
import { ParticipantViewProps } from "./types";

export function ParticipantView({ participantId }: ParticipantViewProps): JSX.Element {
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
        <Card className="relative overflow-hidden p-0 border-0 shadow-lg">
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