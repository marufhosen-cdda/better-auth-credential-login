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
        <div className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">Welcome!</h1>
            <div className="flex flex-wrap break-all rounded p-2 mb-2">
                Your device ID: <span className="ml-1 font-mono">{deviceId}</span>
            </div>
            <p className="text-base">
                This ID will remain the same across browser sessions on this device.
            </p>
        </div>
    );
}
