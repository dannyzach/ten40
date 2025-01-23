export type DocumentType = 'W-2' | '1099' | 'Expenses' | 'Donations';
export type DocumentStatus = 'Pending' | 'Approved' | 'Rejected';

interface BaseDocument {
    id: number;
    type: DocumentType;
    status: DocumentStatus;
    uploadDate: string;
    image_path?: string;
}

export interface W2Document extends BaseDocument {
    type: 'W-2';
    employer: string;
    wages: number;
    fedWithholding: number;
}

export interface Form1099Document extends BaseDocument {
    type: '1099';
    payer: string;
    amount: number;
}

export interface ExpenseDocument extends BaseDocument {
    type: 'Expenses';
    vendor: string;
    amount: number;
    date: string;
    payment_method: string;
    category: string;
}

export interface DonationDocument extends BaseDocument {
    type: 'Donations';
    charityName: string;
    amount: number;
    donationType: string;
}

export type Document = W2Document | Form1099Document | ExpenseDocument | DonationDocument; 