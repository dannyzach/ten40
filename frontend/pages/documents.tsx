import React from 'react';
import ReceiptList from '../components/ReceiptList';
import { Box } from '@mui/material';

const DocumentsPage: React.FC = () => {
    return (
        <Box sx={{ 
            height: '100%',
            width: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            overflow: 'auto'
        }}>
            <ReceiptList />
        </Box>
    );
};

export default DocumentsPage; 