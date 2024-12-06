import React, { useState } from 'react';
import { 
    Paper, 
    Typography, 
    Collapse, 
    IconButton,
    Box,
    List,
    ListItem
} from '@mui/material';
import { ChevronDown, ChevronUp } from "lucide-react";

interface DebugPanelProps {
    messages: string[];
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ messages }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Paper sx={{ mt: 4 }}>
            <Box
                sx={{
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    bgcolor: 'grey.100'
                }}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <Typography variant="subtitle2">
                    Debug Information
                </Typography>
                <IconButton size="small">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </IconButton>
            </Box>
            <Collapse in={isExpanded}>
                <List sx={{ maxHeight: 300, overflow: 'auto', p: 2 }}>
                    {messages.map((message, index) => (
                        <ListItem key={index} sx={{ py: 0.5 }}>
                            <Typography variant="body2" fontFamily="monospace">
                                {message}
                            </Typography>
                        </ListItem>
                    ))}
                </List>
            </Collapse>
        </Paper>
    );
}; 