import { Document, DocumentType, Receipt } from '@/types';
import { API_BASE_URL } from '@/config';
import { format, parse, isValid } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { api } from '../../services/api';
import { apiClient } from '../../services/apiClient';

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

// Add this interface at the top with other types
interface FilterOptions {
    categories: string[];
    payment_methods: string[];
    statuses: string[];
    vendors: string[];
}

export const documentsApi = {
    async getDocuments(type: DocumentType) {
        if (type === 'Expenses') {
            try {
                const { data: receipts } = await apiClient.get<any[]>('/receipts');
                
                return receipts.map((receipt: any) => ({
                    id: receipt.id.toString(),
                    type: 'Expenses' as const,
                    vendor: receipt.vendor,
                    amount: receipt.amount,
                    date: transformDate(receipt.date),
                    payment_method: receipt.payment_method || 'Unknown',
                    expenseType: receipt.expenseType || 'Uncategorized',
                    status: receipt.status || 'pending',
                    uploadDate: transformDate(receipt.date),
                    image_path: receipt.image_path,
                    content: receipt.content,
                    originalReceipt: receipt
                }));
            } catch (error) {
                console.error('Error fetching expenses:', error);
                throw error instanceof ApiError 
                    ? error 
                    : new ApiError('Failed to fetch expenses', 500);
            }
        }
        return mockDocuments.filter(doc => doc.type === type);
    },

    async uploadDocument(file: File, type: DocumentType) {
        if (type === 'Expenses') {
            try {
                const formData = new FormData();
                formData.append('file', file);

                const { data } = await apiClient.post('/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                return data;
            } catch (error) {
                console.error('Error uploading document:', error);
                throw error instanceof ApiError 
                    ? error 
                    : new ApiError('Failed to upload expense', 500);
            }
        }

        // For other document types, use mock upload
        await new Promise(resolve => setTimeout(resolve, 1500));
        return { success: true };
    },

    async deleteDocument(id: string) {
        try {
            await apiClient.delete(`/receipts/${id}`);
            return;
        } catch (error) {
            console.error('Error deleting document:', error);
            throw error instanceof ApiError 
                ? error 
                : new ApiError('Failed to delete document', 500);
        }
    },

    async deleteDocuments(ids: string[]) {
        try {
            await Promise.all(
                ids.map(id => this.deleteDocument(id))
            );
        } catch (error) {
            console.error('Error deleting documents:', error);
            throw error instanceof ApiError 
                ? error 
                : new ApiError('Failed to delete multiple documents', 500);
        }
    },

    // Add new method for fetching filter options
    async getFilterOptions(): Promise<FilterOptions> {
        try {
            const { data } = await apiClient.get<FilterOptions>('/options');
            return data;
        } catch (error) {
            console.error('Error fetching filter options:', error);
            throw error instanceof ApiError 
                ? error 
                : new ApiError('Failed to fetch filter options', 500);
        }
    },

    // Move receipt-specific methods into documentsApi object
    async getReceipts() {
        try {
            const { data } = await apiClient.get<any[]>('/receipts');
            return data;
        } catch (error) {
            console.error('Error fetching receipts:', error);
            throw error instanceof ApiError 
                ? error 
                : new ApiError('Failed to fetch receipts', 500);
        }
    },
};

export async function fetchReceipt(id: string): Promise<Receipt> {
    try {
        const { data } = await apiClient.get<Receipt>(`/receipts/${id}`);
        return data;
    } catch (error) {
        console.error('Error fetching receipt:', error);
        throw error instanceof ApiError 
            ? error 
            : new ApiError('Failed to fetch receipt', 500);
    }
}

export const updateDocument = async (
    receiptId: number,
    updates: Partial<Document>
): Promise<Document> => {
    try {
        const { data } = await apiClient.patch<{receipt: Document}>(
            `/receipts/${receiptId}/update`,
            updates
        );
        return data.receipt;
    } catch (error) {
        console.error('Update failed:', error);
        throw error instanceof ApiError 
            ? error 
            : new ApiError(
                'Failed to update document', 
                500, 
                { details: error.message }
            );
    }
}; 

async function testAxiosGetReceipts() {
    try {
        const { data } = await apiClient.get<any[]>('/receipts');
        console.log('Axios test successful - Raw Data:', JSON.stringify(data, null, 2));
        return data;
    } catch (error) {
        console.error('Axios test failed:', error);
        throw error;
    }
}

// Export for testing
export const __test = {
    testAxiosGetReceipts
}; 