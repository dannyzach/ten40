import React from 'react';
import { 
    Dialog, 
    DialogContent, 
    IconButton, 
    AppBar, 
    Toolbar, 
    Typography 
} from '@mui/material';
import { Close } from '@mui/icons-material';

interface ImageModalProps {
    imagePath: string;
    onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imagePath, onClose }) => {
    return (
        <Dialog
            fullScreen
            open={true}
            onClose={onClose}
        >
            <AppBar sx={{ position: 'relative' }}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={onClose}
                        aria-label="close"
                    >
                        <Close />
                    </IconButton>
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6">
                        Receipt Image
                    </Typography>
                </Toolbar>
            </AppBar>
            <DialogContent sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                bgcolor: 'black'
            }}>
                <img 
                    src={`/api/images/${imagePath}`}
                    alt="Receipt"
                    style={{
                        maxWidth: '100%',
                        maxHeight: '90vh',
                        objectFit: 'contain'
                    }}
                />
            </DialogContent>
        </Dialog>
    );
};

export default ImageModal; 