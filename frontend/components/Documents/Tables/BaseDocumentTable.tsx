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
import { StatusChip } from '../StatusChip';
import { formatCurrency, formatDate } from '@/utils/formatters';
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
    onSelectAll, 
    onDelete,
    filters,
    onFilterChange,
    availableOptions
}: { 
    type: DocumentType;
    numSelected: number;
    onSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onDelete: () => void;
    filters: any;
    onFilterChange: (filters: any) => void;
    availableOptions: Record<string, string[]>;
}) => (
    <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: numSelected > 0 ? 'action.selected' : 'background.paper',
        px: 2,
        py: 1,
    }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Checkbox
                indeterminate={numSelected > 0}
                checked={numSelected > 0}
                onChange={onSelectAll}
            />
            {numSelected > 0 ? (
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
            ) : (
                <Typography variant="h6" component="div">
                    {type}
                </Typography>
            )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <DocumentFilters
                type={type}
                filters={filters}
                onFilterChange={onFilterChange}
                availableOptions={availableOptions}
                variant="toolbar"
            />
        </Box>
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
    const [orderBy, setOrderBy] = useState<string>('');
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
            await documentsApi.updateDocument(documentId, {
                [field]: value
            });
            showSuccess('Document updated successfully');
            await fetchDocuments();
        } catch (error) {
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
        
        if (column.editType === 'amount') {
            return formatCurrency(Number(value));
        }
        
        if (column.editType === 'date') {
            return formatDate(String(value));
        }
        
        if (column.id === 'status') {
            return <StatusChip status={String(value)} />;
        }

        return String(value);
    };

    // Sorting logic from DocumentsTable
    const sortedDocuments = useMemo(() => {
        if (!orderBy) return documents;

        return [...documents].sort((a, b) => {
            const aValue = a[orderBy as keyof T];
            const bValue = b[orderBy as keyof T];

            if (order === 'desc') {
                return bValue > aValue ? 1 : -1;
            }
            return aValue > bValue ? 1 : -1;
        });
    }, [documents, orderBy, order]);

    const handleSort = (columnId: string) => {
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
                        onClick={() => setSelectedImage(document.image_path || null)}
                    >
                        <VisibilityIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )}
            <Tooltip title="Edit">
                <IconButton size="small">
                    <EditIcon fontSize="small" />
                </IconButton>
            </Tooltip>
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
                    onBlur={handleCellBlur}
                    autoFocus
                />
            );
        }

        return (
            <Box
                onClick={() => handleCellClick(document.id, column.id)}
                sx={{ 
                    cursor: column.editable ? 'pointer' : 'default',
                    '&:hover': column.editable ? {
                        backgroundColor: 'action.hover',
                        borderRadius: 1
                    } : {}
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
                    onSelectAll={handleSelectAll}
                    onDelete={() => handleDelete(selected)}
                    filters={filters}
                    onFilterChange={onFilterChange}
                    availableOptions={availableOptions}
                />
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell
                                    key={String(column.id)}
                                    align={column.align}
                                    style={{ minWidth: column.minWidth }}
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedDocuments.map((document) => (
                            <TableRow 
                                hover 
                                key={document.id}
                                selected={selected.includes(document.id)}
                            >
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
                                        sx={{ 
                                            p: 1,
                                            minWidth: column.minWidth 
                                        }}
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

            {/* Image Viewer Dialog */}
            <ImageViewer
                open={!!selectedImage}
                imageUrl={selectedImage || ''}
                onClose={() => setSelectedImage(null)}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete {selected.length} selected document(s)?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button 
                        onClick={() => handleDelete(selected)}
                        color="error"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Notifications */}
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