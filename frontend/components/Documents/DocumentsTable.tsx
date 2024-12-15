import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { DocumentType, DocumentStatus, Document } from '@/types';
import { documentsApi } from '@/lib/api/documents';
import { useRouter } from 'next/router';
import { ImageViewer } from '@/components/ImageViewer';
import { DocumentFilter, W2Filter, Form1099Filter, ExpenseFilter, DonationFilter } from '@/types/filters';
import { DocumentFilters } from './DocumentFilters';
import { useSearch } from '@/contexts/SearchContext';

interface Column {
    id: keyof Document | string;
    label: string;
    minWidth?: number;
    align?: 'left' | 'right' | 'center';
    format?: (value: any) => string;
}

// Column definitions for each document type
const COLUMNS: Record<DocumentType, Column[]> = {
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
        { id: 'vendor', label: 'Vendor', minWidth: 170 },
        { 
            id: 'amount', 
            label: 'Amount', 
            minWidth: 100, 
            align: 'right',
            format: (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
        },
        { 
            id: 'date', 
            label: 'Date', 
            minWidth: 100,
            format: (value: string) => new Date(value).toLocaleDateString()
        },
        { id: 'payment_method', label: 'Payment Method', minWidth: 130 },
        { id: 'expenseType', label: 'Expense Category', minWidth: 150 },
        { id: 'status', label: 'Status', minWidth: 100, align: 'center' }
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
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
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

    useEffect(() => {
        fetchDocuments();
    }, [type]);

    useEffect(() => {
        // Set default sorting when type changes
        if (type === 'Expenses') {
            setOrderBy('date');
            setOrder('desc');
        } else {
            setOrderBy('');
            setOrder('asc');
        }
    }, [type]);

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
                    if (doc.expenseType) {
                        options.categories = options.categories || new Set();
                        options.categories.add(doc.expenseType);
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

    const handleApprove = async (documentId: string) => {
        try {
            await documentsApi.approveDocument(documentId, type);
            await fetchDocuments(); // Refresh the list after approval
        } catch (error) {
            console.error('Error approving document:', error);
            // You might want to add error handling UI here
        }
    };

    const handleViewReceipt = (document: Document) => {
        if (document.type === 'Expenses' && document.originalReceipt?.image_path) {
            setSelectedImage(document.originalReceipt.image_path);
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

    const getFilteredDocuments = () => {
        let filtered = documents;

        // Apply type-specific filters
        switch (type) {
            case 'W-2':
                const w2Filters = filters as W2Filter;
                if (w2Filters.employer?.length) {
                    filtered = filtered.filter(doc => 
                        doc.type === 'W-2' && 
                        w2Filters.employer?.includes(doc.employer)
                    );
                }
                if (w2Filters.wageRange) {
                    const { min, max } = w2Filters.wageRange;
                    filtered = filtered.filter(doc => {
                        if (doc.type !== 'W-2') return false;
                        return (!min || doc.wages >= min) && (!max || doc.wages <= max);
                    });
                }
                if (w2Filters.withHoldingRange) {
                    const { min, max } = w2Filters.withHoldingRange;
                    filtered = filtered.filter(doc => {
                        if (doc.type !== 'W-2') return false;
                        return (!min || doc.fedWithholding >= min) && (!max || doc.fedWithholding <= max);
                    });
                }
                break;

            case '1099':
                const form1099Filters = filters as Form1099Filter;
                if (form1099Filters.employer?.length) {
                    filtered = filtered.filter(doc => 
                        doc.type === '1099' && 
                        form1099Filters.employer?.includes(doc.employer)
                    );
                }
                if (form1099Filters.amountRange) {
                    const { min, max } = form1099Filters.amountRange;
                    filtered = filtered.filter(doc => {
                        if (doc.type !== '1099') return false;
                        return (!min || doc.nonEmpCompensation >= min) && 
                               (!max || doc.nonEmpCompensation <= max);
                    });
                }
                break;

            case 'Donations':
                const donationFilters = filters as DonationFilter;
                if (donationFilters.charityName?.length) {
                    filtered = filtered.filter(doc => 
                        doc.type === 'Donations' && 
                        donationFilters.charityName?.includes(doc.charityName)
                    );
                }
                if (donationFilters.donationType?.length) {
                    filtered = filtered.filter(doc =>
                        doc.type === 'Donations' &&
                        donationFilters.donationType?.includes(doc.donationType)
                    );
                }
                if (donationFilters.amountRange) {
                    const { min, max } = donationFilters.amountRange;
                    filtered = filtered.filter(doc => {
                        if (doc.type !== 'Donations') return false;
                        return (!min || doc.amount >= min) && (!max || doc.amount <= max);
                    });
                }
                break;

            case 'Expenses':
                const expenseFilters = filters as ExpenseFilter;
                
                // Filter by vendor
                if (expenseFilters.vendor?.length) {
                    filtered = filtered.filter(doc => 
                        doc.type === 'Expenses' && 
                        expenseFilters.vendor?.includes(doc.vendor)
                    );
                }

                // Filter by amount range
                if (expenseFilters.amountRange) {
                    const { min, max } = expenseFilters.amountRange;
                    filtered = filtered.filter(doc => {
                        if (doc.type !== 'Expenses') return false;
                        const amount = typeof doc.amount === 'string' 
                            ? parseFloat(doc.amount.replace(/[^0-9.-]+/g, ''))
                            : doc.amount;
                        return (!min || amount >= min) && (!max || amount <= max);
                    });
                }

                // Filter by date range
                if (expenseFilters.dateRange) {
                    const { start, end } = expenseFilters.dateRange;
                    filtered = filtered.filter(doc => {
                        if (doc.type !== 'Expenses') return false;
                        if (!isValidDate(doc.date)) return false;
                        const date = new Date(doc.date).getTime();
                        return (!start || date >= new Date(start).getTime()) && 
                               (!end || date <= new Date(end).getTime());
                    });
                }

                // Filter by payment method
                if (expenseFilters.paymentMethods?.length) {
                    filtered = filtered.filter(doc =>
                        doc.type === 'Expenses' &&
                        doc.payment_method &&
                        expenseFilters.paymentMethods?.includes(doc.payment_method)
                    );
                }

                // Filter by category
                if (expenseFilters.categories?.length) {
                    filtered = filtered.filter(doc =>
                        doc.type === 'Expenses' &&
                        doc.expenseType &&
                        expenseFilters.categories?.includes(doc.expenseType)
                    );
                }
                break;
        }

        // Apply global search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(doc => {
                const searchableValues = Object.values(doc)
                    .filter(value => typeof value === 'string' || typeof value === 'number')
                    .map(value => String(value).toLowerCase());
                return searchableValues.some(value => value.includes(query));
            });
        }

        return filtered;
    };

    // Add sorting logic
    const getSortedDocuments = useCallback(() => {
        const filtered = getFilteredDocuments();
        if (!orderBy) return filtered;

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
    }, [getFilteredDocuments, orderBy, order]);

    const renderActions = (document: Document) => {
        if (document.type === 'Expenses') {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Tooltip title="View Receipt">
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent row click
                                handleViewReceipt(document);
                            }}
                        >
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent row click
                                handleEdit(document.id);
                            }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            );
        }

        return (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Tooltip title="Approve">
                    <IconButton
                        size="small"
                        onClick={() => handleApprove(document.id)}
                        disabled={document.status === 'approved'}
                    >
                        <CheckCircleIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Edit">
                    <IconButton
                        size="small"
                        onClick={() => handleEdit(document.id)}
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>
        );
    };

    const filteredDocuments = useMemo(() => 
        getFilteredDocuments(), 
        [documents, getFilteredDocuments, searchQuery]
    );

    const sortedDocuments = useMemo(() => 
        getSortedDocuments(), 
        [getFilteredDocuments, orderBy, order, getSortedDocuments]
    );

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelected(sortedDocuments.map(doc => doc.id));
        } else {
            setSelected([]);
        }
    };

    const handleSelectOne = (id: string) => {
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
        
        setIsDeleting(true);
        try {
            await documentsApi.deleteDocuments(selected);
            
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
            console.error('Bulk delete error:', error);
            setBulkActionStatus({
                show: true,
                message: error instanceof Error ? error.message : 'Failed to delete selected items',
                type: 'error'
            });
        } finally {
            setIsDeleting(false);
        }
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
                    onSelectAll={handleSelectAll}
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
                                {COLUMNS[type].map((column) => (
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
                                        cursor: 'pointer',
                                        '&:hover': {
                                            bgcolor: 'action.hover',
                                        }
                                    }}
                                    onClick={() => handleViewReceipt(document)}
                                >
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selected.includes(document.id)}
                                            onChange={() => handleSelectOne(document.id)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </TableCell>
                                    {COLUMNS[type].map((column) => {
                                        const value = document[column.id as keyof typeof document];
                                        return (
                                            <TableCell 
                                                key={column.id} 
                                                align={column.align}
                                            >
                                                {column.format && value !== undefined
                                                    ? column.format(value)
                                                    : value}
                                            </TableCell>
                                        );
                                    })}
                                    <TableCell 
                                        align="right"
                                        onClick={(e) => e.stopPropagation()}
                                    >
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

            {selectedImage && (
                <ImageViewer
                    imagePath={selectedImage}
                    onClose={() => setSelectedImage(null)}
                />
            )}

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
        </>
    );
}; 