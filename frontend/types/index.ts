// Document Types
export type DocumentType = 'W-2' | '1099' | 'Expenses' | 'Donations';
export type DocumentStatus = 'pending' | 'approved' | 'rejected';

// Receipt Types
export interface ReceiptItem {
    name: string;
    price: number;
    quantity: number;
}

export interface Receipt {
    id: number;
    date: string;
    totalAmount: number;
    vendor: string;
    category: string;
    imageUrl?: string;
    image_path?: string;
    items?: Array<{
        description: string;
        amount: number;
    }>;
    content?: any;
    payment_method?: string;
    amount?: string | number;
    replace?: never;
}

// Document Interfaces
export interface BaseDocument {
    id: string;
    type: DocumentType;
    status: DocumentStatus;
    uploadDate: string;
}

export interface W2Document extends BaseDocument {
    type: 'W-2';
    employer: string;
    wages: number;
    fedWithholding: number;
}

export interface Form1099Document extends BaseDocument {
    type: '1099';
    employer: string;
    nonEmpCompensation: number;
}

export interface ExpenseDocument extends BaseDocument {
    type: 'Expenses';
    vendor: string;
    amount: string | number;
    date: string;
    payment_method: string;
    expenseType: string;
    image_path?: string;
    content?: any;
    originalReceipt?: Receipt;
}

export interface DonationDocument extends BaseDocument {
    type: 'Donations';
    charityName: string;
    amount: number;
    date: string;
    donationType: string;
}

export type Document = W2Document | Form1099Document | ExpenseDocument | DonationDocument;

// Search Types
export interface SearchResult {
    id: string;
    type: string;
    name: string;
    group: string;
} 