import React from 'react';
import { Form1099Document, DocumentType } from '@/types';
import { BaseDocumentTable, Column } from './BaseDocumentTable';

const COLUMNS: Column<Form1099Document>[] = [
    { id: 'employer', label: 'Payer', minWidth: 170 },
    { 
        id: 'nonEmpCompensation',
        label: 'Amount',
        minWidth: 100,
        align: 'left',
        format: (value: string | number | null) => {
            if (value == null) return '';
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            return numValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        }
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

export const Form1099DocumentTable: React.FC<{ filters: any; onFilterChange: (f: any) => void }> = ({ 
    filters, 
    onFilterChange 
}) => (
    <BaseDocumentTable<Form1099Document>
        type={DocumentType.FORM_1099}
        columns={COLUMNS}
        filters={filters}
        onFilterChange={onFilterChange}
    />
); 