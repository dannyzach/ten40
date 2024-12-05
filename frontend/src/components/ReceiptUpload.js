import React, { useState } from 'react';
import { 
    Button, 
    Box, 
    LinearProgress, 
    Typography, 
    Paper,
    Alert,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import api from '../services/api';

const ReceiptUpload = ({ onUploadSuccess }) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [previewReceipt, setPreviewReceipt] = useState(null);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploading(true);
        setError(null);
        setProgress(0);

        try {
            const response = await api.uploadReceipt(file, (progress) => {
                setProgress(progress);
            });

            setPreviewReceipt(response);
            onUploadSuccess(response);
        } catch (error) {
            console.error('Upload error:', error);
            setError('Failed to upload receipt. Please try again.');
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString();
    };

    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return 'N/A';
        return `$${Number(amount).toFixed(2)}`;
    };

    const renderPreview = () => {
        if (!previewReceipt || !previewReceipt.content) return null;

        const content = previewReceipt.content;
        return (
            <Card variant="outlined" sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Upload Successful!
                    </Typography>
                    
                    <Typography variant="subtitle1" gutterBottom>
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
                </CardContent>
            </Card>
        );
    };

    return (
        <Box>
            <input
                accept="image/*"
                style={{ display: 'none' }}
                id="receipt-upload"
                type="file"
                onChange={handleFileUpload}
            />
            <label htmlFor="receipt-upload">
                <Button
                    variant="contained"
                    component="span"
                    startIcon={<CloudUpload />}
                    disabled={uploading}
                >
                    Upload Receipt
                </Button>
            </label>

            {uploading && (
                <Box sx={{ mt: 2 }}>
                    <LinearProgress variant="determinate" value={progress} />
                    <Typography variant="body2" color="textSecondary" align="center">
                        {progress}%
                    </Typography>
                </Box>
            )}

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}

            {renderPreview()}
        </Box>
    );
};

export default ReceiptUpload; 