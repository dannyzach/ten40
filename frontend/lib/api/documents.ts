import { Document, DocumentType, Receipt } from '@/types';
import { API_BASE_URL } from '@/config';

// Mock data for testing (excluding Expenses)
const mockDocuments: Document[] = [
    {
        id: '1',
        type: 'W-2',
        employer: 'Tech Corp',
        wages: 85000,
        fedWithholding: 15000,
        status: 'pending',
        uploadDate: '2024-01-15'
    },
    {
        id: '2',
        type: '1099',
        employer: 'Freelance Inc',
        nonEmpCompensation: 25000,
        status: 'approved',
        uploadDate: '2024-02-01'
    },
    {
        id: '4',
        type: 'Donations',
        date: '2024-01-30',
        charityName: 'Local Food Bank',
        donationType: 'Cash',
        amount: 1000,
        status: 'approved',
        uploadDate: '2024-02-01'
    }
];

export const documentsApi = {
    async getDocuments(type: DocumentType) {
        // For Expenses, use the existing receipts API
        if (type === 'Expenses') {
            const response = await fetch('/api/receipts');
            if (!response.ok) {
                throw new Error('Failed to fetch expenses');
            }
            const receipts = await response.json();
            
            // Transform receipt data to match Document interface
            return receipts.map((receipt: any) => ({
                id: receipt.id.toString(),
                type: 'Expenses' as const,
                vendor: receipt.vendor,
                amount: receipt.amount,
                date: receipt.date,
                payment_method: receipt.payment_method || 'Unknown',
                expenseType: receipt.category || 'Uncategorized',
                status: receipt.status || 'pending',
                uploadDate: receipt.date,
                image_path: receipt.image_path,
                content: receipt.content,
                originalReceipt: receipt
            }));
        }

        // For other document types, use mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockDocuments.filter(doc => doc.type === type);
    },

    async uploadDocument(file: File, type: DocumentType) {
        // For Expenses, use the existing upload API
        if (type === 'Expenses') {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload expense');
            }

            return await response.json();
        }

        // For other document types, use mock upload
        await new Promise(resolve => setTimeout(resolve, 1500));
        return { success: true };
    },

    async approveDocument(id: string, type: DocumentType) {
        // Mock approval for all document types for now
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log(`Mocked approval for ${type} document ${id}`);
        return { success: true };
    },

    async deleteDocument(id: string) {
        try {
            // Use the correct API endpoint without the base URL since it's handled by Next.js
            const response = await fetch(`/api/receipts/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to delete document: ${response.statusText}`);
            }

            return;
        } catch (error) {
            console.error('Error deleting document:', error);
            throw new Error('Failed to delete the selected items. Please try again.');
        }
    },

    async deleteDocuments(ids: string[]) {
        try {
            await Promise.all(
                ids.map(id => this.deleteDocument(id))
            );
        } catch (error) {
            console.error('Error deleting documents:', error);
            throw error;
        }
    }
};

export async function fetchReceipt(id: string): Promise<Receipt> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/receipts/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch receipt');
  }
  
  return response.json();
} 