import React from 'react';
import { ExpenseDocument, DocumentType } from '@/types';
import { BaseDocumentTable, Column } from './BaseDocumentTable';

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
        align: 'right',
        editable: true,
        editType: 'amount',
        format: (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    },
    { 
        id: 'date' as keyof ExpenseDocument,
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
        id: 'category' as keyof ExpenseDocument,
        label: 'Category',
        minWidth: 150,
        editable: true,
        editType: 'select',
        options: [] // Will be populated from backend
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