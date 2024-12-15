import { useRouter } from 'next/router';
import ReceiptDetail from '../../components/ReceiptDetail';
import { Box, CircularProgress } from '@mui/material';

export default function ReceiptPage() {
  const router = useRouter();
  
  // Wait for the router to be ready and have query parameters
  if (router.isLoading || !router.isReady) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  const { id } = router.query;

  return (
    <Box sx={{ p: 3 }}>
      <ReceiptDetail receiptId={id} />
    </Box>
  );
} 