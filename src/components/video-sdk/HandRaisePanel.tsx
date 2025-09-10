// HandRaisePanel.tsx - Hand raise management component
'use client';

import React, { JSX, useCallback, useState } from "react";
import { useMeeting, usePubSub } from "@videosdk.live/react-sdk";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Hand, X } from "lucide-react";
import { toast } from "sonner";
import { HandRaiseEvent } from "./types";

export function HandRaisePanel(): JSX.Element {
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