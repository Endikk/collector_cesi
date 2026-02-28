// Determine backend URL based on environment
// - Server-side (in Docker): use internal Docker network URL
// - Client-side: use public URL (localhost or env variable)
const getBackendUrl = () => {
    // If running on server (SSR) and BACKEND_URL is set, use it (for Docker internal communication)
    if (typeof window === 'undefined' && process.env.BACKEND_URL) {
        return process.env.BACKEND_URL;
    }
    // Otherwise use public URL for client-side or development
    return process.env.NEXT_PUBLIC_BACKEND_URL || 'https://localhost:4000';
};

const BACKEND_URL = getBackendUrl();

export async function fetchBackend<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Include internal API key for server-to-server calls (Next.js server actions → backend)
    const internalHeaders: Record<string, string> = {};
    if (typeof window === 'undefined' && process.env.INTERNAL_API_KEY) {
        internalHeaders['x-internal-api-key'] = process.env.INTERNAL_API_KEY;
    }

    const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...internalHeaders,
            ...options.headers,
        },
    });

    if (!res.ok) {
        const errorText = await res.text().catch(() => res.statusText);
        throw new Error(`API Error (${res.status}): ${errorText}`);
    }

    return res.json();
}
