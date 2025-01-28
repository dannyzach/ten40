import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Skeleton } from '@mui/material';
import { documentsApi } from '@/lib/api/documents';
import ErrorMessage from './common/ErrorMessage';
import { Receipt } from '../types';

interface ReceiptDetailProps {
  receiptId: string | string[] | undefined;
}

export default function ReceiptDetail({ receiptId }: ReceiptDetailProps) {
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReceipt = async () => {
      if (!receiptId) return;
      
      try {
        setLoading(true);
        const response = await documentsApi.getReceipt(receiptId.toString());
        setReceipt(response.data);
      } catch (err) {
        setError('Failed to load receipt details');
        console.error('Error loading receipt:', err);
      } finally {
        setLoading(false);
      }
    };

    loadReceipt();
  }, [receiptId]);

  if (loading) {
    return <ReceiptSkeleton />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!receipt) {
    return <ErrorMessage message="Receipt not found" />;
  }

  return (
    <Paper elevation={2}>
      <Box p={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              Receipt Details
            </Typography>
            <Typography>
              <strong>Date:</strong> {new Date(receipt.date).toLocaleDateString()}
            </Typography>
            <Typography>
              <strong>Total Amount:</strong> ${receipt.totalAmount.toFixed(2)}
            </Typography>
            <Typography>
              <strong>Vendor:</strong> {receipt.vendor}
            </Typography>
            <Typography>
              <strong>Category:</strong> {receipt.category}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            {receipt.imageUrl && (
              <Box
                component="img"
                src={receipt.imageUrl}
                alt="Receipt"
                sx={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: 1
                }}
              />
            )}
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}

const ReceiptSkeleton = () => (
  <Paper elevation={2}>
    <Box p={3}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Skeleton variant="text" width="60%" height={40} />
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="40%" />
        </Grid>
        <Grid item xs={12} md={6}>
          <Skeleton variant="rectangular" width="100%" height={300} />
        </Grid>
      </Grid>
    </Box>
  </Paper>
); 