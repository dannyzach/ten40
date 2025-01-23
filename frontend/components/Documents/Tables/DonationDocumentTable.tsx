import React from 'react';
import { DonationDocument, DocumentType } from '@/types';
import { BaseDocumentTable, Column } from './BaseDocumentTable';

const COLUMNS: Column<DonationDocument>[] = [
    { id: 'charityName', label: 'Charity', minWidth: 170 },
    { 
        id: 'amount',
        label: 'Amount',
        minWidth: 100,
        align: 'left',
        format: (value: string | number | null) => {
            if (value == null) return '';
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            return numValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        }
    },
    { id: 'donationType', label: 'Type', minWidth: 100 },
    { id: 'date', label: 'Date', minWidth: 100 },
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

export const DonationDocumentTable: React.FC<{ filters: any; onFilterChange: (f: any) => void }> = ({ 
    filters, 
    onFilterChange 
}) => (
    <BaseDocumentTable<DonationDocument>
        type={DocumentType.DONATION}
        columns={COLUMNS}
        filters={filters}
        onFilterChange={onFilterChange}
    />
); 