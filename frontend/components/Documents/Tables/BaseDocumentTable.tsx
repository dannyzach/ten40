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

// Define allowed value types for document fields
type DocumentValue = string | number | null;

export interface Column<T> {
    id: keyof T | 'actions' | 'category';
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
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as const
    });
    const [editingCell, setEditingCell] = useState<{
        id: number;
        field: keyof T;
    } | null>(null);

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
    const handleDelete = async (ids: number[]) => {
        try {
            await documentsApi.deleteDocuments(ids);
            await fetchDocuments();
            setSelected([]);
            showSuccess('Documents deleted successfully');
        } catch (error) {
            showError('Failed to delete documents');
        }
        setDeleteDialogOpen(false);
    };

    // Update handler
    const handleUpdateField = async (documentId: number, field: keyof T, value: string): Promise<void> => {
        try {
            console.log('[BaseDocumentTable] Starting update:', { documentId, field, value });
            
            // Create update object with proper typing
            const updates = { [field]: value } as Partial<T>;
            
            await documentsApi.updateDocument(documentId, updates);
            await fetchDocuments();
            showSuccess('Document updated successfully');
        } catch (error) {
            console.error('[BaseDocumentTable] Update failed:', error);
            showError('Failed to update document');
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

    const formatCellValue = (value: DocumentValue, column: Column<T>) => {
        if (value == null) return '';
        
        // Handle date formatting
        if (column.editType === 'date') {
            try {
                const date = new Date(value);
                if (isNaN(date.getTime())) return String(value); // Return original if invalid date
                return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });
            } catch {
                return String(value);
            }
        }

        // Handle amount formatting
        if (column.editType === 'amount') {
            const num = Number(value);
            if (!isNaN(num)) {
                return num.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
            }
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

    const handleSort = (columnId: keyof T) => {
        const isAsc = orderBy === columnId && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(columnId);
    };

    // Render functions
    const renderActions = (document: T) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
            {document.image_path && (
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
                    onClick={() => {
                        setSelected([document.id]);
                        setDeleteDialogOpen(true);
                    }}
                >
                    <DeleteIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        </Box>
    );

    const renderCell = (document: T, column: Column<T>) => {
        const value = document[column.id];
        const isEditing = editingCell?.id === document.id && editingCell?.field === column.id;

        if (column.editable && isEditing) {
            return (
                <EditableCell
                    value={String(value ?? '')}
                    type={column.editType || 'text'}
                    options={column.options}
                    onSave={async (newValue) => {
                        await handleUpdateField(document.id, column.id, newValue);
                        setEditingCell(null);
                    }}
                    onBlur={() => setEditingCell(null)}
                    autoFocus
                />
            );
        }

        return (
            <Box
                onClick={() => column.editable && setEditingCell({ id: document.id, field: column.id })}
                sx={{ 
                    cursor: column.editable ? 'pointer' : 'default'
                }}
            >
                {formatCellValue(value as DocumentValue, column)}
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
                                        onClick={() => column.id !== 'actions' && handleSort(column.id as keyof T)}
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
                    <Button onClick={() => handleDelete(selected)} color="error">
                        Delete
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
        </>
    );
} 