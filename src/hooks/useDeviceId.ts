"use client";

import { useEffect, useState } from "react";
import { getDeviceFingerprint } from "@/utils/getDeviceFingerprint";

export function useDeviceId() {
    const [deviceId, setDeviceId] = useState<string | null>(null);

    useEffect(() => {
        async function fetchDeviceId() {
            const fingerprint = await getDeviceFingerprint();
            const res = await fetch("/api/device/identify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fingerprint }),
            });
            const data = await res.json();
            setDeviceId(data.deviceId);
        }
        fetchDeviceId();
    }, []);

    return deviceId;
}
