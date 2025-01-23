import React from 'react';
import { Box, IconButton, Dialog, DialogTitle } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface ImageViewerProps {
    open: boolean;
    imageUrl: string;
    onClose: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ open, imageUrl, onClose }) => {
    if (!open) return null;

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="lg"
            fullWidth
        >
            <DialogTitle sx={{ 
                m: 0, 
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                Receipt Image
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{ color: 'text.secondary' }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <Box sx={{ bgcolor: 'black', p: 2 }}>
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    maxHeight: 'calc(90vh - 100px)',
                    overflow: 'auto'
                }}>
                    <img 
                        src={imageUrl}
                        alt="Receipt"
                        style={{
                            maxWidth: '100%',
                            height: 'auto',
                            objectFit: 'contain'
                        }}
                    />
                </Box>
            </Box>
        </Dialog>
    );
}; 