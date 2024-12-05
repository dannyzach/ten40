import axios from 'axios';

const API_BASE_URL = 'http://localhost:3456/api';

const api = {
    async uploadReceipt(file, onProgress) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress && onProgress(percentCompleted);
            },
        });
        return response.data;
    },

    async getReceipts() {
        const response = await axios.get(`${API_BASE_URL}/receipts`);
        return response.data;
    },

    async getReceipt(id) {
        const response = await axios.get(`${API_BASE_URL}/receipts/${id}`);
        return response.data;
    },

    async updateReceipt(id, data) {
        const response = await axios.put(`${API_BASE_URL}/receipts/${id}`, data);
        return response.data;
    },

    async deleteReceipt(id) {
        const response = await axios.delete(`${API_BASE_URL}/receipts/${id}`);
        return response.data;
    }
};

export default api; 