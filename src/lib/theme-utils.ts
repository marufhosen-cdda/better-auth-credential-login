// Convert hex to OKLCH for CSS custom properties
function hexToOklch(hex: string): string {
    // Remove # if present
    hex = hex.replace('#', '');

    // Convert hex to RGB
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    // Simple RGB to OKLCH approximation
    // For production, you might want to use a proper color conversion library
    const lightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const chroma = Math.sqrt(Math.pow(r - lightness, 2) + Math.pow(g - lightness, 2) + Math.pow(b - lightness, 2));
    const hue = Math.atan2(b - lightness, r - lightness) * 180 / Math.PI;

    return `oklch(${lightness.toFixed(3)} ${chroma.toFixed(3)} ${hue.toFixed(1)})`;
}

// Get contrasting color (white or black) for foreground
function getContrastColor(hex: string): string {
    // Remove # if present
    hex = hex.replace('#', '');

    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return white for dark colors, black for light colors
    return luminance > 0.5 ? 'oklch(0.145 0 0)' : 'oklch(0.985 0 0)';
}

export { hexToOklch, getContrastColor };