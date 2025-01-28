import { useCallback } from 'react';
import { documentsApi } from '../lib/api/documents';
import { DocumentType, Receipt } from '@/types';

interface DocumentManagement {
  uploadReceipt: (file: File) => Promise<Receipt>;
  getReceipts: () => Promise<Receipt[]>;
  deleteReceipt: (id: number) => Promise<void>;
  fetchReceipt: (id: string | string[]) => Promise<Receipt>;
}

export const useDocumentManagement = (): DocumentManagement => {
  const uploadReceipt = useCallback(async (file: File) => {
    const response = await documentsApi.uploadDocument(file, 'Expenses' as DocumentType);
    return response.data as Receipt;
  }, []);

  const getReceipts = useCallback(async () => {
    const response = await documentsApi.getDocuments();
    return response.data as Receipt[];
  }, []);

  const deleteReceipt = useCallback(async (id: number) => {
    try {
      await documentsApi.deleteDocument(id);
    } catch (error) {
      console.error('Delete error:', error);
      throw new Error('Failed to delete receipt. Please try again.');
    }
  }, []);

  const fetchReceipt = useCallback(async (id: string | string[]) => {
    const receiptId = Array.isArray(id) ? id[0] : id;
    const response = await documentsApi.getDocuments();
    const receipt = response.data.find((doc: Receipt) => doc.id === Number(receiptId));
    if (!receipt) {
      throw new Error('Receipt not found');
    }
    return receipt as Receipt;
  }, []);

  return {
    uploadReceipt,
    getReceipts,
    deleteReceipt,
    fetchReceipt
  };
}; 