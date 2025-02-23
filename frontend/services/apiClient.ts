import axios, { AxiosError, AxiosResponse } from 'axios';

// Add type for API error response
interface ApiErrorResponse {
    message: string;
    [key: string]: any;  // Allow other fields while ensuring message exists
}

// Custom error class for API errors
export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public data?: any
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export const apiClient = axios.create({
    baseURL: '/api',
    timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError<ApiErrorResponse>) => {
        if (error.response) {
            throw new ApiError(
                error.response.data?.message || 'An error occurred',
                error.response.status,
                error.response.data
            );
        } else if (error.request) {
            throw new ApiError('No response from server', 503);
        } else {
            throw new ApiError(error.message || 'Request configuration error', 500);
        }
    }
);

export default apiClient; 