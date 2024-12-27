import React from 'react';
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
    IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';

export interface ExpenseFilter {
    vendor?: string[];
    amountRange?: {
        min?: number;
        max?: number;
    };
    dateRange?: {
        start?: string;
        end?: string;
    };
    paymentMethods?: string[];
    categories?: string[];
    status?: string[];
}

interface ExpenseFiltersProps {
    filters: ExpenseFilter;
    onFilterChange: (filters: ExpenseFilter) => void;
    availableFilters: {
        vendors: string[];
        paymentMethods: string[];
        categories: string[];
        statuses: string[];
    };
}

export const ExpenseFilters: React.FC<ExpenseFiltersProps> = ({
    filters,
    onFilterChange,
    availableFilters
}) => {
    const handleRemoveFilter = (type: keyof ExpenseFilter, value?: string) => {
        const newFilters = { ...filters };
        if (value && Array.isArray(newFilters[type])) {
            newFilters[type] = (newFilters[type] as string[]).filter(v => v !== value);
            if ((newFilters[type] as string[]).length === 0) {
                delete newFilters[type];
            }
        } else {
            delete newFilters[type];
        }
        onFilterChange(newFilters);
    };

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
                        gap: 1 
                    }}>
                        <FilterListIcon />
                        <Typography>Filters</Typography>
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {/* Amount Range */}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Min Amount"
                                type="number"
                                size="small"
                                value={filters.amountRange?.min || ''}
                                onChange={(e) => onFilterChange({
                                    ...filters,
                                    amountRange: {
                                        ...filters.amountRange,
                                        min: e.target.value ? Number(e.target.value) : undefined
                                    }
                                })}
                            />
                            <TextField
                                label="Max Amount"
                                type="number"
                                size="small"
                                value={filters.amountRange?.max || ''}
                                onChange={(e) => onFilterChange({
                                    ...filters,
                                    amountRange: {
                                        ...filters.amountRange,
                                        max: e.target.value ? Number(e.target.value) : undefined
                                    }
                                })}
                            />
                        </Box>

                        {/* Date Range */}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Start Date"
                                type="date"
                                size="small"
                                InputLabelProps={{ shrink: true }}
                                value={filters.dateRange?.start || ''}
                                onChange={(e) => onFilterChange({
                                    ...filters,
                                    dateRange: {
                                        ...filters.dateRange,
                                        start: e.target.value || undefined
                                    }
                                })}
                            />
                            <TextField
                                label="End Date"
                                type="date"
                                size="small"
                                InputLabelProps={{ shrink: true }}
                                value={filters.dateRange?.end || ''}
                                onChange={(e) => onFilterChange({
                                    ...filters,
                                    dateRange: {
                                        ...filters.dateRange,
                                        end: e.target.value || undefined
                                    }
                                })}
                            />
                        </Box>

                        {/* Multi-select filters */}
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            {/* Vendor Select */}
                            <FormControl size="small" sx={{ minWidth: 200 }}>
                                <InputLabel>Vendor</InputLabel>
                                <Select
                                    multiple
                                    value={filters.vendor || []}
                                    onChange={(e) => onFilterChange({
                                        ...filters,
                                        vendor: e.target.value as string[]
                                    })}
                                    label="Vendor"
                                >
                                    {availableFilters.vendors.map((vendor) => (
                                        <MenuItem key={vendor} value={vendor}>
                                            {vendor}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Payment Method Select */}
                            <FormControl size="small" sx={{ minWidth: 200 }}>
                                <InputLabel>Payment Method</InputLabel>
                                <Select
                                    multiple
                                    value={filters.paymentMethods || []}
                                    onChange={(e) => onFilterChange({
                                        ...filters,
                                        paymentMethods: e.target.value as string[]
                                    })}
                                    label="Payment Method"
                                >
                                    {availableFilters.paymentMethods.map((method) => (
                                        <MenuItem key={method} value={method}>
                                            {method}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Category Select */}
                            <FormControl size="small" sx={{ minWidth: 200 }}>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    multiple
                                    value={filters.categories || []}
                                    onChange={(e) => onFilterChange({
                                        ...filters,
                                        categories: e.target.value as string[]
                                    })}
                                    label="Category"
                                >
                                    {availableFilters.categories.map((category) => (
                                        <MenuItem key={category} value={category}>
                                            {category}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>
                </AccordionDetails>
            </Accordion>

            {/* Active Filters Display */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {Object.entries(filters).map(([key, value]) => {
                    if (Array.isArray(value)) {
                        return value.map((v) => (
                            <Chip
                                key={`${key}-${v}`}
                                label={`${key}: ${v}`}
                                onDelete={() => handleRemoveFilter(key as keyof ExpenseFilter, v)}
                                size="small"
                            />
                        ));
                    }
                    if (key === 'amountRange' && value) {
                        const { min, max } = value;
                        if (min || max) {
                            return (
                                <Chip
                                    key="amount"
                                    label={`Amount: ${min || '0'} - ${max || '∞'}`}
                                    onDelete={() => handleRemoveFilter('amountRange')}
                                    size="small"
                                />
                            );
                        }
                    }
                    if (key === 'dateRange' && value) {
                        const { start, end } = value;
                        if (start || end) {
                            return (
                                <Chip
                                    key="date"
                                    label={`Date: ${start || '∞'} - ${end || '∞'}`}
                                    onDelete={() => handleRemoveFilter('dateRange')}
                                    size="small"
                                />
                            );
                        }
                    }
                    return null;
                })}
            </Box>
        </Box>
    );
}; 