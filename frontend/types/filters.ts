// Base filter interface
export interface BaseFilter {
    dateRange?: {
        start?: string;
        end?: string;
    };
    status?: string[];
}

// W2 specific filters
export interface W2Filter extends BaseFilter {
    employer?: string[];
    wageRange?: {
        min?: number;
        max?: number;
    };
    withHoldingRange?: {
        min?: number;
        max?: number;
    };
}

// 1099 specific filters
export interface Form1099Filter extends BaseFilter {
    employer?: string[];
    amountRange?: {
        min?: number;
        max?: number;
    };
}

// Expense specific filters
export interface ExpenseFilter extends BaseFilter {
    vendor?: string[];
    amountRange?: {
        min?: number;
        max?: number;
    };
    paymentMethods?: string[];
    categories?: string[];
}

// Donation specific filters
export interface DonationFilter extends BaseFilter {
    charityName?: string[];
    amountRange?: {
        min?: number;
        max?: number;
    };
    donationType?: string[];
}

export type DocumentFilter = 
    | W2Filter 
    | Form1099Filter 
    | ExpenseFilter 
    | DonationFilter; 