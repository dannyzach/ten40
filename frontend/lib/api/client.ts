import axios, { AxiosError, AxiosResponse } from 'axios';

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

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth headers or other transformations here
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
  (error: AxiosError) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new ApiError(
        error.response.data?.message || 'An error occurred',
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      // The request was made but no response was received
      throw new ApiError('No response from server', 503);
    } else {
      // Something happened in setting up the request
      throw new ApiError(error.message || 'Request configuration error', 500);
    }
  }
);

export default apiClient; 