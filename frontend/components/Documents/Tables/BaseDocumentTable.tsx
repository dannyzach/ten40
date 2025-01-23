import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    CircularProgress,
    Checkbox,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Snackbar,
    Alert,
    TableSortLabel,
    Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Document, DocumentType } from '@/types';
import { documentsApi } from '@/lib/api/documents';
import { EditableCell } from '../EditableCell';
import { ImageViewer } from '@/components/ImageViewer';
import { DocumentFilters } from '../DocumentFilters';
import axios from 'axios';

// Define allowed value types for document fields
type DocumentValue = string | number | null;

export interface Column<T> {
    id: keyof T | 'actions';
    label: string;
    minWidth?: number;
    align?: 'left' | 'right' | 'center';
    format?: (value: any) => string;
    editable?: boolean;
    editType?: 'text' | 'date' | 'amount' | 'select';
    options?: string[];
}

interface BaseDocumentTableProps<T extends Document> {
    type: DocumentType;
    columns: Column<T>[];
    filters: any;
    onFilterChange: (filters: any) => void;
}

// Add a type guard for documents with image paths
interface WithImagePath {
    image_path: string;
}

const hasImagePath = (doc: any): doc is WithImagePath => {
    return 'image_path' in doc && typeof doc.image_path === 'string';
};

const TableToolbar = ({ 
    type,
    numSelected,
    onDelete,
    filters,
    onFilterChange,
    onSelectAll,
    selected,
}: { 
    type: DocumentType;
    numSelected: number;
    onDelete: () => void;
    filters: any;
    onFilterChange: (filters: any) => void;
    onSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
    selected: number[];
}) => (
    <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: numSelected > 0 ? 'action.selected' : 'background.paper'
    }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Checkbox
                indeterminate={numSelected > 0}
                checked={numSelected > 0}
                onChange={onSelectAll}
            />
            {numSelected > 0 && (
                <>
                    <Typography>
                        {numSelected} selected
                    </Typography>
                    <Tooltip title="Delete">
                        <IconButton onClick={onDelete} size="small">
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </>
            )}
        </Box>
        <DocumentFilters
            type={type}
            filters={filters}
            onFilterChange={onFilterChange}
            variant="toolbar"
        />
    </Box>
);

// Add this utility function at the top of the file
const formatDate = (value: DocumentValue): string => {
    if (!value || value === 'Missing') return 'Missing';
    
    try {
        const date = new Date(String(value));
        if (isNaN(date.getTime())) return 'Invalid Date';

        // Use a single consistent format for all dates
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    } catch {
        return 'Invalid Date';
    }
};

const normalizePaymentMethod = (value: string): string => {
    // Normalize to uppercase for case-insensitive comparison
    const upperValue = value.toUpperCase();
    
    // Map legacy and variant values to standardized options
    const mapping: Record<string, string> = {
        'CARD': 'Credit Card',
        'US DEBIT': 'Debit Card',
        'DEBIT': 'Debit Card',
        'CREDIT': 'Credit Card',
        'CC': 'Credit Card',
        'DC': 'Debit Card',
        'WIRE': 'Wire Transfer',
        'TRANSFER': 'Wire Transfer',
        'CHK': 'Check',
        'CHEQUE': 'Check',
        'CASH': 'Cash'
    };

    return mapping[upperValue] || value;
};

const formatAmount = (value: DocumentValue): string => {
    if (!value) return '';
    
    try {
        // Remove any currency symbols and convert to number
        const numValue = typeof value === 'string' 
            ? parseFloat(value.replace(/[^0-9.-]+/g, ''))
            : Number(value);

        if (isNaN(numValue)) return 'Invalid Amount';

        // Format with 2 decimal places, no currency symbol
        return numValue.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    } catch {
        return 'Invalid Amount';
    }
};

export function BaseDocumentTable<T extends Document>({ 
    type,
    columns,
    filters,
    onFilterChange
}: BaseDocumentTableProps<T>) {
    const [documents, setDocuments] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [orderBy, setOrderBy] = useState<keyof T | ''>('');
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');
    const [selected, setSelected] = useState<number[]>([]);
    const [availableOptions, setAvailableOptions] = useState<Record<string, string[]>>({});
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error';
    }>({
        open: false,
        message: '',
        severity: 'success'
    });
    const [editingCell, setEditingCell] = useState<{
        id: number;
        field: keyof T;
    } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteSnackbar, setDeleteSnackbar] = useState({
        open: false,
        message: ''
    });

    // Move the type guard inside the component
    const isStringKey = (key: keyof T): key is keyof T & string => 
        typeof key === 'string';

    // Fetch documents
    useEffect(() => {
        fetchDocuments();
    }, [type]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await documentsApi.getDocuments();
            setDocuments(response.data.filter((doc: Document) => doc.type === type) as T[]);
        } catch (error) {
            showError('Failed to fetch documents');
        } finally {
            setLoading(false);
        }
    };

    // Selection handlers
    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelected(documents.map(doc => doc.id));
        } else {
            setSelected([]);
        }
    };

    const handleSelectOne = (id: number) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected: number[] = [];

        if (selectedIndex === -1) {
            newSelected = [...selected, id];
        } else {
            newSelected = selected.filter(item => item !== id);
        }

        setSelected(newSelected);
    };

    // Delete handlers
    const handleSingleDelete = async (documentId: number) => {
        try {
            await documentsApi.deleteDocument(documentId);
            await fetchDocuments();
            setDeleteSnackbar({
                open: true,
                message: 'Document deleted successfully'
            });
        } catch (error) {
            console.error('[BaseDocumentTable] Delete error:', error);
            setDeleteSnackbar({
                open: true,
                message: error instanceof Error 
                    ? error.message 
                    : 'Failed to delete document. Please try again.'
            });
        }
    };

    const handleBulkDelete = async () => {
        if (!selected.length) return;
        
        setIsDeleting(true);
        try {
            await documentsApi.deleteDocuments(selected);
            await fetchDocuments();
            setSelected([]);
            setDeleteSnackbar({
                open: true,
                message: 'Successfully deleted selected items'
            });
            setDeleteDialogOpen(false);
        } catch (error) {
            console.error('[BaseDocumentTable] Bulk delete error:', error);
            setDeleteSnackbar({
                open: true,
                message: error instanceof Error 
                    ? error.message 
                    : 'Failed to delete selected items'
            });
        } finally {
            setIsDeleting(false);
        }
    };

    // Update handler
    const handleUpdateField = async (documentId: number, field: keyof T, value: string): Promise<void> => {
        try {
            console.log('[BaseDocumentTable] Starting update:', { documentId, field, value });
            
            // Skip update if value is "Missing" or empty
            if (value === 'Missing' || !value.trim()) {
                console.log('[BaseDocumentTable] Skipping update for empty/missing value');
                return;
            }

            // Special handling for date fields
            if (field === 'date') {
                const dateValue = new Date(value);
                if (isNaN(dateValue.getTime())) {
                    console.error('[BaseDocumentTable] Invalid date value:', value);
                    showError('Invalid date format');
                    return;
                }
                // Format date as YYYY-MM-DD
                value = dateValue.toISOString().split('T')[0];
            }
            
            // Create update object with proper typing
            const updates = { [field]: value } as Partial<T>;
            
            await documentsApi.updateDocument(documentId, updates);
            await fetchDocuments();
            showSuccess('Document updated successfully');
        } catch (error) {
            console.error('[BaseDocumentTable] Update failed:', error);
            if (axios.isAxiosError(error) && error.response?.status === 400) {
                showError('Invalid input. Please check the format and try again.');
            } else {
                showError('Failed to update document');
            }
            throw error;
        }
    };

    // Notification handlers
    const showSuccess = (message: string) => {
        setSnackbar({ open: true, message, severity: 'success' });
    };

    const showError = (message: string) => {
        setSnackbar({ open: true, message, severity: 'error' });
    };

    const handleCellClick = (id: number, field: keyof T) => {
        const column = columns.find(col => col.id === field);
        if (column?.editable) {
            setEditingCell({ id, field });
        }
    };

    const handleCellBlur = () => {
        setEditingCell(null);
    };

    // Then update the formatCellValue function
    const formatCellValue = (value: DocumentValue, column: Column<T>) => {
        if (value == null) return '';
        
        if (column.editType === 'date') {
            return formatDate(value);
        }

        if (column.editType === 'amount') {
            return formatAmount(value);
        }
        
        if (column.id === 'payment_method') {
            return normalizePaymentMethod(String(value));
        }
        
        return String(value);
    };

    // Sorting logic from DocumentsTable
    const sortedDocuments = useMemo(() => {
        if (!orderBy) return documents;

        return [...documents].sort((a, b) => {
            const aValue = a[orderBy];
            const bValue = b[orderBy];

            // Handle null/undefined values
            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;
            if (aValue === bValue) return 0;

            // Handle numeric values
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return order === 'asc' ? aValue - bValue : bValue - aValue;
            }

            // Handle date values
            if (aValue instanceof Date && bValue instanceof Date) {
                return order === 'asc' 
                    ? aValue.getTime() - bValue.getTime()
                    : bValue.getTime() - aValue.getTime();
            }

            // Handle string values
            const aString = String(aValue).toLowerCase();
            const bString = String(bValue).toLowerCase();
            
            return order === 'asc' 
                ? aString.localeCompare(bString)
                : bString.localeCompare(aString);
        });
    }, [documents, orderBy, order]);

    const handleSort = (columnId: keyof T & string) => {
        const isAsc = orderBy === columnId && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(columnId);
    };

    // Render functions
    const renderActions = (document: T) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
            {hasImagePath(document) && (
                <Tooltip title="View Image">
                    <IconButton
                        size="small"
                        onClick={() => setSelectedImage(document.image_path)}
                    >
                        <VisibilityIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )}
            <Tooltip title="Delete">
                <IconButton
                    size="small"
                    onClick={() => handleSingleDelete(document.id)}
                >
                    <DeleteIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        </Box>
    );

    const renderCell = (document: T, column: Column<T>) => {
        if (column.id === 'actions') {
            return renderActions(document);
        }

        const key = column.id;
        if (!isStringKey(key)) return null;

        const value = document[key];
        const isEditing = editingCell?.id === document.id && editingCell?.field === key;

        if (column.editable && isEditing) {
            return (
                <EditableCell
                    value={String(value ?? '')}
                    type={column.editType || 'text'}
                    options={column.options}
                    onSave={async (newValue) => {
                        if (isStringKey(key)) {
                            await handleUpdateField(document.id, key, newValue);
                        }
                        setEditingCell(null);
                    }}
                    onBlur={() => setEditingCell(null)}
                    autoFocus
                />
            );
        }

        // Add explicit type casting for Box children
        const displayValue = formatCellValue(value as DocumentValue, column);
        
        return (
            <Box
                onClick={() => {
                    if (column.editable && isStringKey(key)) {
                        handleCellClick(document.id, key);
                    }
                }}
                sx={{ 
                    cursor: column.editable ? 'pointer' : 'default'
                }}
            >
                {displayValue}
            </Box>
        );
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            <TableContainer component={Paper}>
                <TableToolbar
                    type={type}
                    numSelected={selected.length}
                    onDelete={() => setDeleteDialogOpen(true)}
                    filters={filters}
                    onFilterChange={onFilterChange}
                    onSelectAll={handleSelectAll}
                    selected={selected}
                />
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    checked={selected.length > 0}
                                    indeterminate={selected.length > 0}
                                    onChange={handleSelectAll}
                                />
                            </TableCell>
                            {columns.map((column) => (
                                <TableCell
                                    key={String(column.id)}
                                    align={column.align}
                                    style={{ minWidth: column.minWidth }}
                                >
                                    <TableSortLabel
                                        active={orderBy === column.id}
                                        direction={orderBy === column.id ? order : 'asc'}
                                        onClick={() => {
                                            if (column.id !== 'actions' && isStringKey(column.id)) {
                                                handleSort(column.id);
                                            }
                                        }}
                                        sx={{
                                            '& .MuiTableSortLabel-icon': {
                                                opacity: orderBy === column.id ? 1 : 0.5
                                            }
                                        }}
                                    >
                                        {column.label}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedDocuments.map((document) => (
                            <TableRow hover key={document.id}>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={selected.includes(document.id)}
                                        onChange={() => handleSelectOne(document.id)}
                                    />
                                </TableCell>
                                {columns.map((column) => (
                                    <TableCell 
                                        key={String(column.id)} 
                                        align={column.align}
                                        padding="normal"
                                    >
                                        {renderCell(document, column)}
                                    </TableCell>
                                ))}
                                <TableCell align="right">
                                    {renderActions(document)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <ImageViewer
                open={!!selectedImage}
                imageUrl={selectedImage || ''}
                onClose={() => setSelectedImage(null)}
            />

            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete {selected.length} selected document(s)?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button 
                        onClick={handleBulkDelete} 
                        color="error"
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            >
                <Alert severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            <Snackbar
                open={deleteSnackbar.open}
                autoHideDuration={6000}
                onClose={() => setDeleteSnackbar({ ...deleteSnackbar, open: false })}
                message={deleteSnackbar.message}
            />
        </>
    );
} 