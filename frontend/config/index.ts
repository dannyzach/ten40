const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3456';

export const config = {
    API_BASE_URL: `${API_URL}/api`,
    API_TIMEOUT: 120000,
} as const; 