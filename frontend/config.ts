export const CONFIG = {
    TIMEOUTS: {
        UPLOAD: 120000,  // 2 minutes in milliseconds
        SERVER: 120000,
        PROXY: 120000
    },
    AUTH: {
        TOKEN_KEY: 'auth_token'
    }
} as const; 