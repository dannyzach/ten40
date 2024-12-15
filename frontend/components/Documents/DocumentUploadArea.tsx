import React, { useCallback, useState } from 'react';
import { Box, Typography, LinearProgress, Alert } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { DocumentType } from '@/types';
import { documentsApi } from '@/lib/api/documents';

interface DocumentUploadAreaProps {
    activeTab: DocumentType;
    onUploadComplete?: () => void;
}

export const DocumentUploadArea: React.FC<DocumentUploadAreaProps> = ({ 
    activeTab,
    onUploadComplete 
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        setIsUploading(true);
        setUploadError(null);

        try {
            const file = acceptedFiles[0];
            await documentsApi.uploadDocument(file, activeTab);
            if (onUploadComplete) {
                onUploadComplete();
            }
        } catch (error) {
            setUploadError('Failed to upload document. Please try again.');
            console.error('Upload error:', error);
        } finally {
            setIsUploading(false);
        }
    }, [activeTab, onUploadComplete]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'application/pdf': ['.pdf']
        },
        multiple: false,
        disabled: isUploading
    });

    return (
        <Box 
            {...getRootProps()}
            sx={{
                p: 3,
                mb: 3,
                border: '2px dashed',
                borderColor: theme => 
                    isDragActive 
                        ? 'primary.main' 
                        : uploadError 
                            ? 'error.main' 
                            : 'divider',
                borderRadius: 1,
                bgcolor: theme =>
                    isDragActive
                        ? 'primary.light'
                        : uploadError
                            ? 'error.light'
                            : 'background.default',
                cursor: isUploading ? 'wait' : 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'center',
                position: 'relative'
            }}
        >
            <input {...getInputProps()} />

            {isUploading && (
                <LinearProgress 
                    sx={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        borderTopLeftRadius: 'inherit',
                        borderTopRightRadius: 'inherit'
                    }}
                />
            )}

            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                gap: 2
            }}>
                <CloudUploadIcon 
                    sx={{ 
                        fontSize: 48,
                        color: theme => 
                            isDragActive 
                                ? 'primary.main' 
                                : 'text.secondary'
                    }} 
                />
                
                <Typography variant="h6" component="div">
                    {isDragActive
                        ? `Drop your ${activeTab} document here`
                        : isUploading
                            ? 'Uploading...'
                            : `Drag and drop your ${activeTab} document here`}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                    or click to select files (PDF, JPEG, PNG)
                </Typography>
            </Box>

            {uploadError && (
                <Alert 
                    severity="error" 
                    sx={{ mt: 2 }}
                    onClose={() => setUploadError(null)}
                >
                    {uploadError}
                </Alert>
            )}
        </Box>
    );
}; 