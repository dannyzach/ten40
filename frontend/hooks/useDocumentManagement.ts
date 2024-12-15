import { useCallback } from 'react';
import { documentsApi } from '../lib/api/documents';
import { Receipt } from '@/types';

interface DocumentManagement {
  uploadReceipt: (file: File) => Promise<Receipt>;
  getReceipts: () => Promise<Receipt[]>;
  deleteReceipt: (id: number) => Promise<void>;
  fetchReceipt: (id: string | string[]) => Promise<Receipt>;
}

export const useDocumentManagement = (): DocumentManagement => {
  const uploadReceipt = useCallback(async (file: File) => {
    const response = await documentsApi.uploadDocument(file, 'Expenses');
    return response as Receipt;
  }, []);

  const getReceipts = useCallback(async () => {
    const documents = await documentsApi.getDocuments('Expenses');
    return documents.map(doc => doc.originalReceipt as Receipt).filter(Boolean);
  }, []);

  const deleteReceipt = useCallback(async (id: number) => {
    try {
        await documentsApi.deleteDocument(id.toString());
    } catch (error) {
        console.error('Delete error:', error);
        throw new Error('Failed to delete receipt. Please try again.');
    }
  }, []);

  const fetchReceipt = useCallback(async (id: string | string[]) => {
    const receiptId = Array.isArray(id) ? id[0] : id;
    return documentsApi.fetchReceipt(receiptId);
  }, []);

  return {
    uploadReceipt,
    getReceipts,
    deleteReceipt,
    fetchReceipt
  };
}; 