import React from 'react';
import { ExpenseDocument, DocumentType } from '@/types';
import { BaseDocumentTable, Column } from './BaseDocumentTable';

// this is the list of expense categories from the backend. It shukd be read fromm backend but I left it here asi-is for now
const EXPENSE_CATEGORIES = [ 
    'Advertising',
    'Car and Truck Expenses',
    'Commissions and Fees',
    'Contract Labor',
    'Depletion',
    'Depreciation and Section 179 Expense Deduction',
    'Employee Benefit Programs',
    'Insurance',
    'Interest',
    'Legal and Professional Services',
    'Office Expenses',
    'Pension and Profit-Sharing Plans',
    'Rent or Lease',
    'Repairs and Maintenance',
    'Supplies',
    'Taxes and Licenses',
    'Travel',
    'Meals',
    'Utilities',
    'Wages',
    'Other Expenses'
];

const PAYMENT_METHODS = [
    'Credit Card',
    'Debit Card',
    'Cash',
    'Check',
    'Wire Transfer',
    'Other'
] as string[];

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
        editType: 'amount'
    },
    { 
        id: 'date',
        label: 'Date',
        minWidth: 100,
        editable: true,
        editType: 'date'
    },
    { 
        id: 'payment_method' as keyof ExpenseDocument,
        label: 'Payment Method',
        minWidth: 130,
        editable: true,
        editType: 'select',
        options: PAYMENT_METHODS
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