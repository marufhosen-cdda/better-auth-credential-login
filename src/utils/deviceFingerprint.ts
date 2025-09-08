// utils/deviceFingerprint.ts
import { useEffect, useState } from 'react';

interface DeviceInfo {
    screenResolution: string;
    screenColorDepth: number;
    pixelRatio: number;
    platform: string;
    hardwareConcurrency: number;
    maxTouchPoints: number;
    timezone: string;
    timezoneOffset: number;
    availableScreenSize: string;
    screenOrientation: string;
}

// Generate a hash from a string
async function generateHash(str: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Collect only hardware/device-specific characteristics (not browser-specific)
function collectDeviceInfo(): DeviceInfo {
    const info: DeviceInfo = {
        // Screen characteristics (hardware-specific)
        screenResolution: `${screen.width}x${screen.height}`,
        screenColorDepth: screen.colorDepth,
        pixelRatio: window.devicePixelRatio || 1,
        availableScreenSize: `${screen.availWidth}x${screen.availHeight}`,
        screenOrientation: screen.orientation ? screen.orientation.type : 'unknown',

        // Platform (OS-specific, not browser-specific)
        platform: navigator.platform,

        // Hardware characteristics
        hardwareConcurrency: navigator.hardwareConcurrency || 0,
        maxTouchPoints: navigator.maxTouchPoints || 0,

        // Timezone (location/OS-specific)
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezoneOffset: new Date().getTimezoneOffset(),
    };

    return info;
}

// Generate a more stable device-specific identifier
function getStableDeviceKey(): string {
    try {
        // Try to get a machine-specific identifier
        const machineId = localStorage.getItem('machine_device_id');
        if (machineId) {
            return machineId;
        }

        // Generate based on hardware characteristics only
        const deviceInfo = collectDeviceInfo();
        const deviceString = Object.entries(deviceInfo)
            .map(([key, value]) => `${key}:${value}`)
            .join('|');

        return deviceString;
    } catch (error) {
        console.warn('Error collecting device info:', error);
        return 'fallback-device-key';
    }
}

// Main function to generate device ID
export async function generateDeviceId(): Promise<string> {
    try {
        // First, check if we have a cross-browser device ID stored
        const crossBrowserKey = 'cross_browser_device_id';

        // Try to get from localStorage first
        let existingId = localStorage.getItem(crossBrowserKey);

        // If not found, try to generate based on hardware fingerprint
        if (!existingId) {
            const stableKey = getStableDeviceKey();
            const deviceId = await generateHash(stableKey);

            // Store in localStorage
            localStorage.setItem(crossBrowserKey, deviceId);
            localStorage.setItem('device_fingerprint_created', new Date().toISOString());

            // Also try to store in a way that might be accessible cross-browser
            // Note: This is limited, but we can try sessionStorage as backup
            try {
                sessionStorage.setItem(crossBrowserKey, deviceId);
            } catch (e) {
                // Ignore if sessionStorage fails
            }

            existingId = deviceId;
        }

        return existingId;
    } catch (error) {
        console.warn('Failed to generate device fingerprint:', error);
        return getFallbackDeviceId();
    }
}

// Fallback method using a simpler approach
function getFallbackDeviceId(): string {
    const fallbackKey = 'simple_device_id';
    let fallbackId = localStorage.getItem(fallbackKey);

    if (!fallbackId) {
        // Create a simple ID based on screen and basic hardware info
        const simpleFingerprint = [
            screen.width,
            screen.height,
            screen.colorDepth,
            navigator.hardwareConcurrency || 0,
            navigator.platform,
            Intl.DateTimeFormat().resolvedOptions().timeZone
        ].join('-');

        fallbackId = 'simple_' + btoa(simpleFingerprint).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
        localStorage.setItem(fallbackKey, fallbackId);
    }

    return fallbackId;
}

// Function to get device ID with fallback
export async function getDeviceId(): Promise<string> {
    return await generateDeviceId();
}

interface UseDeviceIdReturn {
    deviceId: string | null;
    loading: boolean;
}

// Hook for React components
export function useDeviceId(): UseDeviceIdReturn {
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        getDeviceId()
            .then((id: string) => {
                setDeviceId(id);
                setLoading(false);
            })
            .catch((error: Error) => {
                console.error('Error getting device ID:', error);
                setLoading(false);
            });
    }, []);

    return { deviceId, loading };
}

// Additional utility: Force regenerate device ID (useful for testing)
export async function regenerateDeviceId(): Promise<string> {
    // Clear existing IDs
    localStorage.removeItem('cross_browser_device_id');
    localStorage.removeItem('simple_device_id');
    localStorage.removeItem('device_fingerprint_created');

    // Generate new ID
    return await generateDeviceId();
}