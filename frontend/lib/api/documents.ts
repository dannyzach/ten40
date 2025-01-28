import apiClient from './client';
import { DocumentType, Receipt } from '@/types';
import axios from 'axios';

export const documentsApi = {
    getDocuments: () => {
        console.log('API: Fetching documents...');
        return apiClient.get('/receipts')
            .then(response => {
                console.log('API: Received response:', response.data);
                return response;
            });
    },
    getReceipt: (id: string) => {
        return apiClient.get(`/receipts/${id}`);
    },
    uploadDocument: (file: File, type: DocumentType) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        const token = localStorage.getItem('auth_token');
        
        return apiClient.post('/upload', formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                // Don't set Content-Type, let the browser set it with the boundary
            }
        });
    },
    deleteDocument: (id: number): Promise<void> => {
        return apiClient.delete(`/receipts/${id}`);
    },
    deleteDocuments: (ids: number[]): Promise<void> => {
        return apiClient.post('/receipts/bulk-delete', { ids });
    },
    updateDocument: (id: number, updates: Record<string, any>): Promise<void> => {
        return apiClient.patch(`/receipts/${id}/update`, updates);
    },
}; 