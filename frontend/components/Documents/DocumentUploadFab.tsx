import React, { useState } from 'react';
import { 
    Fab, 
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Box,
    useTheme,
    useMediaQuery
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { DocumentUploadArea } from './DocumentUploadArea';
import { DocumentType } from '@/types';

export const DocumentUploadFab: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <>
            <Fab
                color="primary"
                aria-label="upload document"
                onClick={() => setIsOpen(true)}
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                }}
            >
                <AddIcon />
            </Fab>

            <Dialog
                open={isOpen}
                onClose={() => setIsOpen(false)}
                fullScreen={fullScreen}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ 
                    m: 0, 
                    p: 2, 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    Upload Document
                    <IconButton
                        aria-label="close"
                        onClick={() => setIsOpen(false)}
                        sx={{ color: 'text.secondary' }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <DocumentUploadArea activeTab={'W-2' as DocumentType} />
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
}; 