import { useRouter } from 'next/router';
import ReceiptDetail from '../../components/ReceiptDetail';
import { Box } from '@mui/material';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function ReceiptPage() {
  const router = useRouter();
  
  // Wait for the router to be ready and have query parameters
  if (!router.isReady) {
    return <LoadingSpinner />;
  }

  const { id } = router.query;

  return (
    <Box sx={{ p: 3 }}>
      <ReceiptDetail receiptId={id} />
    </Box>
  );
} 