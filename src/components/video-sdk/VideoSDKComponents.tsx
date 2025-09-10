// VideoSDKComponents.tsx - Main wrapper component for VideoSDK meeting application
'use client';

import React, { JSX } from "react";
import { MeetingProvider } from "@videosdk.live/react-sdk";
import { VideoSDKComponentsProps, MeetingConfig } from "./types";
import { MeetingView } from "./MeetingView";

/**
 * Main VideoSDK Components wrapper
 * This is the entry point component that sets up the VideoSDK MeetingProvider
 * and renders the main meeting interface.
 */
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