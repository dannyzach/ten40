import React from 'react';
import { ExpenseDocument, DocumentType } from '@/types';
import { BaseDocumentTable, Column } from './BaseDocumentTable';

const EXPENSE_CATEGORIES = [
    'Advertising',
    'Car and Truck Expenses',
    'Commissions and Fees',
    'Contract Labor',
    'Insurance',
    'Legal and Professional Services',
    'Office Expenses',
    'Rent',
    'Repairs and Maintenance',
    'Supplies',
    'Travel',
    'Utilities',
    'Other'
];

const COLUMNS: Column<ExpenseDocument>[] = [
    { 
        id: 'vendor',
        label: 'Vendor',
        minWidth: 170,
        editable: true,
        editType: 'text'
    },
    { 
        id: 'amount',
        label: 'Amount',
        minWidth: 100,
        align: 'left',
        editable: true,
        editType: 'amount',
        format: (value: string | number | null) => {
            if (value == null) return '';
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            return numValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        }
    },
    { 
        id: 'date',
        label: 'Date',
        minWidth: 100,
        editable: true,
        editType: 'date',
        format: (value: string | number | null) => {
            if (value == null) return '';
            return new Date(String(value)).toLocaleDateString();
        }
    },
    { 
        id: 'payment_method' as keyof ExpenseDocument,
        label: 'Payment Method',
        minWidth: 130,
        editable: true,
        editType: 'select',
        options: ['Credit Card', 'Debit Card', 'Cash', 'Check', 'Wire Transfer', 'Other']
    },
    { 
        id: 'category',
        label: 'Expense Type',
        minWidth: 150,
        editable: true,
        editType: 'select',
        options: EXPENSE_CATEGORIES
    },
    { 
        id: 'status', 
        label: 'Status', 
        minWidth: 100, 
        align: 'center',
        editable: true,
        editType: 'select',
        options: ['Pending', 'Approved', 'Rejected']
    }
];

export const ExpenseDocumentTable: React.FC<{ filters: any; onFilterChange: (f: any) => void }> = ({ 
    filters, 
    onFilterChange 
}) => (
    <BaseDocumentTable<ExpenseDocument>
        type={DocumentType.EXPENSE}
        columns={COLUMNS}
        filters={filters}
        onFilterChange={onFilterChange}
    />
); 