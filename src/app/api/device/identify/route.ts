// src/app/api/device/identify/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

type DeviceRecord = {
    deviceId: string;
    fingerprints: string[];
    ip: string;
    lastSeen: Date;
};

const db: DeviceRecord[] = []; // Replace with real DB (Prisma, Mongo, etc.)

export async function POST(req: NextRequest) {
    const { fingerprint } = await req.json();
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    // Try to find matching device
    let device = db.find((d) =>
        d.fingerprints.includes(fingerprint) || d.ip === ip
    );

    if (!device) {
        device = {
            deviceId: crypto.randomUUID(),
            fingerprints: [fingerprint],
            ip,
            lastSeen: new Date(),
        };
        db.push(device);
    } else {
        if (!device.fingerprints.includes(fingerprint)) {
            device.fingerprints.push(fingerprint);
        }
        device.lastSeen = new Date();
    }

    return NextResponse.json({ deviceId: device.deviceId });
}
