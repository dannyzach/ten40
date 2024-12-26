export type DocumentType = 'W-2' | '1099' | 'Expenses' | 'Donations';
export type DocumentStatus = 'Pending' | 'Approved' | 'Rejected' | 'all';

interface BaseDocument {
    id: string;
    type: DocumentType;
    status: Exclude<DocumentStatus, 'all'>;
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
    amount: number;
    date: string;
    payment_method: string;
    category: string;
    originalReceipt?: {
        image_path: string;
        [key: string]: any;
    };
}

export interface DonationDocument extends BaseDocument {
    type: 'Donations';
    date: string;
    charityName: string;
    donationType: string;
    amount: number;
}

export type Document = W2Document | Form1099Document | ExpenseDocument | DonationDocument; 