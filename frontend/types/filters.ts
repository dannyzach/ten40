import { DocumentType } from './index';

export interface BaseFilter {
  type: DocumentType;
  status?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface W2Filter extends BaseFilter {
  type: DocumentType.W2;
  employer?: string[];
  wageRange?: {
    min: number;
    max: number;
  };
}

export interface Form1099Filter extends BaseFilter {
  type: DocumentType.FORM_1099;
  employer?: string[];
  amountRange?: {
    min: number;
    max: number;
  };
}

export interface ExpenseFilter extends BaseFilter {
  type: DocumentType.EXPENSE;
  vendor?: string[];
  amountRange?: {
    min: number;
    max: number;
  };
  paymentMethod?: string[];
  category?: string[];
}

export interface DonationFilter extends BaseFilter {
  type: DocumentType.DONATION;
  charityName?: string[];
  amountRange?: {
    min: number;
    max: number;
  };
  donationType?: string[];
}

export type DocumentFilter = W2Filter | Form1099Filter | ExpenseFilter | DonationFilter;

export interface DocumentFilters {
  vendor?: string;
  expenseType?: string;
  paymentMethod?: string;
  status?: string;
  dateRange?: {
    start: string;
    end: string;
  };
} 