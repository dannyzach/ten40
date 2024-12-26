import React, { useState, useEffect } from 'react';
import {
    Box,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
    Button,
    Menu,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TuneIcon from '@mui/icons-material/Tune';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { DocumentType } from '@/types';
import { DocumentFilter } from '@/types/filters';

interface FilterField {
    type: 'number-range' | 'date-range' | 'multi-select';
    label: string;
    field: string;
    options?: string[]; // For multi-select
}

interface FilterOptions {
    categories: string[];
    payment_methods: string[];
    statuses: string[];
    vendors: string[];
}

const FILTER_CONFIG: Record<DocumentType, FilterField[]> = {
    'W-2': [
        { type: 'multi-select', label: 'Employer', field: 'employer' },
        { type: 'number-range', label: 'Wages', field: 'wageRange' },
        { type: 'number-range', label: 'Withholding', field: 'withHoldingRange' },
        { type: 'date-range', label: 'Date', field: 'dateRange' },
        { type: 'multi-select', label: 'Status', field: 'status' }
    ],
    '1099': [
        { type: 'multi-select', label: 'Employer', field: 'employer' },
        { type: 'number-range', label: 'Amount', field: 'amountRange' },
        { type: 'date-range', label: 'Date', field: 'dateRange' },
        { type: 'multi-select', label: 'Status', field: 'status' }
    ],
    'Expenses': [
        { type: 'multi-select', label: 'Vendor', field: 'vendor' },
        { type: 'number-range', label: 'Amount', field: 'amountRange' },
        { type: 'date-range', label: 'Date', field: 'dateRange' },
        { type: 'multi-select', label: 'Payment Method', field: 'paymentMethod' },
        { type: 'multi-select', label: 'Expense Type', field: 'category' },
        { type: 'multi-select', label: 'Status', field: 'status' }
    ],
    'Donations': [
        { type: 'multi-select', label: 'Charity', field: 'charityName' },
        { type: 'number-range', label: 'Amount', field: 'amountRange' },
        { type: 'multi-select', label: 'Type', field: 'donationType' },
        { type: 'date-range', label: 'Date', field: 'dateRange' },
        { type: 'multi-select', label: 'Status', field: 'status' }
    ]
};

interface DocumentFiltersProps {
    type: DocumentType;
    filters: DocumentFilter;
    onFilterChange: (filters: DocumentFilter) => void;
    variant?: 'default' | 'toolbar';
    availableOptions?: Record<string, string[]>;
}

export const DocumentFilters: React.FC<DocumentFiltersProps> = ({
    type,
    filters,
    onFilterChange,
    variant = 'default',
    availableOptions = {}
}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({
        categories: [],
        payment_methods: [],
        statuses: [],
        vendors: []
    });

    useEffect(() => {
        // Fetch filter options from the backend
        const fetchOptions = async () => {
            try {
                const response = await fetch('/api/options');
                if (!response.ok) {
                    throw new Error('Failed to fetch options');
                }
                const data = await response.json();
                setFilterOptions(data);
            } catch (error) {
                console.error('Error fetching filter options:', error);
            }
        };

        fetchOptions();
    }, []);

    const getOptionsForField = (field: string): string[] => {
        if (!availableOptions) return [];
        
        switch (field) {
            case 'category':
                return availableOptions.categories || [];
            case 'paymentMethod':
                return availableOptions.payment_methods || [];
            case 'status':
                return availableOptions.statuses || [];
            case 'vendor':
                return availableOptions.vendors || [];
            default:
                return [];
        }
    };

    const handleNumberRangeChange = (field: string, bound: 'min' | 'max', value: string) => {
        const numValue = value ? Number(value) : undefined;
        onFilterChange({
            ...filters,
            [field]: {
                ...(filters[field as keyof DocumentFilter] as any || {}),
                [bound]: numValue
            }
        });
    };

    const handleDateRangeChange = (field: string, bound: 'start' | 'end', value: string) => {
        onFilterChange({
            ...filters,
            [field]: {
                ...(filters[field as keyof DocumentFilter] as any || {}),
                [bound]: value || undefined
            }
        });
    };

    const handleMultiSelectChange = (field: string, values: string[]) => {
        onFilterChange({
            ...filters,
            [field]: values
        });
    };

    const handleRemoveFilter = (field: keyof DocumentFilter, value?: string) => {
        const newFilters = { ...filters };
        
        if (value && Array.isArray(newFilters[field])) {
            const currentValues = newFilters[field] as string[];
            newFilters[field] = currentValues.filter(v => v !== value) as any;
            if ((newFilters[field] as string[]).length === 0) {
                delete newFilters[field];
            }
        } else {
            delete newFilters[field];
        }
        onFilterChange(newFilters);
    };

    const handleResetFilters = () => {
        onFilterChange({});
    };

    const renderActiveFilters = () => {
        return (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {FILTER_CONFIG[type].map(field => {
                    const value = filters[field.field as keyof DocumentFilter];
                    if (!value) return null;

                    switch (field.type) {
                        case 'multi-select':
                            return (Array.isArray(value) ? value : []).map(v => (
                                <Chip
                                    key={`${field.field}-${v}`}
                                    label={`${field.label}: ${v}`}
                                    onDelete={() => handleRemoveFilter(field.field as keyof DocumentFilter, v)}
                                    size="small"
                                />
                            ));
                        case 'number-range': {
                            const range = value as { min?: number; max?: number };
                            if (!range.min && !range.max) return null;
                            return (
                                <Chip
                                    key={field.field}
                                    label={`${field.label}: ${range.min || '0'} - ${range.max || '∞'}`}
                                    onDelete={() => handleRemoveFilter(field.field as keyof DocumentFilter)}
                                    size="small"
                                />
                            );
                        }
                        case 'date-range': {
                            const dates = value as { start?: string; end?: string };
                            if (!dates.start && !dates.end) return null;
                            return (
                                <Chip
                                    key={field.field}
                                    label={`${field.label}: ${dates.start || '∞'} - ${dates.end || '∞'}`}
                                    onDelete={() => handleRemoveFilter(field.field as keyof DocumentFilter)}
                                    size="small"
                                />
                            );
                        }
                        default:
                            return null;
                    }
                })}
            </Box>
        );
    };

    const renderFilterField = (field: FilterField) => {
        const filterValue = filters[field.field as keyof DocumentFilter];

        switch (field.type) {
            case 'number-range': {
                const range = filterValue as { min?: number; max?: number } || {};
                return (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label={`Min ${field.label}`}
                            type="number"
                            size="small"
                            value={range.min || ''}
                            onChange={(e) => handleNumberRangeChange(field.field, 'min', e.target.value)}
                        />
                        <TextField
                            label={`Max ${field.label}`}
                            type="number"
                            size="small"
                            value={range.max || ''}
                            onChange={(e) => handleNumberRangeChange(field.field, 'max', e.target.value)}
                        />
                    </Box>
                );
            }

            case 'date-range': {
                const dates = filterValue as { start?: string; end?: string } || {};
                return (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="Start Date"
                            type="date"
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            value={dates.start || ''}
                            onChange={(e) => handleDateRangeChange(field.field, 'start', e.target.value)}
                        />
                        <TextField
                            label="End Date"
                            type="date"
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            value={dates.end || ''}
                            onChange={(e) => handleDateRangeChange(field.field, 'end', e.target.value)}
                        />
                    </Box>
                );
            }

            case 'multi-select':
                return (
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>{field.label}</InputLabel>
                        <Select
                            multiple
                            value={(filterValue as string[]) || []}
                            onChange={(e) => handleMultiSelectChange(field.field, e.target.value as string[])}
                            label={field.label}
                        >
                            {getOptionsForField(field.field).map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );
        }
    };

    if (variant === 'toolbar') {
        return (
            <>
                <Button
                    startIcon={<TuneIcon />}
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    variant="outlined"
                    size="small"
                    endIcon={Object.keys(filters).length > 0 && 
                        <Chip 
                            label={Object.keys(filters).length} 
                            size="small" 
                            color="primary"
                        />
                    }
                >
                    Filters
                </Button>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                    PaperProps={{
                        sx: { width: 400, maxHeight: '80vh' }
                    }}
                >
                    <Box sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {FILTER_CONFIG[type].map(field => (
                                <Box key={field.field}>
                                    {renderFilterField(field)}
                                </Box>
                            ))}
                        </Box>
                        {renderActiveFilters()}
                    </Box>
                </Menu>
            </>
        );
    }

    return (
        <Box sx={{ mb: 2 }}>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ 
                        bgcolor: 'background.default',
                        '&:hover': { bgcolor: 'action.hover' }
                    }}
                >
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        pr: 2
                    }}>
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1 
                        }}>
                            <TuneIcon />
                            <Typography>Filters</Typography>
                        </Box>
                        
                        {Object.keys(filters).length > 0 && (
                            <Button
                                size="small"
                                startIcon={<RestartAltIcon />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleResetFilters();
                                }}
                                sx={{ ml: 2 }}
                            >
                                Reset Filters
                            </Button>
                        )}
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {FILTER_CONFIG[type].map(field => (
                            <Box key={field.field}>
                                {renderFilterField(field)}
                            </Box>
                        ))}
                    </Box>
                </AccordionDetails>
            </Accordion>
            {renderActiveFilters()}
        </Box>
    );
}; 