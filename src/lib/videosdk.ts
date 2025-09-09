// lib/videosdk.ts
export const VIDEOSDK_API_KEY: string = "8f33ee2c-7db0-41f3-9a3e-eb19ac604881";
export const VIDEOSDK_API_SECRET: string = "e8da7884f56a1ba3d289a7b82df319a59807413ccb507ba4defa80fe708ca050";

// Types for API responses
interface CreateMeetingResponse {
    roomId: string;
}

interface ValidateMeetingResponse {
    roomId: string;
}

interface TokenResponse {
    token: string;
}

interface CreateMeetingParams {
    token: string;
}

interface ValidateMeetingParams {
    meetingId: string;
    token: string;
}

// Generate auth token from your API route
async function generateAuthToken(): Promise<string | null> {
    try {
        const response = await fetch('/api/videosdk/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to generate token: ${response.status} ${response.statusText}`);
        }

        const data: TokenResponse = await response.json();
        return data.token;
    } catch (error) {
        console.error('Error generating auth token:', error);
        // Fallback: use environment variable if API route fails
        return process.env.NEXT_PUBLIC_VIDEOSDK_TOKEN || null;
    }
}

// Get auth token (cached for performance)
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

export const getAuthToken = async (): Promise<string | null> => {
    // Check if we have a valid cached token (expires in 2 hours, refresh after 1.5 hours)
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
        return cachedToken;
    }

    try {
        cachedToken = await generateAuthToken();
        tokenExpiry = Date.now() + (90 * 60 * 1000); // 1.5 hours
        return cachedToken;
    } catch (error) {
        console.error('Failed to get auth token:', error);
        return null;
    }
};

// API call to create a meeting
export const createMeeting = async ({ token }: CreateMeetingParams): Promise<string> => {
    try {
        const authToken: string | null = token || await getAuthToken();

        if (!authToken) {
            throw new Error('No auth token available');
        }

        const res = await fetch(`https://api.videosdk.live/v2/rooms`, {
            method: "POST",
            headers: {
                authorization: `${authToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
        }

        const data: CreateMeetingResponse = await res.json();
        return data.roomId;
    } catch (error) {
        console.error("Error creating meeting:", error);
        throw error;
    }
};

// API call to validate meeting
export const validateMeeting = async ({ meetingId, token }: ValidateMeetingParams): Promise<boolean> => {
    try {
        const authToken: string | null = token || await getAuthToken();

        if (!authToken) {
            throw new Error('No auth token available');
        }

        const res = await fetch(`https://api.videosdk.live/v2/rooms/validate/${meetingId}`, {
            method: "GET",
            headers: {
                authorization: `${authToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) {
            return false;
        }

        const data: ValidateMeetingResponse = await res.json();
        return data.roomId === meetingId;
    } catch (error) {
        console.error("Error validating meeting:", error);
        return false;
    }
};