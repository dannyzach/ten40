export enum DocumentType {
    W2 = 'w2',
    FORM_1099 = '1099',
    EXPENSE = 'expenses',
    DONATION = 'donations'
}

export type DocumentStatus = 'Pending' | 'Approved' | 'Rejected';

export interface DateRange {
    start?: string;
    end?: string;
}

interface BaseDocument {
    id: number;
    type: DocumentType;
    status: DocumentStatus;
    uploadDate: string;
    image_path?: string;
}

export interface W2Document extends BaseDocument {
    type: DocumentType.W2;
    employer: string;
    wages: number;
    fedWithholding: number;
}

export interface Form1099Document extends BaseDocument {
    type: DocumentType.FORM_1099;
    payer: string;
    amount: number;
}

export interface ExpenseDocument extends BaseDocument {
    type: DocumentType.EXPENSE;
    vendor: string;
    amount: number;
    date: string;
    payment_method: string;
    category: string;
}

export interface DonationDocument extends BaseDocument {
    type: DocumentType.DONATION;
    charityName: string;
    amount: number;
    donationType: string;
}

export type Document = W2Document | Form1099Document | ExpenseDocument | DonationDocument; 