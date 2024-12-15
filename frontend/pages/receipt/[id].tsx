import { useRouter } from 'next/router';
import ReceiptDetail from '../../components/ReceiptDetail';
import { Box } from '@mui/material';

export default function ReceiptPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <Box sx={{ p: 3 }}>
      <ReceiptDetail receiptId={id} />
    </Box>
  );
} 