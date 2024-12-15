import React from 'react';
import { Box, useMediaQuery, Theme } from '@mui/material';
import { DialogWrapper } from './common/DialogWrapper';

interface ImageViewerProps {
    imagePath: string;
    onClose: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ imagePath, onClose }) => {
    const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

    return (
        <DialogWrapper
            title="Receipt Image"
            open={true}
            onClose={onClose}
        >
            <Box sx={{ bgcolor: 'black', p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img 
                        src={`/api/images/${imagePath}`}
                        alt="Receipt"
                        style={{
                            maxWidth: '100%',
                            maxHeight: isSmallScreen ? '90vh' : 'calc(90vh - 100px)',
                            objectFit: 'contain'
                        }}
                    />
                </Box>
            </Box>
        </DialogWrapper>
    );
}; 