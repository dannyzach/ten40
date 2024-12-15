import React from 'react';
import { Paper, Box } from '@mui/material';
import { DialogWrapper } from './common/DialogWrapper';

interface JsonViewerProps {
    data: any;
    onClose: () => void;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ data, onClose }) => {
    return (
        <DialogWrapper
            title="Receipt Data"
            open={true}
            onClose={onClose}
        >
            <Paper 
                sx={{ 
                    p: 2, 
                    bgcolor: 'grey.100',
                    maxHeight: '60vh',
                    overflow: 'auto'
                }}
            >
                <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                    {JSON.stringify(data, null, 2)}
                </pre>
            </Paper>
        </DialogWrapper>
    );
}; 