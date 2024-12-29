import { Document, DocumentType, Receipt } from '@/types';
import { API_BASE_URL } from '@/config';
import { format, parse, isValid } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { api } from '../../services/api';

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

const transformDate = (dateStr: string): string => {
    if (!dateStr || dateStr === 'N/A' || dateStr.toLowerCase() === 'n/a') {
        console.log('documentsApi.transformDate: Empty or N/A date:', dateStr);
        return '';
    }
    
    console.log('documentsApi.transformDate: Processing date:', dateStr);
    
    try {
        // Clean up the date string first
        const cleanDate = dateStr.replace(/['"]/g, '').trim();
        if (!cleanDate) {
            console.log('documentsApi.transformDate: Empty date after cleanup');
            return '';
        }

        // Array of possible date formats to try
        const formats = [
            'MM/dd/yy',
            'MM/dd/yyyy',
            'dd MMM \'yy HH:mm a',
            'dd MMM yyyy HH:mm a',
            'yyyy-MM-dd',
            'MM-dd-yyyy',
            'dd-MM-yyyy',
            'dd MMM yyyy',
            'MMM dd yyyy',
            'dd/MM/yyyy',
            'dd/MM/yy'
        ];

        // Try each format
        for (const fmt of formats) {
            try {
                const date = parse(cleanDate, fmt, new Date(), { locale: enUS });
                if (isValid(date)) {
                    const result = format(date, 'yyyy-MM-dd', { locale: enUS });
                    console.log('documentsApi.transformDate: Successfully parsed date:', {
                        input: dateStr,
                        cleaned: cleanDate,
                        format: fmt,
                        result
                    });
                    return result;
                }
            } catch (e) {
                // Continue to next format if this one fails
                continue;
            }
        }
        
        console.warn('documentsApi.transformDate: Could not parse date with any format:', {
            original: dateStr,
            cleaned: cleanDate
        });
        return '';
    } catch (e) {
        console.error('documentsApi.transformDate: Error transforming date:', {
            error: e,
            input: dateStr
        });
        return '';
    }
};

export const documentsApi = {
    async getDocuments(type: DocumentType) {
        // For Expenses, use the existing receipts API
        if (type === 'Expenses') {
            const response = await fetch('/api/receipts');
            if (!response.ok) {
                throw new Error('Failed to fetch expenses');
            }
            const receipts = await response.json();
            console.log('documentsApi.getDocuments: Raw receipts from API:', receipts);
            
            // Transform receipt data to match Document interface
            return receipts.map((receipt: any) => {
                console.log('documentsApi.getDocuments: Processing receipt:', receipt);
                const transformed = {
                    id: receipt.id.toString(),
                    type: 'Expenses' as const,
                    vendor: receipt.vendor,
                    amount: receipt.amount,
                    date: transformDate(receipt.date),
                    payment_method: receipt.payment_method || 'Unknown',
                    expenseType: receipt.expenseType || 'Uncategorized',  // Changed from category
                    status: receipt.status || 'pending',
                    uploadDate: transformDate(receipt.date),
                    image_path: receipt.image_path,
                    content: receipt.content,
                    originalReceipt: receipt
                };
                console.log('documentsApi.getDocuments: Transformed receipt:', transformed);
                return transformed;
            });
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

export const updateDocument = async (
  receiptId: number,
  updates: Partial<Document>
): Promise<Document> => {
  const response = await fetch(`/api/receipts/${receiptId}/update`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Update failed:", error);
    throw new Error(error.message || `Failed to update document: ${error.details ? JSON.stringify(error.details) : 'Unknown error'}`);
  }

  const data = await response.json();
  return data.receipt;
}; 