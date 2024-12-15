import { Alert, Box } from '@mui/material';

interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <Box sx={{ my: 2 }}>
      <Alert severity="error">{message}</Alert>
    </Box>
  );
} 