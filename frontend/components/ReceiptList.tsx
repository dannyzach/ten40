import React, { useState, useEffect } from 'react';
import { Receipt } from '../types';
import JsonView from './JsonView';
import ImageModal from './ImageModal';
import { UploadReceipt } from './UploadReceipt';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow,
    Paper,
    Button,
    Alert,
    CircularProgress,
    Box,
    Typography,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { Visibility, Delete } from '@mui/icons-material';

export const ReceiptList: React.FC = () => {
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const fetchReceipts = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch('/api/receipts');
            if (!response.ok) {
                throw new Error(`Failed to fetch receipts: ${response.statusText}`);
            }
            const data = await response.json();
            if (!Array.isArray(data)) {
                throw new Error('Invalid response format from server');
            }
            setReceipts(data);
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch receipts');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReceipts();
    }, []);

    const toggleJsonExpand = (id: number) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    const handleDelete = async (id: number) => {
        try {
            setDeletingId(id);
            const response = await fetch(`/api/receipts/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error('Failed to delete receipt');
            }
            await fetchReceipts();
        } catch (error) {
            console.error('Failed to delete receipt:', error);
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Date formatting error:', error);
            return 'Invalid Date';
        }
    };

    return (
        <Box sx={{ 
            maxWidth: '100%',
            overflow: 'hidden',
            p: { xs: 1, sm: 2, md: 3 }
        }}>
            <Typography 
                variant="h4" 
                component="h1" 
                sx={{ 
                    mb: { xs: 2, sm: 3 },
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                }}
            >
                Receipt Organizer
            </Typography>

            <UploadReceipt onUploadComplete={fetchReceipts} />
            
            {error && (
                <Alert 
                    severity="error"
                    sx={{ mb: { xs: 2, sm: 3 } }}
                >
                    {error}
                </Alert>
            )}

            {isLoading ? (
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '200px',
                    flexDirection: 'column',
                    gap: 2
                }}>
                    <CircularProgress />
                    <Typography>Loading receipts...</Typography>
                </Box>
            ) : (
                <TableContainer 
                    component={Paper}
                    sx={{ 
                        overflowX: 'auto',
                        '& .MuiTable-root': {
                            minWidth: { xs: '100%', sm: '650px' }
                        }
                    }}
                >
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell 
                                    sx={{ 
                                        fontWeight: 600,
                                        fontSize: '1.1rem',
                                        backgroundColor: 'primary.main',
                                        color: 'white'
                                    }}
                                >
                                    Receipt Name
                                </TableCell>
                                <TableCell 
                                    sx={{ 
                                        fontWeight: 600,
                                        fontSize: '1.1rem',
                                        backgroundColor: 'primary.main',
                                        color: 'white'
                                    }}
                                >
                                    Date Uploaded
                                </TableCell>
                                <TableCell 
                                    sx={{ 
                                        fontWeight: 600,
                                        fontSize: '1.1rem',
                                        backgroundColor: 'primary.main',
                                        color: 'white'
                                    }}
                                >
                                    Receipt Data
                                </TableCell>
                                <TableCell 
                                    sx={{ 
                                        fontWeight: 600,
                                        fontSize: '1.1rem',
                                        backgroundColor: 'primary.main',
                                        color: 'white'
                                    }}
                                >
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {receipts.map(receipt => (
                                <TableRow 
                                    key={receipt.id}
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: 'action.hover',
                                            '& .MuiButton-root': {
                                                opacity: 1
                                            }
                                        }
                                    }}
                                >
                                    <TableCell>
                                        {receipt.original_filename || 'Unnamed Receipt'}
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(receipt.uploaded_at)}
                                    </TableCell>
                                    <TableCell 
                                        onClick={() => toggleJsonExpand(receipt.id)}
                                        sx={{ 
                                            cursor: 'pointer',
                                            '&:hover': { bgcolor: 'action.hover' }
                                        }}
                                    >
                                        <JsonView 
                                            data={receipt.content} 
                                            isExpanded={expandedRows.has(receipt.id)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            gap: 1,
                                            flexDirection: { xs: 'column', sm: 'row' }
                                        }}>
                                            <Button
                                                startIcon={<Visibility />}
                                                variant="contained"
                                                color="primary"
                                                onClick={() => setSelectedImage(receipt.image_path)}
                                                fullWidth={isMobile}
                                                size={isMobile ? "small" : "medium"}
                                            >
                                                View
                                            </Button>
                                            <Button
                                                startIcon={<Delete />}
                                                variant="contained"
                                                color="error"
                                                onClick={() => handleDelete(receipt.id)}
                                                disabled={deletingId === receipt.id}
                                                fullWidth={isMobile}
                                                size={isMobile ? "small" : "medium"}
                                            >
                                                {deletingId === receipt.id ? 'Deleting...' : 'Delete'}
                                            </Button>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {selectedImage && (
                <ImageModal 
                    imagePath={selectedImage}
                    onClose={() => setSelectedImage(null)}
                />
            )}
        </Box>
    );
};

export default ReceiptList;