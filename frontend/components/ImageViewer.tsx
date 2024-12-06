import React from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    IconButton,
    Box
} from '@mui/material';
import { X } from "lucide-react";
import { useMediaQuery, Theme } from '@mui/material';

interface ImageViewerProps {
    imagePath: string;
    onClose: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ imagePath, onClose }) => {
    return (
        <Dialog 
            open={true} 
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            fullScreen={useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))}
        >
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Receipt Image
                <IconButton onClick={onClose} size="small">
                    <X size={18} />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ bgcolor: 'black', p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img 
                        src={`/api/images/${imagePath}`}
                        alt="Receipt"
                        style={{
                            maxWidth: '100%',
                            maxHeight: 'calc(90vh - 100px)',
                            objectFit: 'contain'
                        }}
                    />
                </Box>
            </DialogContent>
        </Dialog>
    );
}; 