import apiClient from './client';

export const documentsApi = {
    getDocuments: () => {
        console.log('API: Fetching documents...');
        return apiClient.get('/receipts')
            .then(response => {
                console.log('API: Received response:', response.data);
                return response;
            });
    },
    uploadDocument: (file: File, type: DocumentType) => {
        const formData = new FormData();
        formData.append('file', file);
        const token = localStorage.getItem('auth_token');
        
        return apiClient.post('/upload', formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                // Don't set Content-Type, let the browser set it with the boundary
            }
        });
    },
    deleteDocument: async (id: string): Promise<void> => {
        console.log(`[Documents API] Attempting to delete document with ID: ${id}`);
        try {
            const response = await apiClient.delete(`/receipts/${id}`);
            console.log(`[Documents API] Delete response status: ${response.status}`);
            if (response.status !== 200) {
                console.error('[Documents API] Failed to delete document:', response.data);
                throw new Error('Failed to delete document');
            }
            console.log(`[Documents API] Successfully deleted document ${id}`);
        } catch (error) {
            console.error('[Documents API] Error deleting document:', error);
            throw error;
        }
    },
    deleteDocuments: async (ids: string[]): Promise<void> => {
        console.log(`[Documents API] Starting bulk delete operation for ${ids.length} documents:`, ids);
        try {
            await Promise.all(ids.map(id => documentsApi.deleteDocument(id)));
            console.log(`[Documents API] Successfully completed bulk delete of ${ids.length} documents`);
        } catch (error) {
            console.error('[Documents API] Bulk delete operation failed:', error);
            throw new Error('Failed to delete one or more documents');
        }
    },
    updateDocument: async (id: string, updates: Record<string, any>): Promise<void> => {
        console.log(`[Documents API] Attempting to update document ${id}:`, updates);
        try {
            const response = await apiClient.patch(`/receipts/${id}/update`, updates);
            console.log(`[Documents API] Update response:`, response);
            if (response.status !== 200) {
                console.error('[Documents API] Update failed:', response.data);
                throw new Error('Failed to update document');
            }
            return response.data;
        } catch (error) {
            console.error('[Documents API] Error updating document:', error);
            throw error;
        }
    },
}; 