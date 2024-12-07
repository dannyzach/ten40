import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Typography, 
    Paper, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow,
    Button,
    Box,
    IconButton,
    CircularProgress,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText
} from '@mui/material';
import { Upload, Eye, FileJson, Trash2 } from "lucide-react";
import { JsonViewer } from '@/components/JsonViewer';
import { ImageViewer } from '@/components/ImageViewer';
import { DebugPanel } from '@/components/DebugPanel';
import { UploadArea } from './UploadArea';

interface Receipt {
    id: number;
    image_path: string;
    original_filename: string;
    uploaded_at: string;
    content: any;
}

export const ReceiptList = () => {
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedJson, setSelectedJson] = useState<any | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [debugMessages, setDebugMessages] = useState<string[]>([]);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const addDebugMessage = (message: string) => {
        setDebugMessages(prev => [...prev, `${new Date().toISOString()} - ${message}`]);
        console.log(message);
    };

    const fetchReceipts = async () => {
        try {
            addDebugMessage("Fetching receipts...");
            const response = await fetch('/api/receipts');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setReceipts(data);
            addDebugMessage("Receipts fetched successfully");
        } catch (error) {
            addDebugMessage(`Error fetching receipts: ${error}`);
        }
    };

    useEffect(() => {
        fetchReceipts();
    }, []);

    const handleFileUpload = async (file: File) => {
        console.log('Starting file upload for:', file.name);
        
        // Check file type
        if (!file.type.match(/^image\/(jpeg|png)$/)) {
            const error = 'Invalid file type. Please upload a JPEG or PNG image.';
            console.error(error);
            setUploadError(error);
            return;
        }

        if (file.size > 15 * 1024 * 1024) {
            const error = 'File size too large. Maximum size is 15MB.';
            console.error(error);
            setUploadError(error);
            return;
        }

        setIsUploading(true);
        setUploadError(null);
        const formData = new FormData();
        formData.append('file', file);

        try {
            addDebugMessage("Starting file upload...");
            console.log('Sending request to /api/upload');
            
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            console.log('Upload response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Upload failed: ${response.statusText}. ${errorText}`);
            }

            const data = await response.json();
            console.log('Upload response:', data);

            addDebugMessage("Upload successful, processing receipt...");
            await fetchReceipts();
            addDebugMessage("Receipt processed and saved");
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Upload failed';
            console.error('Upload error:', error);
            setUploadError(message);
            addDebugMessage(`Error: ${message}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (deleteConfirmOpen === null) return;

        setIsDeleting(true);
        try {
            addDebugMessage(`Deleting receipt ${deleteConfirmOpen}...`);
            const response = await fetch(`/api/receipts/${deleteConfirmOpen}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`Failed to delete receipt: ${response.statusText}`);
            }

            addDebugMessage('Receipt deleted successfully');
            await fetchReceipts();
        } catch (error) {
            addDebugMessage(`Error deleting receipt: ${error}`);
            console.error('Delete error:', error);
        } finally {
            setIsDeleting(false);
            setDeleteConfirmOpen(null);
        }
    };

    return (
        <Container 
            maxWidth={false} 
            disableGutters 
            sx={{ 
                px: { xs: 1, sm: 2, md: 4 },
                py: { xs: 2, sm: 4 },
                maxWidth: '100vw',
                overflowX: 'hidden'
            }}
        >
            <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom
                sx={{ 
                    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
                    mb: { xs: 2, sm: 4 },
                    textTransform: 'uppercase'
                }}
            >
                Receipt Organizer
            </Typography>

            <UploadArea 
                onUpload={handleFileUpload} 
                isUploading={isUploading}
                error={uploadError}
            />

            <Box sx={{ 
                width: '100%', 
                overflowX: 'auto',
                mt: { xs: 2, sm: 4 }
            }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Receipt File Name</TableCell>
                            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                                Upload Date
                            </TableCell>
                            <TableCell align="left">
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {receipts.map((receipt) => (
                            <TableRow 
                                key={receipt.id} 
                                hover
                                onClick={() => setSelectedImage(receipt.image_path)}
                                sx={{ 
                                    cursor: 'pointer',
                                    '&:hover': {
                                        bgcolor: 'action.hover',
                                    }
                                }}
                            >
                                <TableCell sx={{ 
                                    maxWidth: { xs: '120px', sm: '200px', md: '300px' },
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {receipt.original_filename}
                                </TableCell>
                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                                    {new Date(receipt.uploaded_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell align="left">
                                    <Box 
                                        sx={{ 
                                            display: 'flex', 
                                            gap: { xs: 0.5, sm: 1 },
                                            justifyContent: 'flex-start',
                                            '& .MuiButton-root': {
                                                minWidth: { xs: '32px', sm: 'auto' },
                                                px: { xs: 1, sm: 2 }
                                            }
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Tooltip title="View">
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => setSelectedImage(receipt.image_path)}
                                            >
                                                <Eye className="w-4 h-4" />
                                                <span className="hidden sm:inline ml-2">View</span>
                                            </Button>
                                        </Tooltip>
                                        <Tooltip title="Data">
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => setSelectedJson(receipt.content)}
                                            >
                                                <FileJson className="w-4 h-4" />
                                                <span className="hidden sm:inline ml-2">Data</span>
                                            </Button>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                size="small"
                                                onClick={() => setDeleteConfirmOpen(receipt.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span className="hidden sm:inline ml-2">Delete</span>
                                            </Button>
                                        </Tooltip>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>

            <DebugPanel messages={debugMessages} />

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

            <Dialog
                open={deleteConfirmOpen !== null}
                onClose={() => setDeleteConfirmOpen(null)}
            >
                <DialogTitle>
                    Confirm Delete
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this receipt? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setDeleteConfirmOpen(null)}
                        color="inherit"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained"
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ReceiptList;