import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    TableSortLabel,
    Box,
    Typography,
    Tooltip,
    CircularProgress,
    Checkbox,
    Alert,
    Snackbar,
    Fade,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Select,
    MenuItem,
    ClickAwayListener,
    SelectChangeEvent,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { 
    DocumentType, 
    DocumentStatus, 
    Document,
    W2Document,
    Form1099Document,
    ExpenseDocument,
    DonationDocument,
    BaseDocument
} from '@/types';
import { documentsApi } from '../../lib/api/documents';
import { useRouter } from 'next/router';
import { ImageViewer } from '@/components/ImageViewer';
import { DocumentFilter, 
    W2Filter, 
    Form1099Filter, 
    ExpenseFilter, 
    DonationFilter 
} from '@/types/filters';
import { DocumentFilters } from './DocumentFilters';
import { useSearch } from '@/contexts/SearchContext';
import { EditableCell } from './EditableCell';
import { format, parse, isValid } from 'date-fns';
import { enUS } from 'date-fns/locale';

type ColumnId<T> = keyof T;

interface Column<T extends BaseDocument> {
  id: keyof T | 'actions';
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  format?: (value: any) => string;
  editable?: boolean;
  editType?: 'text' | 'date' | 'amount' | 'select';
  options?: string[];
}

type DocumentColumns = {
  'W-2': Column<W2Document>[];
  '1099': Column<Form1099Document>[];
  'Expenses': Column<ExpenseDocument>[];
  'Donations': Column<DonationDocument>[];
};

const COLUMNS: DocumentColumns = {
  'W-2': [
    { id: 'employer', label: 'Employer', minWidth: 170 },
    { 
      id: 'wages',
      label: 'Wages',
      minWidth: 100,
      align: 'right',
      format: (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    },
    { 
      id: 'fedWithholding',
      label: 'Fed Withholding',
      minWidth: 130,
      align: 'right',
      format: (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    },
    { id: 'status', label: 'Status', minWidth: 100, align: 'center' }
  ],
  '1099': [
    { id: 'employer', label: 'Payer', minWidth: 170 },
    { 
      id: 'nonEmpCompensation',
      label: 'Amount',
      minWidth: 100,
      align: 'right',
      format: (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    },
    { id: 'status', label: 'Status', minWidth: 100, align: 'center' }
  ],
  'Expenses': [
    { 
      id: 'vendor',
      label: 'Vendor',
      minWidth: 170,
      editable: true,
      editType: 'text'
    },
    { 
      id: 'amount',
      label: 'Amount',
      minWidth: 100,
      align: 'right',
      editable: true,
      editType: 'amount',
      format: (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    },
    { 
      id: 'date',
      label: 'Date',
      minWidth: 100,
      editable: true,
      editType: 'date',
      format: (value: string) => new Date(value).toLocaleDateString()
    },
    { 
      id: 'payment_method',
      label: 'Payment Method',
      minWidth: 130,
      editable: true,
      editType: 'select',
      options: ['Credit Card', 'Debit Card', 'Cash', 'Check', 'Wire Transfer', 'Other']
    },
    { 
      id: 'category',
      label: 'Expense Type',
      minWidth: 150,
      editable: true,
      editType: 'select',
      options: []
    },
    { 
      id: 'status' as keyof ExpenseDocument,
      label: 'Status',
      minWidth: 100,
      align: 'center',
      editable: true,
      editType: 'select',
      options: [] // Will be populated from backend /options endpoint
    }
  ],
  'Donations': [
    { id: 'charityName', label: 'Charity', minWidth: 170 },
    { 
      id: 'amount',
      label: 'Amount',
      minWidth: 100,
      align: 'right',
      format: (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    },
    { id: 'donationType', label: 'Type', minWidth: 100 },
    { id: 'date', label: 'Date', minWidth: 100 },
    { id: 'status', label: 'Status', minWidth: 100, align: 'center' }
  ],
};

interface DocumentsTableProps {
    type: DocumentType;
    filters: DocumentFilter;
    onFilterChange: (newFilters: DocumentFilter) => void;
}

// Add this type for sorting
type SortComparator = (a: Document, b: Document) => number;

// Add this helper function at the top of the file
const isValidDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date.getTime());
};

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
    filters: DocumentFilter;
    onFilterChange: (filters: DocumentFilter) => void;
    availableOptions: Record<string, string[]>;
}) => (
    <Box
        sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: numSelected > 0 ? 'action.selected' : 'background.paper',
            px: 2,
            py: 1,
        }}
    >
        {/* Left side: Selection and bulk actions */}
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
                        <IconButton 
                            onClick={onDelete}
                            size="small"
                        >
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

        {/* Right side: Filters */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <DocumentFilters
                type={type}
                filters={filters}
                onFilterChange={onFilterChange}
                availableOptions={availableOptions}
                variant="toolbar" // New prop to render in compact mode
            />
        </Box>
    </Box>
);

interface Document {
    id: string;
    type: string;
    image_path: string;
    // ... other document properties
}

export const DocumentsTable: React.FC<DocumentsTableProps> = ({
    type,
    filters,
    onFilterChange,
}) => {
    const router = useRouter();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [orderBy, setOrderBy] = useState<string>('');
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');
    const [error, setError] = useState<string | null>(null);
    const [availableOptions, setAvailableOptions] = useState<Record<string, string[]>>({});
    const { searchQuery } = useSearch();
    const [selected, setSelected] = useState<string[]>([]);
    const [deleteSnackbar, setDeleteSnackbar] = useState({
        open: false,
        message: ''
    });
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [bulkActionStatus, setBulkActionStatus] = useState<{
        show: boolean;
        message: string;
        type: 'success' | 'error';
    }>({ show: false, message: '', type: 'success' });
    const [columns, setColumns] = useState(() => ({
        'W-2': COLUMNS['W-2'],
        '1099': COLUMNS['1099'],
        'Expenses': COLUMNS['Expenses'],
        'Donations': COLUMNS['Donations']
    }));
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const fetchDocuments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await documentsApi.getDocuments();
            if (!response?.data) {
                throw new Error('No data received from server');
            }
            setDocuments(response.data);
        } catch (error) {
            console.error('Error fetching documents:', error);
            setError('Failed to load documents. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Fetch documents
        fetchDocuments();
        
        // Set default sorting
        if (type === 'Expenses') {
            setOrderBy('date');
            setOrder('desc');
        } else {
            setOrderBy('');
            setOrder('asc');
        }
    }, [type]); // Single effect for type changes

    useEffect(() => {
        if (documents.length > 0) {
            const options: Record<string, Set<string>> = {};
            
            documents.forEach(doc => {
                if (doc.type === 'Expenses') {
                    // Collect vendors
                    if (doc.vendor) {
                        options.vendor = options.vendor || new Set();
                        options.vendor.add(doc.vendor);
                    }
                    // Collect payment methods
                    if (doc.payment_method) {
                        options.paymentMethods = options.paymentMethods || new Set();
                        options.paymentMethods.add(doc.payment_method);
                    }
                    // Collect categories
                    if (doc.category) {
                        options.categories = options.categories || new Set();
                        options.categories.add(doc.category);
                    }
                }
                // Add similar collectors for other document types
            });

            // Convert Sets to arrays
            const finalOptions = Object.entries(options).reduce((acc, [key, value]) => {
                acc[key] = Array.from(value).sort();
                return acc;
            }, {} as Record<string, string[]>);

            setAvailableOptions(finalOptions);
        }
    }, [documents]);

    useEffect(() => {
        setSelected([]);
    }, [type]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const response = await fetch('/api/options');
                if (!response.ok) throw new Error('Failed to fetch options');
                const data = await response.json();
                
                // Update the columns with the fetched options
                setColumns(prev => ({
                    ...prev,
                    'Expenses': prev['Expenses'].map(column => {
                        if (column.id === 'category') {
                            return { ...column, options: data.categories || [] };
                        }
                        if (column.id === 'status') {
                            return { ...column, options: data.statuses || [] };
                        }
                        return column;
                    })
                }));
            } catch (error) {
                console.error('Error fetching options:', error);
            }
        };

        fetchOptions();
    }, []);

    const handleApprove = async (documentId: string) => {
        try {
            await documentsApi.approveDocument(documentId, type);
            await fetchDocuments(); // Refresh the list after approval
        } catch (error) {
            console.error('Error approving document:', error);
            // You might want to add error handling UI here
        }
    };

    const handleEdit = (documentId: string) => {
        // For now, just log the action
        console.log('Edit document:', documentId);
    };

    const handleSort = useCallback((columnId: string) => {
        const isAsc = orderBy === columnId && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(columnId);
    }, [orderBy, order]);

    const getFilteredDocuments = useCallback((docs: Document[]) => {
        if (!Array.isArray(docs)) return [];
        
        return docs.filter((doc) => {
            if (doc.type !== type) return false;

            // Handle different document types
            switch (doc.type) {
                case 'W-2': {
                    const w2Filter = filters as W2Filter;
                    const w2Doc = doc as W2Document;
                    
                    if (w2Filter.employer?.length && !w2Filter.employer.includes(w2Doc.employer)) return false;
                    if (w2Filter.wageRange?.min && w2Doc.wages < w2Filter.wageRange.min) return false;
                    if (w2Filter.wageRange?.max && w2Doc.wages > w2Filter.wageRange.max) return false;
                    break;
                }
                case 'Expenses': {
                    const expenseFilter = filters as ExpenseFilter;
                    const expenseDoc = doc as ExpenseDocument;
                    
                    if (expenseFilter.vendor?.length && !expenseFilter.vendor.includes(expenseDoc.vendor)) return false;
                    if (expenseFilter.amountRange?.min && expenseDoc.amount < expenseFilter.amountRange.min) return false;
                    if (expenseFilter.amountRange?.max && expenseDoc.amount > expenseFilter.amountRange.max) return false;
                    if (expenseFilter.paymentMethod?.length && !expenseFilter.paymentMethod.includes(expenseDoc.payment_method)) return false;
                    if (expenseFilter.category?.length && !expenseFilter.category.includes(expenseDoc.category)) return false;
                    break;
                }
                // ... other cases
            }
            return true;
        });
    }, [type, filters]);

    // Add sorting logic
    const getSortedDocuments = useCallback(() => {
        const filtered = getFilteredDocuments(documents);
        if (!orderBy || !Array.isArray(filtered)) return filtered;

        return [...filtered].sort((a, b) => {
            let aValue = a[orderBy as keyof typeof a];
            let bValue = b[orderBy as keyof typeof b];

            // Handle special cases for expense documents
            if (a.type === 'Expenses' && b.type === 'Expenses') {
                // Handle amount sorting
                if (orderBy === 'amount') {
                    aValue = typeof aValue === 'string' 
                        ? parseFloat(aValue.replace(/[^0-9.-]+/g, ''))
                        : aValue;
                    bValue = typeof bValue === 'string' 
                        ? parseFloat(bValue.replace(/[^0-9.-]+/g, ''))
                        : bValue;
                }

                // Handle date sorting
                if (orderBy === 'date') {
                    const aValid = isValidDate(aValue as string);
                    const bValid = isValidDate(bValue as string);

                    // If both dates are invalid, maintain their original order
                    if (!aValid && !bValid) return 0;

                    // In ascending order: invalid dates go to the end
                    // In descending order: invalid dates go to the beginning
                    if (!aValid) return order === 'asc' ? 1 : -1;
                    if (!bValid) return order === 'asc' ? -1 : 1;

                    // Both dates are valid, compare them
                    const aTime = new Date(aValue as string).getTime();
                    const bTime = new Date(bValue as string).getTime();
                    return order === 'asc' ? aTime - bTime : bTime - aTime;
                }
            }

            // Handle null/undefined values
            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;
            if (aValue === bValue) return 0;

            // Handle numeric values
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return order === 'asc' ? aValue - bValue : bValue - aValue;
            }

            // Handle string values
            const aString = String(aValue).toLowerCase();
            const bString = String(bValue).toLowerCase();
            
            return order === 'asc' 
                ? aString.localeCompare(bString)
                : bString.localeCompare(aString);
        });
    }, [documents, getFilteredDocuments, orderBy, order]);

    const renderActions = (document: Document) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Tooltip title="View Receipt">
                <IconButton
                    size="small"
                    onClick={() => setSelectedImage(document.image_path)}
                    sx={{ 
                        color: 'text.secondary',
                        '&:hover': { color: 'primary.main' }
                    }}
                >
                    <VisibilityIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
                <IconButton
                    size="small"
                    onClick={() => handleDelete(document.id)}
                    sx={{ 
                        color: 'text.secondary',
                        '&:hover': { color: 'error.main' }
                    }}
                >
                    <DeleteIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        </Box>
    );

    const filteredDocuments = useMemo(() => 
        getFilteredDocuments(documents), 
        [documents, getFilteredDocuments]
    );

    const sortedDocuments = useMemo(() => 
        getSortedDocuments(), 
        [getFilteredDocuments, orderBy, order, getSortedDocuments]
    );

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelected = documents.map(doc => doc.id);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    const handleClick = (id: string) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected: string[] = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1)
            );
        }

        setSelected(newSelected);
    };

    const handleBulkDelete = async () => {
        if (!selected.length) return;
        
        console.log(`[DocumentsTable] Starting bulk delete for ${selected.length} documents:`, selected);
        setIsDeleting(true);
        try {
            await documentsApi.deleteDocuments(selected);
            console.log('[DocumentsTable] Bulk delete API call successful');
            
            // Only clear selection and refresh if delete was successful
            setSelected([]);
            await fetchDocuments();
            
            setBulkActionStatus({
                show: true,
                message: 'Successfully deleted selected items',
                type: 'success'
            });
            setShowBulkDeleteConfirm(false);
        } catch (error) {
            console.error('[DocumentsTable] Bulk delete error:', error);
            setBulkActionStatus({
                show: true,
                message: error instanceof Error ? error.message : 'Failed to delete selected items',
                type: 'error'
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const renderCell = (document: Document, column: Column<typeof document>) => {
        switch(document.type) {
            case 'W-2':
                return renderW2Cell(document as W2Document, column as Column<W2Document>);
            case 'Expenses':
                return renderExpenseCell(document as ExpenseDocument, column as Column<ExpenseDocument>);
            case '1099':
                return render1099Cell(document as Form1099Document, column as Column<Form1099Document>);
            case 'Donations':
                return renderDonationCell(document as DonationDocument, column as Column<DonationDocument>);
        }
    };

    const handleUpdateField = async (documentId: string, field: string, value: any) => {
        try {
            console.log('[DocumentsTable] handleUpdateField: Starting update:', {
                documentId,
                field,
                value,
                valueType: typeof value
            });
            
            // Format the value based on field type
            let formattedValue = value;
            if (field === 'amount') {
                formattedValue = typeof value === 'string' 
                    ? parseFloat(value.replace(/[^\d.-]/g, ''))
                    : value;
                console.log('[DocumentsTable] Formatted amount value:', formattedValue);
            } else if (field === 'status') {
                // Ensure proper case for status values
                formattedValue = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
                console.log('[DocumentsTable] Formatted status value:', formattedValue);
            }
            
            console.log('[DocumentsTable] Sending update with formatted value:', {
                field,
                formattedValue,
                formattedValueType: typeof formattedValue
            });
            
            // Optimistic update
            setDocuments(prevDocs =>
                prevDocs.map(doc =>
                    doc.id === documentId 
                        ? { ...doc, [field]: formattedValue }
                        : doc
                )
            );
            
            const updates = { [field]: formattedValue };
            const updatedDoc = await documentsApi.updateDocument(documentId, updates);
            
            console.log('[DocumentsTable] Received updated document:', updatedDoc);
            
            // Still fetch to ensure consistency with server
            await fetchDocuments();
        } catch (error) {
            console.error('[DocumentsTable] Update failed:', {
                error,
                documentId,
                field,
                value
            });
            // Revert optimistic update on error
            await fetchDocuments();
            throw error;
        }
    };

    const handleDelete = async (documentId: string) => {
        console.log(`[DocumentsTable] Initiating delete for document: ${documentId}`);
        try {
            await documentsApi.deleteDocument(documentId);
            console.log(`[DocumentsTable] Delete API call successful for document: ${documentId}`);
            // Refresh the documents list after successful delete
            await fetchDocuments();
            setDeleteSnackbar({
                open: true,
                message: 'Document deleted successfully'
            });
        } catch (error) {
            console.error('[DocumentsTable] Error in delete handler:', error);
            setDeleteSnackbar({
                open: true,
                message: error instanceof Error 
                    ? error.message 
                    : 'Failed to delete document. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    // Add these render functions
    const renderExpenseCell = (doc: ExpenseDocument, column: Column<ExpenseDocument>) => {
        if (column.id === 'actions') {
            return renderActions(doc);
        }
        
        const value = doc[column.id];
        if (column.editable) {
            return (
                <EditableCell
                    value={value}
                    type={column.editType || 'text'}
                    options={column.options}
                    onSave={async (newValue) => {
                        await handleUpdateField(doc.id, column.id as string, newValue);
                    }}
                    format={column.format}
                    align={column.align}
                />
            );
        }
        
        return column.format ? column.format(value) : value;
    };

    // Similar functions for other document types
    const renderW2Cell = (doc: W2Document, column: Column<W2Document>) => {
        // Similar implementation
    };

    const render1099Cell = (doc: Form1099Document, column: Column<Form1099Document>) => {
        // Similar implementation
    };

    const renderDonationCell = (doc: DonationDocument, column: Column<DonationDocument>) => {
        // Similar implementation
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
            <Paper 
                variant="outlined" 
                sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    color: 'error.main'
                }}
            >
                <Typography>{error}</Typography>
            </Paper>
        );
    }

    if (documents.length === 0) {
        return (
            <Paper 
                variant="outlined" 
                sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    color: 'text.secondary'
                }}
            >
                <Typography>
                    No {type} documents found
                </Typography>
            </Paper>
        );
    }

    return (
        <>
            <DocumentFilters
                type={type}
                filters={filters}
                onFilterChange={onFilterChange}
                availableOptions={availableOptions}
            />
            <Paper>
                <TableToolbar 
                    type={type}
                    numSelected={selected.length}
                    onSelectAll={handleSelectAllClick}
                    onDelete={handleBulkDelete}
                    filters={filters}
                    onFilterChange={onFilterChange}
                    availableOptions={availableOptions}
                />
                <TableContainer>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox" />
                                {columns[type].map((column) => (
                                    <TableCell
                                        key={column.id}
                                        align={column.align}
                                        style={{ minWidth: column.minWidth }}
                                    >
                                        <TableSortLabel
                                            active={orderBy === column.id}
                                            direction={orderBy === column.id ? order : 'asc'}
                                            onClick={() => handleSort(column.id)}
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
                                <TableRow 
                                    hover 
                                    key={document.id}
                                    selected={selected.includes(document.id)}
                                    sx={{ 
                                        '&:hover': {
                                            bgcolor: 'action.hover',
                                        }
                                    }}
                                >
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selected.includes(document.id)}
                                            onChange={() => handleClick(document.id)}
                                        />
                                    </TableCell>
                                    {columns[type].map((column) => renderCell(document, column))}
                                    <TableCell align="right">
                                        {renderActions(document)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Snackbar
                open={deleteSnackbar.open}
                autoHideDuration={6000}
                onClose={() => setDeleteSnackbar({ ...deleteSnackbar, open: false })}
                message={deleteSnackbar.message}
            />

            <Dialog
                open={showBulkDeleteConfirm}
                onClose={() => setShowBulkDeleteConfirm(false)}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete {selected.length} selected items?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowBulkDeleteConfirm(false)}>
                        Cancel
                    </Button>
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

            {selectedImage && (
                <ImageViewer
                    imagePath={selectedImage}
                    onClose={() => setSelectedImage(null)}
                />
            )}
        </>
    );
}; 