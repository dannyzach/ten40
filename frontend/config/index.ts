export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3456';

export const CONFIG = {
    API: {
        BASE_URL: API_BASE_URL,
        TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '120000', 10)
    }
} as const; 