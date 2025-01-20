import React from 'react';
import { W2Document, DocumentType } from '@/types';
import { BaseDocumentTable, Column } from './BaseDocumentTable';

const COLUMNS: Column<W2Document>[] = [
    { id: 'employer', label: 'Employer', minWidth: 170 },
    { 
        id: 'wages',
        label: 'Wages',
        minWidth: 100,
        align: 'right',
        format: (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    },
    { 
        id: 'fedWithholding',
        label: 'Fed Withholding',
        minWidth: 130,
        align: 'right',
        format: (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    },
    { id: 'status', label: 'Status', minWidth: 100, align: 'center' }
];

export const W2DocumentTable: React.FC<{ filters: any; onFilterChange: (f: any) => void }> = ({ 
    filters, 
    onFilterChange 
}) => (
    <BaseDocumentTable<W2Document>
        type={DocumentType.W2}
        columns={COLUMNS}
        filters={filters}
        onFilterChange={onFilterChange}
    />
); 