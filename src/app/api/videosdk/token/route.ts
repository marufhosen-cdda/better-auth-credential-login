// app/api/videosdk/token/route.ts
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

interface JWTPayload {
    apikey: string;
    permissions: string[];
}

interface TokenResponse {
    token: string;
}

interface ErrorResponse {
    error: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<TokenResponse | ErrorResponse>> {
    try {
        const API_KEY: string | undefined = process.env.NEXT_PUBLIC_VIDEOSDK_API_KEY;
        const SECRET_KEY: string | undefined = process.env.VIDEOSDK_API_SECRET;

        if (!API_KEY || !SECRET_KEY) {
            return NextResponse.json(
                { error: 'VideoSDK credentials not configured' } as ErrorResponse,
                { status: 500 }
            );
        }

        const options: jwt.SignOptions = {
            expiresIn: '120m',
            algorithm: 'HS256'
        };

        const payload: JWTPayload = {
            apikey: API_KEY,
            permissions: ['allow_join', 'allow_mod'], // permission to join meeting
        };

        const token: string = jwt.sign(payload, SECRET_KEY, options);

        return NextResponse.json({ token } as TokenResponse);
    } catch (error) {
        console.error('Error generating token:', error);
        return NextResponse.json(
            { error: 'Failed to generate token' } as ErrorResponse,
            { status: 500 }
        );
    }
}

// Alternative: GET method for convenience
export async function GET(request: NextRequest): Promise<NextResponse<TokenResponse | ErrorResponse>> {
    return POST(request);
}