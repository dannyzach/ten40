import React, { useState } from 'react';
import { Box, Container } from '@mui/material';
import { DocumentsTabs } from '@/components/Documents/DocumentsTabs';
import { DocumentsView } from '@/components/Documents/DocumentsView';
import { DocumentUploadArea } from '@/components/Documents/DocumentUploadArea';
import { DocumentUploadFab } from '@/components/Documents/DocumentUploadFab';
import { DocumentType } from '@/types';
import { DocumentFilter, W2Filter, Form1099Filter, ExpenseFilter, DonationFilter } from '@/types/filters';

const DocumentsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<DocumentType>('W-2' as DocumentType);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    
    // Persistent filters for each document type
    const [filters, setFilters] = useState<Record<DocumentType, DocumentFilter>>({
        'W-2': {} as W2Filter,
        '1099': {} as Form1099Filter,
        'Expenses': {} as ExpenseFilter,
        'Donations': {} as DonationFilter
    });

    const handleTabChange = (tab: DocumentType) => {
        setActiveTab(tab);
    };

    const handleFilterChange = (newFilters: DocumentFilter) => {
        setFilters(prev => ({
            ...prev,
            [activeTab]: newFilters
        }));
    };

    const handleUploadComplete = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <Box 
            sx={{ 
                height: '100%',
                width: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                overflow: 'auto'
            }}
        >
            <Container maxWidth={false} sx={{ py: 3 }}>
                <DocumentsTabs 
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                />

                <DocumentUploadArea 
                    activeTab={activeTab}
                    onUploadComplete={handleUploadComplete}
                />

                <DocumentsView 
                    activeTab={activeTab}
                    filters={filters[activeTab]}
                    onFilterChange={handleFilterChange}
                    key={refreshTrigger}
                />

                <DocumentUploadFab />
            </Container>
        </Box>
    );
};

export default DocumentsPage; 