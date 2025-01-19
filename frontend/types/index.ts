// Document Types
export enum DocumentType {
    EXPENSE = 'Expenses',    // Current primary type for receipts
    W2 = 'W-2',             // Future types
    FORM_1099 = '1099',
    DONATION = 'Donations'
}

export type DocumentStatus = 'pending' | 'processed' | 'error';

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
    id: number;
    type: DocumentType;
    status: DocumentStatus;
    uploadDate: string;
}

export interface W2Document extends BaseDocument {
    type: DocumentType.W2;
    employer: string;
    wages: number;
    fedWithholding: number;
}

export interface Form1099Document extends BaseDocument {
    type: DocumentType.FORM_1099;
    employer: string;
    nonEmpCompensation: number;
}

export interface ExpenseDocument extends BaseDocument {
    type: DocumentType.EXPENSE;
    vendor: string;
    amount: number;
    date: string;
    payment_method: string;
    expenseType: string;
}

export interface DonationDocument extends BaseDocument {
    type: DocumentType.DONATION;
    charityName: string;
    amount: number;
    donationType: string;
    date: string;
}

export type Document = W2Document | Form1099Document | ExpenseDocument | DonationDocument;

// Search Types
export interface SearchResult {
    id: string;
    type: string;
    name: string;
    group: string;
} 