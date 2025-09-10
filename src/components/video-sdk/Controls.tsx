// Controls.tsx - Enhanced meeting control interface
'use client';

import React, { JSX, useCallback, useState } from "react";
import { useMeeting } from "@videosdk.live/react-sdk";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
    Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, MonitorOff,
    MessageCircle
} from "lucide-react";
import { toast } from "sonner";
import { ToggleState } from "./types";
import { ChatPanel } from "./ChatPanel";
import { HandRaisePanel } from "./HandRaisePanel";

export function Controls(): JSX.Element {
    const {
        leave,
        toggleMic,
        toggleWebcam,
        enableScreenShare,
        disableScreenShare,
        localMicOn,
        localWebcamOn,
        localScreenShareOn,
        presenterId
    } = useMeeting();

    const [isToggling, setIsToggling] = useState<ToggleState>({
        mic: false,
        webcam: false,
        screen: false
    });

    const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

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
                            {/* <HandRaisePanel /> */}
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