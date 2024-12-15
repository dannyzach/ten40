import React, { useCallback, useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    LinearProgress, 
    Button,
    styled
} from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { ReceiptTable } from './common';
import { ImageViewer } from './ImageViewer';
import { JsonViewer } from './JsonViewer';
import { Receipt } from '@/types';

const HiddenInput = styled('input')({
    display: 'none'
});

export const ReceiptUploader: React.FC = () => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [fileName, setFileName] = useState("");
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedJson, setSelectedJson] = useState<any | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<number | null>(null);

    // Fetch receipts on component mount
    useEffect(() => {
        fetchReceipts();
    }, []);

    const fetchReceipts = async () => {
        try {
            const response = await fetch('/api/receipts');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setReceipts(data);
        } catch (error) {
            console.error('Error fetching receipts:', error);
        }
    };

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const validateFile = (file: File) => {
        const validTypes = ['image/jpeg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            setUploadError('Only JPEG and PNG files are supported');
            setUploadStatus('error');
            return false;
        }
        return true;
    };

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        
        const files = e.dataTransfer.files;
        if (files.length) {
            const file = files[0];
            if (validateFile(file)) {
                await handleUpload(file);
            }
        }
    }, []);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && validateFile(file)) {
            await handleUpload(file);
        }
    };

    const handleUpload = async (file: File) => {
        setFileName(file.name);
        setUploadStatus('uploading');
        setUploadProgress(0);
        setUploadError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            setUploadStatus('success');
            setUploadProgress(100);
            await fetchReceipts(); // Refresh the list after successful upload
        } catch (error) {
            console.error('Upload error:', error);
            setUploadStatus('error');
            setUploadError(error instanceof Error ? error.message : 'Upload failed');
        }
    };

    return (
        <>
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    height: '256px', // equivalent to h-64
                    borderRadius: 2,
                    border: '2px dashed',
                    borderColor: theme => {
                        if (uploadStatus === "success") return 'success.main';
                        if (uploadStatus === "error") return 'error.main';
                        return isDragging ? 'primary.main' : 'divider';
                    },
                    bgcolor: theme => {
                        if (uploadStatus === "success") return 'success.light';
                        if (uploadStatus === "error") return 'error.light';
                        return isDragging ? 'primary.light' : 'grey.50';
                    },
                    transition: 'all 0.2s ease-in-out',
                    cursor: 'pointer'
                }}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                aria-label="Upload receipt"
            >
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 3,
                        textAlign: 'center'
                    }}
                >
                    <Box sx={{ 
                        mb: 2,
                        color: theme => {
                            if (uploadStatus === "success") return 'success.main';
                            if (uploadStatus === "error") return 'error.main';
                            return isDragging ? 'primary.main' : 'text.secondary';
                        }
                    }}>
                        {uploadStatus === "success" ? <CheckCircleIcon sx={{ fontSize: 48 }} />
                            : uploadStatus === "error" ? <ErrorIcon sx={{ fontSize: 48 }} />
                            : <UploadIcon sx={{ fontSize: 48 }} />
                        }
                    </Box>

                    <Typography 
                        variant="h6" 
                        sx={{ mb: 1, color: 'text.primary' }}
                    >
                        {uploadStatus === "success" ? "Upload Complete!"
                            : uploadStatus === "error" ? "Upload Failed"
                            : "Drag and drop your receipt here"}
                    </Typography>

                    <Typography 
                        variant="body2" 
                        sx={{ mb: 2, color: 'text.secondary' }}
                    >
                        {uploadStatus === "error" ? uploadError
                            : "Or click to browse files (JPEG, PNG)"}
                    </Typography>

                    {uploadStatus === 'idle' && (
                        <label>
                            <HiddenInput
                                type="file"
                                accept="image/jpeg,image/png"
                                onChange={handleFileSelect}
                            />
                            <Button
                                variant="contained"
                                component="span"
                                startIcon={<UploadIcon />}
                            >
                                Browse Files
                            </Button>
                        </label>
                    )}
                </Box>
            </Box>

            {uploadStatus === 'uploading' && (
                <Box sx={{ mt: 2 }}>
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        mb: 1 
                    }}>
                        <Typography variant="body2" color="text.secondary">
                            {fileName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {uploadProgress}%
                        </Typography>
                    </Box>
                    <LinearProgress 
                        variant="determinate" 
                        value={uploadProgress}
                        sx={{ height: 8, borderRadius: 1 }}
                    />
                </Box>
            )}

            <Box sx={{ mt: 4 }}>
                <ReceiptTable 
                    receipts={receipts}
                    onViewImage={setSelectedImage}
                    onViewJson={setSelectedJson}
                    onDelete={setDeleteConfirmOpen}
                />
            </Box>

            {selectedImage && (
                <ImageViewer
                    imagePath={selectedImage}
                    onClose={() => setSelectedImage(null)}
                />
            )}
            
            {selectedJson && (
                <JsonViewer
                    data={selectedJson}
                    onClose={() => setSelectedJson(null)}
                />
            )}
        </>
    );
};

export default ReceiptUploader; 