import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  Button, 
  Paper,
  Typography,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';

function Dashboard() {
  const router = useRouter();
  const [debugOpen, setDebugOpen] = useState(false);
  const [debugMessages, setDebugMessages] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    try {
      const data = await api.getReceipts();
      setReceipts(data);
    } catch (error) {
      addDebugMessage(`Error loading receipts: ${error.message}`);
    }
  };

  const addDebugMessage = (message) => {
    setDebugMessages(prev => [...prev, `${new Date().toISOString()} - ${message}`]);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    addDebugMessage(`Starting upload of ${file.name}`);

    try {
      const data = await api.uploadReceipt(file, (progress) => {
        setUploadProgress(progress);
        addDebugMessage(`Upload progress: ${progress}%`);
      });

      addDebugMessage('Upload completed successfully');
      await loadReceipts();
    } catch (error) {
      addDebugMessage(`Upload error: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      event.target.value = null; // Reset file input
    }
  };

  const handleDelete = async () => {
    if (!selectedReceipt) return;

    try {
      await api.deleteReceipt(selectedReceipt.id);
      addDebugMessage(`Deleted receipt ${selectedReceipt.id}`);
      await loadReceipts();
    } catch (error) {
      addDebugMessage(`Delete error: ${error.message}`);
    } finally {
      setDeleteDialogOpen(false);
      setSelectedReceipt(null);
    }
  };

  const columns = [
    { field: 'id', headerName: 'Receipt ID', width: 130 },
    { 
      field: 'amount', 
      headerName: 'Amount', 
      width: 130,
      valueFormatter: (params) => {
        return params && params.value != null ? `$${params.value.toFixed(2)}` : '';
      }
    },
    { 
      field: 'date', 
      headerName: 'Date', 
      width: 130,
      valueFormatter: (params) => {
        return params && params.value ? new Date(params.value).toLocaleDateString() : '';
      }
    },
    { field: 'payor', headerName: 'Payor', width: 180 },
    { field: 'payees', headerName: 'Payees', width: 180 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 130,
      renderCell: (params) => (
        <Box>
          <Button
            size="small"
            onClick={() => router.push(`/receipt/${params.row.id}`)}
          >
            View
          </Button>
          <Button
            size="small"
            color="error"
            onClick={() => {
              setSelectedReceipt(params.row);
              setDeleteDialogOpen(true);
            }}
          >
            <DeleteIcon />
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <input
          accept="image/jpeg,image/png,application/pdf"
          style={{ display: 'none' }}
          id="receipt-upload"
          type="file"
          onChange={handleFileUpload}
          disabled={isUploading}
        />
        <label htmlFor="receipt-upload">
          <Button
            variant="contained"
            component="span"
            startIcon={<UploadFileIcon />}
            disabled={isUploading}
          >
            Upload Receipt
          </Button>
        </label>
        {isUploading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={uploadProgress} />
          </Box>
        )}
      </Box>

      <Paper sx={{ mb: 4, height: 400 }}>
        <DataGrid
          rows={receipts}
          columns={columns}
          pageSize={20}
          rowsPerPageOptions={[20]}
          disableSelectionOnClick
        />
      </Paper>

      <Box>
        <Button
          onClick={() => setDebugOpen(!debugOpen)}
          variant="outlined"
          size="small"
        >
          {debugOpen ? 'Hide Debug Info' : 'Show Debug Info'}
        </Button>
        <Collapse in={debugOpen}>
          <Paper sx={{ mt: 2, p: 2 }}>
            <Typography variant="h6">Debug Information</Typography>
            {debugMessages.map((message, index) => (
              <Typography key={index} variant="body2">
                {message}
              </Typography>
            ))}
          </Paper>
        </Collapse>
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this receipt? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Dashboard; 