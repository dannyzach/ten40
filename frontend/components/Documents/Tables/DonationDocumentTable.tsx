import React from 'react';
import { DonationDocument, DocumentType } from '@/types';
import { BaseDocumentTable, Column } from './BaseDocumentTable';

const COLUMNS: Column<DonationDocument>[] = [
    { id: 'charityName', label: 'Charity', minWidth: 170 },
    { 
        id: 'amount',
        label: 'Amount',
        minWidth: 100,
        align: 'right',
        format: (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    },
    { id: 'donationType', label: 'Type', minWidth: 100 },
    { id: 'date', label: 'Date', minWidth: 100 },
    { id: 'status', label: 'Status', minWidth: 100, align: 'center' }
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