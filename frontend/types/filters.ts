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
  type: 'W-2';
  employer?: string[];
  wageRange?: {
    min: number;
    max: number;
  };
}

export interface Form1099Filter extends BaseFilter {
  type: '1099';
  employer?: string[];
  amountRange?: {
    min: number;
    max: number;
  };
}

export interface ExpenseFilter extends BaseFilter {
  type: 'Expenses';
  vendor?: string[];
  amountRange?: {
    min: number;
    max: number;
  };
  paymentMethod?: string[];
  expenseType?: string[];
}

export interface DonationFilter extends BaseFilter {
  type: 'Donations';
  charityName?: string[];
  amountRange?: {
    min: number;
    max: number;
  };
  donationType?: string[];
}

export type DocumentFilter = W2Filter | Form1099Filter | ExpenseFilter | DonationFilter; 