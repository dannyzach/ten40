import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Box,
    Typography,
    Tooltip,
    CircularProgress,
    Alert,
    Snackbar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { DocumentType, Document } from '@/types';
import { documentsApi } from '@/lib/api/documents';
import { ImageViewer } from '@/components/ImageViewer';
import { DocumentFilter } from '@/types/filters';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

interface DocumentsTableProps {
    type: DocumentType;
    filters: DocumentFilter;
    onFilterChange: (newFilters: DocumentFilter) => void;
}

type SortField = 'vendor' | 'amount' | 'date' | 'payment_method' | 'category';
type SortDirection = 'asc' | 'desc';

export const DocumentsTable: React.FC<DocumentsTableProps> = ({
    type,
    filters,
    onFilterChange,
}) => {
    const [selectedImagePath, setSelectedImagePath] = useState<string | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [snackbar, setSnackbar] = useState<{
        show: boolean;
        message: string;
        type: 'success' | 'error';
    }>({ show: false, message: '', type: 'success' });
    const [sortField, setSortField] = useState<SortField>('date');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    useEffect(() => {
        fetchDocuments();
    }, [type]);

    const fetchDocuments = async () => {
        setLoading(true);
        setError(null);
        try {
            const docs = await documentsApi.getDocuments(type);
            setDocuments(docs);
        } catch (error) {
            console.error('Error fetching documents:', error);
            setError('Failed to load documents. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewImage = (imagePath: string) => {
        setSelectedImagePath(imagePath);
    };

    const handleCloseImageViewer = () => {
        setSelectedImagePath(null);
    };

    const handleEdit = (documentId: string) => {
        console.log('Edit document:', documentId);
    };

    const handleDelete = async (documentId: string) => {
        try {
            await documentsApi.deleteDocument(documentId);
            setDocuments(documents.filter(doc => doc.id !== documentId));
            setSnackbar({ show: true, message: 'Document deleted successfully', type: 'success' });
        } catch (error) {
            setSnackbar({ show: true, message: 'Failed to delete document', type: 'error' });
        }
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
        if (sortField !== field) return (
            <KeyboardArrowUpIcon 
                sx={{ 
                    width: 16, 
                    height: 16, 
                    color: 'text.disabled' 
                }} 
            />
        );
        return sortDirection === 'asc' 
            ? <KeyboardArrowUpIcon sx={{ width: 16, height: 16 }} />
            : <KeyboardArrowDownIcon sx={{ width: 16, height: 16 }} />;
    };

    const sortReceipts = (receipts: Document[]): Document[] => {
        return [...receipts].sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];
            
            const comparison = sortDirection === 'asc' 
                ? String(aValue).localeCompare(String(bValue))
                : String(bValue).localeCompare(String(aValue));
            
            return comparison;
        });
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Paper sx={{ p: 4, textAlign: 'center', color: 'error.main' }}>
                <Typography>{error}</Typography>
            </Paper>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            {selectedImagePath && (
                <ImageViewer
                    imagePath={selectedImagePath}
                    onClose={handleCloseImageViewer}
                />
            )}
            
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
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
                            <TableCell 
                                onClick={() => handleSort('category')}
                                sx={{ 
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    Category
                                    <SortIcon field="category" />
                                </Box>
                            </TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortReceipts(documents).map((document) => (
                            <TableRow hover key={document.id}>
                                <TableCell>{document.type === 'Expenses' ? document.vendor : ''}</TableCell>
                                <TableCell>
                                    {document.type === 'Expenses' ? 
                                        document.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) 
                                        : ''}
                                </TableCell>
                                <TableCell>{document.date}</TableCell>
                                <TableCell>{document.type === 'Expenses' ? document.payment_method : ''}</TableCell>
                                <TableCell sx={{ 
                                    maxWidth: { xs: '120px', sm: '200px', md: '300px' },
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {document.category}
                                </TableCell>
                                <TableCell align="right">
                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                        <Tooltip title="View Receipt">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleViewImage(document.image_path)}
                                            >
                                                <VisibilityIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Edit">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleEdit(document.id)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDelete(document.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Snackbar
                open={snackbar.show}
                autoHideDuration={6000}
                onClose={() => setSnackbar(prev => ({ ...prev, show: false }))}
            >
                <Alert 
                    severity={snackbar.type}
                    onClose={() => setSnackbar(prev => ({ ...prev, show: false }))}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}; 