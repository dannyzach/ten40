import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import { DocumentType } from '@/types';

interface DocumentsTabsProps {
    activeTab: DocumentType;
    onTabChange: (tab: DocumentType) => void;
}

const TABS: { value: DocumentType; label: string }[] = [
    { value: DocumentType.W2, label: 'W-2' },
    { value: DocumentType.FORM_1099, label: '1099' },
    { value: DocumentType.EXPENSE, label: 'Expenses' },
    { value: DocumentType.DONATION, label: 'Donations' },
];

export const DocumentsTabs: React.FC<DocumentsTabsProps> = ({ 
    activeTab, 
    onTabChange 
}) => {
    return (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
                value={activeTab}
                onChange={(_, newValue) => onTabChange(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="document type tabs"
                sx={{
                    '& .MuiTab-root': {
                        fontSize: '1rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        minWidth: 100,
                    }
                }}
            >
                {TABS.map(tab => (
                    <Tab 
                        key={tab.value}
                        value={tab.value}
                        label={tab.label}
                        id={`tab-${tab.value}`}
                        aria-controls={`tabpanel-${tab.value}`}
                    />
                ))}
            </Tabs>
        </Box>
    );
}; 