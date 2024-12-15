import React from 'react';
import { 
    Box, 
    Typography, 
    Paper,
    CircularProgress
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Receipt } from '@/types';

interface ReceiptDetailProps {
    receiptId: string | string[] | undefined;
}

export default function ReceiptDetail({ receiptId }: ReceiptDetailProps) {
    const [receipt, setReceipt] = useState<Receipt | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (receiptId) {
            fetchReceipt();
        }
    }, [receiptId]);

    const fetchReceipt = async () => {
        try {
            const response = await fetch(`/api/receipts/${receiptId}`);
            if (!response.ok) throw new Error('Failed to fetch receipt');
            const data = await response.json();
            setReceipt(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
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
            <Box sx={{ p: 2 }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    if (!receipt) {
        return (
            <Box sx={{ p: 2 }}>
                <Typography>Receipt not found</Typography>
            </Box>
        );
    }

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Receipt Details
            </Typography>
            <Box sx={{ mt: 2 }}>
                <Typography><strong>Vendor:</strong> {receipt.vendor}</Typography>
                <Typography><strong>Amount:</strong> {receipt.amount}</Typography>
                <Typography><strong>Date:</strong> {receipt.date}</Typography>
                <Typography><strong>Payment Method:</strong> {receipt.payment_method}</Typography>
                <Typography><strong>Category:</strong> {receipt.category}</Typography>
            </Box>
        </Paper>
    );
} 