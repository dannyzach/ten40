import { useCallback } from 'react';
import { documentsApi } from '../lib/api/documents';
import { Document, DocumentType, ExpenseDocument } from '@/types';

interface DocumentManagement {
  uploadReceipt: (file: File) => Promise<ExpenseDocument>;
  getReceipts: () => Promise<ExpenseDocument[]>;
  deleteReceipt: (id: string) => Promise<void>;
  fetchReceipt: (id: string | string[]) => Promise<ExpenseDocument>;
}

export const useDocumentManagement = (): DocumentManagement => {
  const uploadReceipt = useCallback(async (file: File) => {
    const response = await documentsApi.uploadDocument(file, 'Expenses' as DocumentType);
    return response.data as ExpenseDocument;
  }, []);

  const getReceipts = useCallback(async () => {
    const response = await documentsApi.getDocuments();
    return response.data.filter(
      (doc): doc is ExpenseDocument => doc.type === 'Expenses'
    );
  }, []);

  const deleteReceipt = useCallback(async (id: string) => {
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
    const receipt = response.data.find(doc => doc.id === receiptId);
    if (!receipt || receipt.type !== 'Expenses') {
      throw new Error('Receipt not found');
    }
    return receipt as ExpenseDocument;
  }, []);

  return {
    uploadReceipt,
    getReceipts,
    deleteReceipt,
    fetchReceipt
  };
}; 