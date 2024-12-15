import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';
import { api } from '../lib/api';

interface ReceiptDetailProps {
  receiptId: string | string[] | undefined;
}

interface Receipt {
  id: string;
  total: number;
  date: string;
  merchant: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
}

export default function ReceiptDetail({ receiptId }: ReceiptDetailProps) {
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReceipt() {
      if (!receiptId) return;
      
      try {
        setLoading(true);
        const data = await api.fetchReceipt(receiptId);
        setReceipt(data);
      } catch (err) {
        setError('Failed to load receipt details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadReceipt();
  }, [receiptId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!receipt) {
    return (
      <Box>
        <Typography>Receipt not found</Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Receipt Details</Typography>
      
      <Box mb={3}>
        <Typography variant="h6">Merchant: {receipt.merchant}</Typography>
        <Typography>Date: {new Date(receipt.date).toLocaleDateString()}</Typography>
        <Typography>Total: ${receipt.total.toFixed(2)}</Typography>
      </Box>

      <Typography variant="h6" gutterBottom>Items</Typography>
      {receipt.items.map((item, index) => (
        <Box key={index} mb={1}>
          <Typography>
            {item.name} - ${item.price.toFixed(2)} x {item.quantity}
          </Typography>
        </Box>
      ))}
    </Paper>
  );
} 