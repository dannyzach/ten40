import React from 'react';
import { 
    Box, 
    TextField, 
    Select, 
    MenuItem, 
    Button,
    InputLabel,
    FormControl,
    SelectChangeEvent,
} from '@mui/material';
import { DocumentStatus } from '@/types';

interface DocumentsFiltersProps {
    statusFilter: DocumentStatus;
    searchQuery: string;
    onStatusChange: (status: DocumentStatus) => void;
    onSearchChange: (query: string) => void;
    onReset: () => void;
}

export const DocumentsFilters: React.FC<DocumentsFiltersProps> = ({
    statusFilter,
    searchQuery,
    onStatusChange,
    onSearchChange,
    onReset,
}) => {
    const handleStatusChange = (event: SelectChangeEvent) => {
        onStatusChange(event.target.value as DocumentStatus);
    };

    return (
        <Box 
            sx={{ 
                display: 'flex', 
                gap: 2, 
                mb: 3,
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'stretch', sm: 'center' },
            }}
        >
            <FormControl 
                sx={{ 
                    minWidth: { xs: '100%', sm: 200 } 
                }}
            >
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                    labelId="status-filter-label"
                    value={statusFilter}
                    label="Status"
                    onChange={handleStatusChange}
                    size="small"
                >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                </Select>
            </FormControl>

            <TextField
                placeholder="Search in Documents..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                size="small"
                sx={{ 
                    flex: 1,
                    minWidth: { xs: '100%', sm: 300 }
                }}
            />

            <Button
                variant="outlined"
                onClick={onReset}
                sx={{ 
                    minWidth: { xs: '100%', sm: 'auto' }
                }}
            >
                Reset Filters
            </Button>
        </Box>
    );
}; 