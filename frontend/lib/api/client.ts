import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:3456/api',
    timeout: 120000
});

// Add auth interceptor
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default apiClient; 