// // utils/deviceFingerprint.ts
// import { useEffect, useState } from 'react';

// interface DeviceInfo {
//     screenResolution: string;
//     screenColorDepth: number;
//     pixelRatio: number;
//     platform: string;
//     hardwareConcurrency: number;
//     maxTouchPoints: number;
//     timezone: string;
//     timezoneOffset: number;
//     availableScreenSize: string;
//     screenOrientation: string;
// }

// // Generate a hash from a string
// async function generateHash(str: string): Promise<string> {
//     const encoder = new TextEncoder();
//     const data = encoder.encode(str);
//     const hashBuffer = await crypto.subtle.digest('SHA-256', data);
//     const hashArray = Array.from(new Uint8Array(hashBuffer));
//     return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
// }

// // Collect only hardware/device-specific characteristics (not browser-specific)
// function collectDeviceInfo(): DeviceInfo {
//     const info: DeviceInfo = {
//         // Screen characteristics (hardware-specific)
//         screenResolution: `${screen.width}x${screen.height}`,
//         screenColorDepth: screen.colorDepth,
//         pixelRatio: window.devicePixelRatio || 1,
//         availableScreenSize: `${screen.availWidth}x${screen.availHeight}`,
//         screenOrientation: screen.orientation ? screen.orientation.type : 'unknown',

//         // Platform (OS-specific, not browser-specific)
//         platform: navigator.platform,

//         // Hardware characteristics
//         hardwareConcurrency: navigator.hardwareConcurrency || 0,
//         maxTouchPoints: navigator.maxTouchPoints || 0,

//         // Timezone (location/OS-specific)
//         timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//         timezoneOffset: new Date().getTimezoneOffset(),
//     };

//     return info;
// }

// // Generate a more stable device-specific identifier
// function getStableDeviceKey(): string {
//     try {
//         // Try to get a machine-specific identifier
//         const machineId = localStorage.getItem('machine_device_id');
//         if (machineId) {
//             return machineId;
//         }

//         // Generate based on hardware characteristics only
//         const deviceInfo = collectDeviceInfo();
//         const deviceString = Object.entries(deviceInfo)
//             .map(([key, value]) => `${key}:${value}`)
//             .join('|');

//         return deviceString;
//     } catch (error) {
//         console.warn('Error collecting device info:', error);
//         return 'fallback-device-key';
//     }
// }

// // Main function to generate device ID
// export async function generateDeviceId(): Promise<string> {
//     try {
//         // First, check if we have a cross-browser device ID stored
//         const crossBrowserKey = 'cross_browser_device_id';

//         // Try to get from localStorage first
//         let existingId = localStorage.getItem(crossBrowserKey);

//         // If not found, try to generate based on hardware fingerprint
//         if (!existingId) {
//             const stableKey = getStableDeviceKey();
//             const deviceId = await generateHash(stableKey);

//             // Store in localStorage
//             localStorage.setItem(crossBrowserKey, deviceId);
//             localStorage.setItem('device_fingerprint_created', new Date().toISOString());

//             // Also try to store in a way that might be accessible cross-browser
//             // Note: This is limited, but we can try sessionStorage as backup
//             try {
//                 sessionStorage.setItem(crossBrowserKey, deviceId);
//             } catch (e) {
//                 // Ignore if sessionStorage fails
//             }

//             existingId = deviceId;
//         }

//         return existingId;
//     } catch (error) {
//         console.warn('Failed to generate device fingerprint:', error);
//         return getFallbackDeviceId();
//     }
// }

// // Fallback method using a simpler approach
// function getFallbackDeviceId(): string {
//     const fallbackKey = 'simple_device_id';
//     let fallbackId = localStorage.getItem(fallbackKey);

//     if (!fallbackId) {
//         // Create a simple ID based on screen and basic hardware info
//         const simpleFingerprint = [
//             screen.width,
//             screen.height,
//             screen.colorDepth,
//             navigator.hardwareConcurrency || 0,
//             navigator.platform,
//             Intl.DateTimeFormat().resolvedOptions().timeZone
//         ].join('-');

//         fallbackId = 'simple_' + btoa(simpleFingerprint).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
//         localStorage.setItem(fallbackKey, fallbackId);
//     }

//     return fallbackId;
// }

// // Function to get device ID with fallback
// export async function getDeviceId(): Promise<string> {
//     return await generateDeviceId();
// }

// interface UseDeviceIdReturn {
//     deviceId: string | null;
//     loading: boolean;
// }

// // Hook for React components
// export function useDeviceId(): UseDeviceIdReturn {
//     const [deviceId, setDeviceId] = useState<string | null>(null);
//     const [loading, setLoading] = useState<boolean>(true);

//     useEffect(() => {
//         getDeviceId()
//             .then((id: string) => {
//                 setDeviceId(id);
//                 setLoading(false);
//             })
//             .catch((error: Error) => {
//                 console.error('Error getting device ID:', error);
//                 setLoading(false);
//             });
//     }, []);

//     return { deviceId, loading };
// }

// // Additional utility: Force regenerate device ID (useful for testing)
// export async function regenerateDeviceId(): Promise<string> {
//     // Clear existing IDs
//     localStorage.removeItem('cross_browser_device_id');
//     localStorage.removeItem('simple_device_id');
//     localStorage.removeItem('device_fingerprint_created');

//     // Generate new ID
//     return await generateDeviceId();
// }

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
    deviceMemory: number;
    networkType: string;
    vendor: string;
    oscpu: string;
    buildID: string;
    canvasFingerprint: string;
    audioContext: string;
}

// Generate a hash from a string
async function generateHash(str: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Get a more detailed canvas fingerprint that's consistent across browsers
function getConsistentCanvasFingerprint(): string {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return 'no-canvas';

        // Set consistent canvas size
        canvas.width = 200;
        canvas.height = 50;

        // Use consistent font and text
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);

        ctx.fillStyle = '#069';
        ctx.font = '11pt no-real-font-123';
        ctx.fillText('Device fingerprint text 🔒', 2, 15);

        ctx.fillStyle = 'rgba(102, 204, 0, 0.2)';
        ctx.font = '18pt Arial';
        ctx.fillText('Device ID', 4, 45);

        // Get image data and extract consistent parts
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = Array.from(imageData.data);

        // Create a hash of specific pixels to reduce browser differences
        const checksum = data.filter((_, i) => i % 100 === 0).join('');
        return checksum.substring(0, 50);
    } catch (e) {
        return 'canvas-error';
    }
}

// Get audio context fingerprint that's more consistent
function getConsistentAudioFingerprint(): string {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return 'no-audio';

        const context = new AudioContext();
        const oscillator = context.createOscillator();
        const analyser = context.createAnalyser();

        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(10000, context.currentTime);

        const gain = context.createGain();
        gain.gain.setValueAtTime(0, context.currentTime);

        oscillator.connect(analyser);
        analyser.connect(gain);
        gain.connect(context.destination);

        oscillator.start();
        setTimeout(() => {
            oscillator.stop();
            context.close();
        }, 1);

        // Get basic audio context properties that are hardware-specific
        const props = [
            context.sampleRate,
            context.baseLatency || 0,
            analyser.fftSize,
            analyser.frequencyBinCount
        ].join('-');

        return props;
    } catch (e) {
        return 'audio-error';
    }
}

// Collect comprehensive device characteristics
function collectDeviceInfo(): DeviceInfo {
    const nav = navigator as any;

    const info: DeviceInfo = {
        // Screen characteristics (hardware-specific)
        screenResolution: `${screen.width}x${screen.height}`,
        screenColorDepth: screen.colorDepth,
        pixelRatio: Math.round((window.devicePixelRatio || 1) * 100) / 100, // Round to reduce minor differences
        availableScreenSize: `${screen.availWidth}x${screen.availHeight}`,
        screenOrientation: screen.orientation ? screen.orientation.type : 'unknown',

        // Platform and OS information
        platform: navigator.platform,
        vendor: navigator.vendor || 'unknown',
        oscpu: nav.oscpu || 'unknown',
        buildID: nav.buildID || 'unknown',

        // Hardware characteristics
        hardwareConcurrency: navigator.hardwareConcurrency || 0,
        maxTouchPoints: navigator.maxTouchPoints || 0,
        deviceMemory: nav.deviceMemory || 0,

        // Network information (if available)
        networkType: nav.connection ? (nav.connection.effectiveType || nav.connection.type || 'unknown') : 'unknown',

        // Location/time characteristics
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezoneOffset: new Date().getTimezoneOffset(),

        // Consistent fingerprints
        canvasFingerprint: getConsistentCanvasFingerprint(),
        audioContext: getConsistentAudioFingerprint(),
    };

    return info;
}

// Generate machine-specific key with weighted importance
function generateMachineKey(): string {
    const deviceInfo = collectDeviceInfo();

    // Create a weighted fingerprint - more unique characteristics get higher weight
    const primaryCharacteristics = [
        `screen:${deviceInfo.screenResolution}`,
        `depth:${deviceInfo.screenColorDepth}`,
        `ratio:${deviceInfo.pixelRatio}`,
        `platform:${deviceInfo.platform}`,
        `cores:${deviceInfo.hardwareConcurrency}`,
        `memory:${deviceInfo.deviceMemory}`,
        `timezone:${deviceInfo.timezone}`,
        `offset:${deviceInfo.timezoneOffset}`,
        `available:${deviceInfo.availableScreenSize}`,
    ].join('|');

    // Secondary characteristics (more unique but may vary slightly)
    const secondaryCharacteristics = [
        `canvas:${deviceInfo.canvasFingerprint}`,
        `audio:${deviceInfo.audioContext}`,
        `touch:${deviceInfo.maxTouchPoints}`,
        `vendor:${deviceInfo.vendor}`,
        `network:${deviceInfo.networkType}`,
    ].join('|');

    // Combine with different weights
    return `primary:${primaryCharacteristics}||secondary:${secondaryCharacteristics}`;
}

// Cross-browser storage key - tries multiple storage mechanisms
const DEVICE_ID_KEY = 'unified_device_id_v2';

function getStoredDeviceId(): string | null {
    // Try localStorage first
    try {
        const stored = localStorage.getItem(DEVICE_ID_KEY);
        if (stored) return stored;
    } catch (e) {
        // localStorage might be disabled
    }

    // Try sessionStorage as fallback
    try {
        const stored = sessionStorage.getItem(DEVICE_ID_KEY);
        if (stored) {
            // If found in session storage, try to save to localStorage
            try {
                localStorage.setItem(DEVICE_ID_KEY, stored);
            } catch (e) {
                // Ignore if can't save to localStorage
            }
            return stored;
        }
    } catch (e) {
        // sessionStorage might be disabled
    }

    return null;
}

function storeDeviceId(deviceId: string): void {
    // Store in both localStorage and sessionStorage
    try {
        localStorage.setItem(DEVICE_ID_KEY, deviceId);
        localStorage.setItem(`${DEVICE_ID_KEY}_created`, new Date().toISOString());
    } catch (e) {
        // localStorage might be disabled
    }

    try {
        sessionStorage.setItem(DEVICE_ID_KEY, deviceId);
    } catch (e) {
        // sessionStorage might be disabled
    }
}

// Main function to generate device ID
export async function generateDeviceId(): Promise<string> {
    try {
        // Check if we already have a stored device ID
        const existingId = getStoredDeviceId();
        if (existingId) {
            return existingId;
        }

        // Generate new device ID based on machine characteristics
        const machineKey = generateMachineKey();
        const deviceId = await generateHash(machineKey);

        // Store the device ID
        storeDeviceId(deviceId);

        return deviceId;
    } catch (error) {
        console.warn('Failed to generate device fingerprint:', error);
        return getFallbackDeviceId();
    }
}

// Fallback method for when main fingerprinting fails
function getFallbackDeviceId(): string {
    const fallbackKey = 'fallback_device_id_v2';

    let fallbackId = getStoredDeviceId();
    if (fallbackId && fallbackId.startsWith('fallback_')) {
        return fallbackId;
    }

    // Create a simple but unique fallback ID
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    const screenInfo = `${screen.width}x${screen.height}x${screen.colorDepth}`;
    const simpleFingerprint = btoa(screenInfo + navigator.platform).replace(/[^a-zA-Z0-9]/g, '');

    fallbackId = `fallback_${timestamp}_${random}_${simpleFingerprint}`.substring(0, 64);

    storeDeviceId(fallbackId);
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

// Debug function to see what characteristics are being used
export function getDeviceCharacteristics(): Promise<any> {
    return Promise.resolve({
        deviceInfo: collectDeviceInfo(),
        machineKey: generateMachineKey(),
        storedId: getStoredDeviceId(),
    });
}

// Force regenerate device ID (useful for testing)
export async function regenerateDeviceId(): Promise<string> {
    // Clear all stored IDs
    try {
        localStorage.removeItem(DEVICE_ID_KEY);
        localStorage.removeItem(`${DEVICE_ID_KEY}_created`);
        sessionStorage.removeItem(DEVICE_ID_KEY);
    } catch (e) {
        // Ignore storage errors
    }

    // Generate new ID
    return await generateDeviceId();
}