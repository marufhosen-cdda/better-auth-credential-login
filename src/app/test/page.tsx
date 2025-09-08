"use client";

import { getDeviceCharacteristics, getDeviceId, regenerateDeviceId, useDeviceId } from '@/utils/deviceFingerprint';
import { JSX, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Option 1: Using the hook (recommended for React components)
export default function HomePage(): JSX.Element {
    const { deviceId, loading } = useDeviceId();
    const [characteristics, setCharacteristics] = useState<any>(null);

    const handleShowCharacteristics = async () => {
        const chars = await getDeviceCharacteristics();
        setCharacteristics(chars);
        console.log('Device characteristics:', chars);
    };

    const handleRegenerate = async () => {
        const newId = await regenerateDeviceId();
        console.log('New device ID:', newId);
        window.location.reload(); // Reload to see the new ID
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <span className="text-lg font-medium">Loading device identity...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col items-center px-2 py-8">
            <Card className="w-full max-w-xl shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl md:text-3xl font-bold">Welcome!</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-2"><strong>Your device ID:</strong> <span className="break-all">{deviceId}</span></p>
                    <p className="mb-2">This ID should be:</p>
                    <ul className="list-disc list-inside mb-4 text-sm text-muted-foreground">
                        <li>Same across different browsers on this device</li>
                        <li>Different on different devices</li>
                        <li>Persistent across browser sessions</li>
                    </ul>
                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                        <Button onClick={handleShowCharacteristics} variant="default">
                            Show Device Characteristics
                        </Button>
                        <Button onClick={handleRegenerate} variant="outline">
                            Regenerate ID (for testing)
                        </Button>
                    </div>
                    {characteristics && (
                        <div className="mt-6 bg-muted rounded p-4 overflow-x-auto">
                            <h3 className="font-semibold mb-2">Device Characteristics:</h3>
                            <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(characteristics, null, 2)}</pre>
                        </div>
                    )}
                </CardContent>
            </Card>
            <div className="w-full max-w-xl mt-8">
                <SimpleTestComponent />
            </div>
        </div>
    );
}

// Option 2: Simple component for quick testing
function SimpleTestComponent(): JSX.Element {
    const [deviceId, setDeviceId] = useState<string>('');
    const [browser, setBrowser] = useState<string>('');

    useEffect(() => {
        const initDeviceId = async (): Promise<void> => {
            try {
                const id: string = await getDeviceId();
                setDeviceId(id);

                // Detect browser for testing
                const userAgent = navigator.userAgent;
                let browserName = 'Unknown';
                if (userAgent.includes('Chrome')) browserName = 'Chrome';
                else if (userAgent.includes('Firefox')) browserName = 'Firefox';
                else if (userAgent.includes('Safari')) browserName = 'Safari';
                else if (userAgent.includes('Edge')) browserName = 'Edge';

                setBrowser(browserName);

            } catch (error) {
                console.error('Error:', error);
            }
        };

        initDeviceId();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Device ID Test</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="mb-1"><strong>Browser:</strong> {browser}</p>
                <p className="mb-1"><strong>Device ID:</strong> <span className="break-all">{deviceId}</span></p>
                <p className="mb-1"><strong>Short ID:</strong> {deviceId}</p>
                <div className="mt-3 text-sm text-muted-foreground">
                    <p>Expected behavior:</p>
                    <ul className="list-disc list-inside">
                        <li>Same short ID across all browsers on this device</li>
                        <li>Different short ID on different physical devices</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}