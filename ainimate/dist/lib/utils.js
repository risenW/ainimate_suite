import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
export function generateId() {
    // Generate random bytes
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    // Set version (4) and variant bits
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    // Convert to hex string
    let id = '';
    for (let i = 0; i < 16; i++) {
        id += bytes[i].toString(16).padStart(2, '0');
    }
    // Add dashes to match UUID format
    return id.slice(0, 8) + '-' +
        id.slice(8, 12) + '-' +
        id.slice(12, 16) + '-' +
        id.slice(16, 20) + '-' +
        id.slice(20);
}
