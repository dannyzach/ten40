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
    DialogContentText,
    Checkbox,
    Alert,
    Snackbar
} from '@mui/material';
import { Upload, Eye, FileJson, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { JsonViewer } from '@/components/JsonViewer';
import { ImageViewer } from '@/components/ImageViewer';
import { UploadArea } from './UploadArea';

interface Receipt {
    id: number;
    image_path: string;
    vendor: string;
    amount: string;
    date: string;
    payment_method: string;
    content: any;
}

type SortField = 'vendor' | 'amount' | 'date' | 'payment_method';
type SortDirection = 'asc' | 'desc';

export const ReceiptList = () => {
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedJson, setSelectedJson] = useState<any | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [sortField, setSortField] = useState<SortField>('date');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [selectedReceipts, setSelectedReceipts] = useState<number[]>([]);
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
    const [bulkActionStatus, setBulkActionStatus] = useState<{
        show: boolean;
        message: string;
        type: 'success' | 'error';
    }>({ show: false, message: '', type: 'success' });

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

            await fetchReceipts();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Upload failed';
            console.error('Upload error:', error);
            setUploadError(message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (deleteConfirmOpen === null) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/receipts/${deleteConfirmOpen}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`Failed to delete receipt: ${response.statusText}`);
            }

            await fetchReceipts();
        } catch (error) {
            console.error('Delete error:', error);
        } finally {
            setIsDeleting(false);
            setDeleteConfirmOpen(null);
        }
    };

    const sortReceipts = (receipts: Receipt[]): Receipt[] => {
        return [...receipts].sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];
            
            const comparison = sortDirection === 'asc' 
                ? String(aValue).localeCompare(String(bValue))
                : String(bValue).localeCompare(String(aValue));
            
            return comparison;
        });
    };

    const handleSort = (field: SortField) => {
        if (field === sortField) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ChevronUp className="w-4 h-4 text-gray-300" />;
        return sortDirection === 'asc' 
            ? <ChevronUp className="w-4 h-4" />
            : <ChevronDown className="w-4 h-4" />;
    };

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelectedReceipts(receipts.map(receipt => receipt.id));
        } else {
            setSelectedReceipts([]);
        }
    };

    const handleSelectOne = (id: number) => {
        setSelectedReceipts(prev => {
            if (prev.includes(id)) {
                return prev.filter(receiptId => receiptId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleBulkDelete = async () => {
        setShowBulkDeleteConfirm(false);
        setIsDeleting(true);
        try {
            const results = await Promise.all(
                selectedReceipts.map(id =>
                    fetch(`/api/receipts/${id}`, { method: 'DELETE' })
                    .then(response => ({ id, success: response.ok }))
                )
            );

            const failedDeletes = results.filter(r => !r.success).length;
            
            if (failedDeletes > 0) {
                setBulkActionStatus({
                    show: true,
                    message: `Failed to delete ${failedDeletes} receipts`,
                    type: 'error'
                });
            } else {
                setBulkActionStatus({
                    show: true,
                    message: 'Successfully deleted selected receipts',
                    type: 'success'
                });
            }
            
            // Clear selections and refresh list regardless of success
            setSelectedReceipts([]);
            await fetchReceipts();
            
        } catch (error) {
            console.error('Bulk delete error:', error);
            setBulkActionStatus({
                show: true,
                message: 'Error deleting receipts',
                type: 'error'
            });
            // Still refresh to ensure UI is in sync
            await fetchReceipts();
        } finally {
            setIsDeleting(false);
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

            <Box sx={{ 
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: { xs: 2, sm: 4 }
            }}>
                <TableContainer component={Paper}>
                    <UploadArea 
                        onUpload={handleFileUpload} 
                        isUploading={isUploading}
                        error={uploadError}
                    />
                </TableContainer>

                {selectedReceipts.length > 0 && (
                    <Box sx={{ 
                        width: '100%',
                        p: 2, 
                        bgcolor: 'primary.light', 
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                    }}>
                        <Typography sx={{ color: 'white' }}>
                            {selectedReceipts.length} items selected
                        </Typography>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => setShowBulkDeleteConfirm(true)}
                            disabled={isDeleting}
                            size="small"
                        >
                            Delete Selected
                        </Button>
                    </Box>
                )}

                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead>
                            <TableRow
                                sx={{
                                    bgcolor: 'grey.50',  // Light grey background
                                    '& th': {  // Target all header cells
                                        borderBottom: '2px solid',
                                        borderColor: 'grey.200',
                                        fontWeight: 600,
                                        color: 'grey.700'
                                    }
                                }}
                            >
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        indeterminate={
                                            selectedReceipts.length > 0 && 
                                            selectedReceipts.length < receipts.length
                                        }
                                        checked={
                                            receipts.length > 0 && 
                                            selectedReceipts.length === receipts.length
                                        }
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>
                                <TableCell 
                                    onClick={() => handleSort('vendor')}
                                    sx={{ 
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        '&:hover': { bgcolor: 'action.hover' }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        Vendor
                                        <SortIcon field="vendor" />
                                    </Box>
                                </TableCell>
                                <TableCell 
                                    onClick={() => handleSort('amount')}
                                    sx={{ 
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        '&:hover': { bgcolor: 'action.hover' }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        Amount
                                        <SortIcon field="amount" />
                                    </Box>
                                </TableCell>
                                <TableCell 
                                    onClick={() => handleSort('date')}
                                    sx={{ 
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        '&:hover': { bgcolor: 'action.hover' }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        Date
                                        <SortIcon field="date" />
                                    </Box>
                                </TableCell>
                                <TableCell 
                                    onClick={() => handleSort('payment_method')}
                                    sx={{ 
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        '&:hover': { bgcolor: 'action.hover' }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        Payment Method
                                        <SortIcon field="payment_method" />
                                    </Box>
                                </TableCell>
                                <TableCell align="left">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortReceipts(receipts).map((receipt) => (
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
                                    <TableCell 
                                        padding="checkbox"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Checkbox
                                            checked={selectedReceipts.includes(receipt.id)}
                                            onChange={() => handleSelectOne(receipt.id)}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ 
                                        maxWidth: { xs: '120px', sm: '200px', md: '300px' },
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {receipt.vendor}
                                    </TableCell>
                                    <TableCell sx={{ 
                                        maxWidth: { xs: '120px', sm: '200px', md: '300px' },
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {receipt.amount}
                                    </TableCell>
                                    <TableCell sx={{ 
                                        maxWidth: { xs: '120px', sm: '200px', md: '300px' },
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {receipt.date}
                                    </TableCell>
                                    <TableCell sx={{ 
                                        maxWidth: { xs: '120px', sm: '200px', md: '300px' },
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {receipt.payment_method}
                                    </TableCell>
                                    <TableCell 
                                        align="left"
                                        sx={{ 
                                            width: { xs: '140px', sm: '220px' },
                                            pr: { xs: 1, sm: 2 }
                                        }}
                                    >
                                        <Box 
                                            sx={{ 
                                                display: 'flex', 
                                                gap: { xs: 1, sm: 1.5 },
                                                justifyContent: 'flex-start'
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Tooltip title="View Receipt">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setSelectedImage(receipt.image_path)}
                                                    sx={{ 
                                                        color: 'text.secondary',
                                                        '&:hover': { color: '#2196f3' }
                                                    }}
                                                >
                                                    <Eye size={20} strokeWidth={1.5} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="View Data">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setSelectedJson(receipt.content)}
                                                    sx={{ 
                                                        color: 'text.secondary',
                                                        '&:hover': { color: '#2196f3' }
                                                    }}
                                                >
                                                    <FileJson size={20} strokeWidth={1.5} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setDeleteConfirmOpen(receipt.id)}
                                                    sx={{ 
                                                        color: 'text.secondary',
                                                        '&:hover': { color: '#f44336' }
                                                    }}
                                                >
                                                    <Trash2 size={20} strokeWidth={1.5} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
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

            <Dialog
                open={showBulkDeleteConfirm}
                onClose={() => setShowBulkDeleteConfirm(false)}
            >
                <DialogTitle>
                    Confirm Delete
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete {selectedReceipts.length} selected receipts? 
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setShowBulkDeleteConfirm(false)}
                        color="inherit"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleBulkDelete}
                        color="error"
                        variant="contained"
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={bulkActionStatus.show}
                autoHideDuration={6000}
                onClose={() => setBulkActionStatus(prev => ({ ...prev, show: false }))}
            >
                <Alert 
                    severity={bulkActionStatus.type}
                    onClose={() => setBulkActionStatus(prev => ({ ...prev, show: false }))}
                >
                    {bulkActionStatus.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default ReceiptList;