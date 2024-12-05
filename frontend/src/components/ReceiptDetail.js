import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  Button, 
  Paper, 
  Typography,
  CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../services/api';

function ReceiptDetail({ receiptId }) {
  const router = useRouter();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (receiptId) {
      loadReceipt();
    }
  }, [receiptId]);

  const loadReceipt = async () => {
    try {
      const data = await api.getReceipt(receiptId);
      setReceipt(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return (
      <Box>
        <Typography color="error">Error: {error}</Typography>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/')}
        >
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Button 
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push('/')}
        sx={{ mb: 2 }}
      >
        Back to Dashboard
      </Button>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>Receipt Details</Typography>
        
        <Box sx={{ mt: 2 }}>
          <Typography><strong>Receipt ID:</strong> {receipt.id}</Typography>
          <Typography><strong>Amount:</strong> ${receipt.amount?.toFixed(2)}</Typography>
          <Typography><strong>Date:</strong> {receipt.date ? new Date(receipt.date).toLocaleDateString() : 'N/A'}</Typography>
          <Typography><strong>Payor:</strong> {receipt.payor || 'N/A'}</Typography>
          <Typography><strong>Payees:</strong> {receipt.payees || 'N/A'}</Typography>
        </Box>

        {receipt.image_path && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Receipt Image</Typography>
            <img 
              src={`http://localhost:3456/api/images/${receipt.image_path}`} 
              alt="Receipt"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default ReceiptDetail; 