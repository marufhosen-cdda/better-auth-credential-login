// utils/getDeviceFingerprint.ts
export async function getDeviceFingerprint(): Promise<string> {
    const components: string[] = [];

    // User agent
    components.push(navigator.userAgent);

    // Screen info
    components.push(
        `${screen.width}x${screen.height}x${screen.colorDepth}`
    );

    // Timezone
    components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);

    // Language
    components.push(navigator.language);

    // Plugins
    const plugins = Array.from(navigator.plugins)
        .map((p) => p.name + "::" + p.filename)
        .join(",");
    components.push(plugins);

    // WebGL renderer & vendor
    try {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl");
        if (gl) {
            const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
            if (debugInfo) {
                components.push(
                    gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
                );
                components.push(
                    gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
                );
            }
        }
    } catch {
        components.push("webgl-not-available");
    }

    // Canvas fingerprint
    try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.textBaseline = "top";
            ctx.font = "16px Arial";
            ctx.textBaseline = "alphabetic";
            ctx.fillStyle = "#f60";
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = "#069";
            ctx.fillText("fingerprint", 2, 15);
            ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
            ctx.fillText("fingerprint", 4, 17);
            components.push(canvas.toDataURL());
        }
    } catch {
        components.push("canvas-not-available");
    }

    // Simple hash (SHA-256)
    const msg = components.join("###");
    const hashBuffer = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(msg)
    );
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    return hashHex;
}
