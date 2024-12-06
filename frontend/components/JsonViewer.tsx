import React from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    IconButton, 
    Paper,
    Box
} from '@mui/material';
import { X } from "lucide-react";

interface JsonViewerProps {
    data: any;
    onClose: () => void;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ data, onClose }) => {
    return (
        <Dialog 
            open={true} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Receipt Data
                <IconButton onClick={onClose} size="small">
                    <X size={18} />
                </IconButton>
            </DialogTitle>
            <DialogContent>
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
            </DialogContent>
        </Dialog>
    );
}; 