import { CONFIG } from '@/config';

export const api = {
    async uploadReceipt(file: File) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
            signal: AbortSignal.timeout(CONFIG.TIMEOUTS.UPLOAD)
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }

        return response.json();
    },

    async getReceipts() {
        const response = await fetch('/api/receipts');
        if (!response.ok) {
            throw new Error(`Failed to fetch receipts: ${response.statusText}`);
        }
        return response.json();
    },

    async deleteReceipt(id: number) {
        const response = await fetch(`/api/receipts/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error(`Failed to delete receipt: ${response.statusText}`);
        }
        return response.json();
    },

    async fetchReceipt(id: string) {
        const response = await fetch(`/api/receipts/${id}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch receipt');
        }
        
        return response.json();
    }
}; 