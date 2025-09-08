"use client";
import { useDeviceId } from "@/hooks/useDeviceId";

export default function Page() {
    const deviceId = useDeviceId();

    return (
        <div className="p-4">
            <h2 className="font-bold">Device ID (cross-browser):</h2>
            <p className="break-all text-sm">{deviceId || "Loading..."}</p>
        </div>
    );
}
