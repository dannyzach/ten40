import React, { useState } from 'react';
import { 
    Button, 
    Box, 
    LinearProgress, 
    Typography, 
    Alert,
    Paper,
    useTheme,
    useMediaQuery,
    CircularProgress
} from '@mui/material';
import { Upload, Cancel } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

interface UploadReceiptProps {
    onUploadComplete: () => void;
}

export const UploadReceipt: React.FC<UploadReceiptProps> = ({ onUploadComplete }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [isDragging, setIsDragging] = useState(false);
    const [abortController, setAbortController] = useState<AbortController | null>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const handleCancel = () => {
        if (abortController) {
            abortController.abort();
            setIsUploading(false);
            setError('Upload cancelled');
            setAbortController(null);
        }
    };

    const handleFileUpload = async (file: File) => {
        if (file.size > 15 * 1024 * 1024) {
            setError('File size too large. Maximum size is 15MB.');
            return;
        }

        setIsUploading(true);
        setError(null);

        const controller = new AbortController();
        setAbortController(controller);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
                signal: controller.signal
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            onUploadComplete();
        } catch (err: unknown) {
            if (err instanceof Error && err.name === 'AbortError') {
                // Upload was cancelled, error is already set
                return;
            }
            if (err instanceof Error && err.name === 'TimeoutError') {
                setError('Upload timed out. Please try again.');
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Upload failed');
            }
        } finally {
            setIsUploading(false);
            setAbortController(null);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png']
        },
        multiple: false,
        onDrop: async (acceptedFiles: File[]) => {
            if (acceptedFiles.length > 0) {
                setIsUploading(true);
                try {
                    await handleFileUpload(acceptedFiles[0]);
                } finally {
                    setIsUploading(false);
                }
            }
        }
    });

    return (
        <Box
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            sx={{
                mb: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transition: 'all 0.3s',
                ...(isDragging && {
                    backgroundColor: 'action.hover',
                    '& .upload-zone': {
                        borderColor: 'primary.main',
                    }
                })
            }}
        >
            <Box
                className="upload-zone"
                sx={{
                    position: 'relative',
                    p: 3,
                    width: '100%',
                    maxWidth: 500,
                    textAlign: 'center',
                    borderRadius: 2,
                    cursor: isUploading ? 'wait' : 'pointer',
                    border: '2px dashed',
                    borderColor: isDragging ? 'primary.main' : 'grey.300',
                    bgcolor: isDragging ? 'action.hover' : 'transparent',
                    transform: isDragging ? 'scale(1.02)' : 'scale(1)',
                    transition: theme.transitions.create(
                        ['border-color', 'background-color', 'transform'],
                        { duration: theme.transitions.duration.shorter }
                    ),
                    '&:hover': {
                        borderColor: 'primary.light',
                        bgcolor: 'action.hover'
                    },
                    '& .drag-icon': {
                        transform: isDragging ? 'translateY(-5px)' : 'translateY(0)',
                        transition: theme.transitions.create('transform')
                    }
                }}
            >
                {isUploading && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: 2,
                            zIndex: 1,
                            animation: 'fadeIn 0.3s ease-out',
                            padding: 3
                        }}
                    >
                        <LinearProgress 
                            sx={{ 
                                width: '80%',
                                mb: 3,
                                height: 8,
                                borderRadius: 4
                            }}
                        />
                        <Typography
                            variant="h6"
                            sx={{ 
                                mb: 1,
                                animation: 'pulse 2s infinite'
                            }}
                        >
                            Processing Receipt
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 3 }}
                        >
                            This may take a while...
                        </Typography>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={handleCancel}
                            startIcon={<Cancel />}
                            size="small"
                            sx={{
                                opacity: 0.8,
                                '&:hover': {
                                    opacity: 1
                                }
                            }}
                        >
                            Cancel Upload
                        </Button>
                    </Box>
                )}

                <Box className="drag-icon" sx={{ mb: 2 }}>
                    <Upload sx={{ fontSize: 40, color: isDragging ? 'primary.main' : 'action.active' }} />
                </Box>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    style={{ display: 'none' }}
                    id="upload-input"
                />
                <label htmlFor="upload-input">
                    <Button
                        variant="contained"
                        component="span"
                        disabled={isUploading}
                        startIcon={<Upload />}
                        sx={{
                            py: 1.5,
                            px: 4,
                            fontSize: '1.1rem'
                        }}
                    >
                        {isUploading ? 'Processing...' : 'Upload Receipt'}
                    </Button>
                </label>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    or drag and drop a receipt image here
                </Typography>
            </Box>

            {error && (
                <Alert 
                    severity="error" 
                    sx={{ 
                        mt: { xs: 1, sm: 2 },
                        width: '100%',
                        animation: 'slideIn 0.4s ease-out'
                    }}
                >
                    {error}
                </Alert>
            )}
        </Box>
    );
};

export default UploadReceipt; 