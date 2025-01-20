import React from 'react';
import { DocumentType } from '@/types';
import { 
    ExpenseDocumentTable,
    W2DocumentTable,
    Form1099DocumentTable,
    DonationDocumentTable 
} from './Tables';
import { Box } from '@mui/material';

interface DocumentsViewProps {
    activeTab: DocumentType;
    filters: any;
    onFilterChange: (filters: any) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({ 
    activeTab,
    filters,
    onFilterChange
}) => {
    const renderTable = () => {
        switch (activeTab) {
            case DocumentType.EXPENSE:
                return (
                    <ExpenseDocumentTable 
                        filters={filters}
                        onFilterChange={onFilterChange}
                    />
                );
            case DocumentType.W2:
                return (
                    <W2DocumentTable 
                        filters={filters}
                        onFilterChange={onFilterChange}
                    />
                );
            case DocumentType.FORM_1099:
                return (
                    <Form1099DocumentTable 
                        filters={filters}
                        onFilterChange={onFilterChange}
                    />
                );
            case DocumentType.DONATION:
                return (
                    <DonationDocumentTable 
                        filters={filters}
                        onFilterChange={onFilterChange}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            {renderTable()}
        </Box>
    );
}; 