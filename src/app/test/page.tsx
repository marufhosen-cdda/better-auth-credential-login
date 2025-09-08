"use client";

import { useDeviceId } from '@/utils/deviceFingerprint';
import { JSX } from 'react';

// Option 1: Using the hook (recommended for React components)
export default function HomePage(): JSX.Element {
    const { deviceId, loading } = useDeviceId();

    if (loading) {
        return <div>Loading device identity...</div>;
    }

    return (
        <div>
            <h1>Welcome!</h1>
            <p>Your device ID: {deviceId}</p>
            <p>This ID will remain the same across browser sessions on this device.</p>
        </div>
    );
}
