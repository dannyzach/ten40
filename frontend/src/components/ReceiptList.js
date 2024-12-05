import React, { useState, useEffect } from 'react';
import { 
    List, 
    ListItem, 
    ListItemText, 
    IconButton, 
    Paper, 
    Typography,
    Collapse,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Card,
    CardContent,
} from '@mui/material';
import { Delete, ExpandMore, ExpandLess } from '@mui/icons-material';
import api from '../services/api';

const ReceiptList = ({ onDelete, receipts, setReceipts }) => {
    const [expandedId, setExpandedId] = useState(null);

    const handleDelete = async (id) => {
        try {
            await api.deleteReceipt(id);
            onDelete(id);
        } catch (error) {
            console.error('Error deleting receipt:', error);
        }
    };

    const handleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString();
    };

    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return 'N/A';
        return `$${Number(amount).toFixed(2)}`;
    };

    const renderReceiptContent = (content) => {
        if (!content) return <Typography color="textSecondary">No content available</Typography>;

        return (
            <Box sx={{ mt: 2 }}>
                <Card variant="outlined">
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            {content.store_name || 'Unknown Store'}
                        </Typography>
                        <Typography color="textSecondary" gutterBottom>
                            Date: {formatDate(content.date)}
                        </Typography>

                        {content.items && content.items.length > 0 && (
                            <TableContainer component={Paper} sx={{ mt: 2 }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Item</TableCell>
                                            <TableCell align="right">Quantity</TableCell>
                                            <TableCell align="right">Price</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {content.items.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{item.name}</TableCell>
                                                <TableCell align="right">{item.quantity || 1}</TableCell>
                                                <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}

                        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {content.subtotal && (
                                <Typography>
                                    Subtotal: {formatCurrency(content.subtotal)}
                                </Typography>
                            )}
                            {content.tax && (
                                <Typography>
                                    Tax: {formatCurrency(content.tax)}
                                </Typography>
                            )}
                            {content.total_amount && (
                                <Typography variant="h6">
                                    Total: {formatCurrency(content.total_amount)}
                                </Typography>
                            )}
                        </Box>

                        {/* Display any additional fields */}
                        {Object.entries(content)
                            .filter(([key]) => !['store_name', 'date', 'items', 'subtotal', 'tax', 'total_amount'].includes(key))
                            .map(([key, value]) => (
                                <Typography key={key} color="textSecondary">
                                    {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
                                </Typography>
                            ))}
                    </CardContent>
                </Card>
            </Box>
        );
    };

    return (
        <List>
            {receipts.map((receipt) => (
                <Paper key={receipt.id} elevation={2} sx={{ mb: 2 }}>
                    <ListItem
                        secondaryAction={
                            <IconButton edge="end" onClick={() => handleDelete(receipt.id)}>
                                <Delete />
                            </IconButton>
                        }
                    >
                        <ListItemText
                            primary={
                                <Typography variant="subtitle1">
                                    {receipt.content?.store_name || `Receipt #${receipt.id}`}
                                </Typography>
                            }
                            secondary={
                                <Typography variant="body2" color="textSecondary">
                                    {formatDate(receipt.content?.date)}
                                    {receipt.content?.total_amount && 
                                        ` - ${formatCurrency(receipt.content.total_amount)}`}
                                </Typography>
                            }
                            onClick={() => handleExpand(receipt.id)}
                            style={{ cursor: 'pointer' }}
                        />
                        <IconButton onClick={() => handleExpand(receipt.id)}>
                            {expandedId === receipt.id ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                    </ListItem>
                    <Collapse in={expandedId === receipt.id} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 2 }}>
                            {renderReceiptContent(receipt.content)}
                        </Box>
                    </Collapse>
                </Paper>
            ))}
        </List>
    );
};

export default ReceiptList; 