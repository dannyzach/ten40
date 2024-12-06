import React from 'react';
import { Paper, Typography } from '@mui/material';

interface JsonViewProps {
    data: any;
    isExpanded: boolean;
}

const JsonView: React.FC<JsonViewProps> = ({ data, isExpanded }) => {
    if (!isExpanded) {
        return (
            <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                    cursor: 'pointer',
                    '&:hover': {
                        bgcolor: 'action.hover'
                    },
                    p: 1,
                    borderRadius: 1
                }}
            >
                {data.items?.length || 0} items, 
                Total: ${data.total_amount?.toFixed(2) || '0.00'}
            </Typography>
        );
    }

    return (
        <Paper 
            elevation={0} 
            variant="outlined"
            sx={{ 
                p: 2,
                bgcolor: 'grey.50',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                overflow: 'auto',
                maxHeight: 400,
                cursor: 'pointer'
            }}
        >
            <pre style={{ margin: 0 }}>
                {JSON.stringify(data, null, 2)}
            </pre>
        </Paper>
    );
};

export default JsonView;